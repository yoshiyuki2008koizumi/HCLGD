// db/indexdDB.js IndexedDB 安定管理（単一構成）
//    Copyright 	yoshiyuki2008.koizumi@gmail.com

import { DB_NAME, DB_VERSION, STORES} from "./schema.js";
import { db } from "./dataBase.js";        //★debug
import { ed } from "./db_manage.js";        //★debug
import { ixDB_ORG } from "./ixDB_ORG.js";

let dbp = null;
const dbd = {};   //DB読み出しデータ　dbd.xxx

/*
// schema.js　DB管理情報
const DB_NAME = "HCLGD";
let DB_VERSION = 5;

// ストア定義
let STORS = {};
*/
/*
export const STORES = [
  { name: "apInfo", single: true  },   // keyPath省略 → 自動キー
  { name: "prototype", single: true  },
  { name: "baseList", single: true  },
  { name: "base", keyPath: "id", autoIncrement: true   },
];
*/

//export const apInfo = {};     //DBデータバッファ
//export const prototype = {};  //DBデータバッファ
//export const baseList = {};   //DBデータバッファ
//export const base = {};       //DBデータバッファ

let manege_log = false; //logの表示先切り替えフラグ
function cMsg_SL(...args){  //実行ログメッdbReadセージ　非表示中継
  cMsg2(...args);
  if( manege_log === true){
    ed.showStatus(...args);
  }
}
function isTrustedBrowser() { //ブラザー判定　アプリ内ブラウザ系を除外
  const ua = navigator.userAgent;

  // ❌ アプリ内ブラウザ系を除外
  if (/Line\//i.test(ua)) return false;
  if (/FBAN|FBAV/i.test(ua)) return false; // Facebook
  if (/Instagram/i.test(ua)) return false;
  if (/wv/.test(ua)) return false; // Android WebView

  // ✔ 通常ブラウザ判定
  const isChrome = /Chrome/.test(ua) && !/Edg|OPR|Line|wv/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|Edg|Line|wv/.test(ua);

  return isChrome || isEdge || isSafari;
}
function hasIndexedDB() { //indexedDBmoのサポート確認
  return typeof indexedDB !== "undefined";
}
function isAllowedEnvironment() {
  return isTrustedBrowser() && hasIndexedDB();
}
function openDB(name = DB_NAME, version = DB_VERSION, stores = null) {
  let  onupdb = null;
  return new Promise((resolve, reject) => {
    let isNew = null;
    const req = indexedDB.open(name, version);  //オープン
    req.onupgradeneeded = (e) => {                //ストア作成要求
      const onupdb = e.target.result;
      isNew = {
        oldVer: e.oldVersion,
        newVer: e.newVersion
      };
  cMsg_SL(`🔧 upgrade needed`);
      for (const store of stores) {
        if (!onupdb.objectStoreNames.contains(store.name)) {
          onupdb.createObjectStore(store.name, {
            keyPath: "id",
          });
  cMsg_SL(` ${store.name} STORE作成`);
        }
      }
    };
    req.onsuccess = (e) => {  //オープン成功
      dbp = e.target.result;
      console.log("✅ DB open success");
      dbp.onversionchange = () => {    //アップデート要求あり
        console.warn("⚠️ version change → close DB");
        dbp.close();   //自信をクロースし終了
        dbp = null;
      };
      resolve(isNew);
    };
    req.onerror = (e) => {
      reject(error );
    };

    req.onblocked = () => {
      console.warn("🚫 DB open blocked");
    };
  });
}
async function openDB_init(name = DB_NAME, version = DB_VERSION, stores = STORES) {
  if(isAllowedEnvironment() === true){
  const isNew = await openDB(name, version, stores);  //オープン
    if(isNew){   //初期データ書き込み
      let msg;
      if(isNew.oldVer == 0) msg = `初回起動データベースを作成します。`;
      else msg = `データベースをバージョン ${isNew.oldVer} から ${isNew.newVer}に更新しました。`;
      alert(msg)
      for (const store of stores) {   // ストアごとにデータ登録
        const data = ixDB_ORG[store.name];
      cMsg_SL(`${store.name} ストア`);
        if (data === undefined) {
      console.warn(`⚠️ データなし: ${store.name}`);
          continue;
        }
        try {
          await putData(store.name, data);  //データ書き込
      cMsg_SL(` ${store.name} データ登録完了`);
        } catch (e) {
          console.error(`❌ データ登録失敗: ${store.name}`, e);
        }
      }
    }
    closeDB();  //クローズ
    await dbRead();  //初期データー読み出し
  }else{
    alert(`❌ このブラザーでは実行できません。標準のブラザーを利用願います`);
  }
  return true   //環境適合
}

/* 4/20 ダメ版
function openDB(name = DB_NAME, version = DB_VERSION, stores = null) {
  return new Promise((resolve, reject) => {
    let versionInfo = null;   // ★ version情報保持
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      versionInfo = { // ★ バージョン情報を取得
        oldVer: e.oldVersion,
        newVer: e.newVersion
      };
      cMsg_SL(`🔧 upgrade needed ${e.oldVersion} → ${e.newVersion}`);
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(store.name, { keyPath: "id" });
          cMsg_SL(` ${store.name} STORE作成`);
        }
      }
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      dbp = db;
      console.log("✅ DB open success");
      db.onversionchange = () => {
        console.warn("⚠️ version change → close DB");
        db.close();
        dbp = null;
      };
      // ★ 初期化判定（確実）
      let isNew = false;
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store.name)) {
          isNew = true;
          break;
        }
      }
      resolve({
        isNew: isNew,
        versionInfo: versionInfo   // ★ ここで返す
      });
    };
    req.onerror = (e) => {
      console.error("DB error", e.target.error);
      reject(e.target.error);
    };
    req.onblocked = () => {
      console.warn("🚫 DB open blocked");
    };
  });
}
  */
/* 3?回目の修正
function openDB(name = DB_NAME, version = DB_VERSION, stores = null) {

  return new Promise((resolve, reject) => {

    const req = indexedDB.open(name, version);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      let msg;
      if (e.oldVersion === 0) {
        msg = "初回起動データベースを作成します。";
      } else {
        msg = `DB更新 ${e.oldVersion} → ${e.newVersion}`;
      }

      alert(msg);

      for (const store of stores) {
        if (!db.objectStoreNames.contains(store.name)) {

          const os = db.createObjectStore(store.name, { keyPath: "id" });

          // ★ここで初期データを書く
          const data = ixDB_ORG[store.name];
          if (data) {
            for (const row of data) {
              os.add(row);
            }
          }

          cMsg_SL(` ${store.name} STORE作成＋初期データ`);
        }
      }
    };

    req.onsuccess = (e) => {
      dbp = e.target.result;
      resolve();
    };

    req.onerror = (e) => {
      reject(e.target.error);
    };

  });
}
*/
/*
async function openDB_init(name = DB_NAME, version = DB_VERSION, stores = STORES) {
  const result = await openDB(name, version, stores);
  const isNew = result.isNew;
  const v = result.versionInfo;
  if (isNew) {
    alert("初回起動データベースを作成します。");
  }
  // ★ バージョン変更時メッセージ
  if (v && v.oldVer !== 0) {
    alert(`データベースをバージョン ${v.oldVer} から ${v.newVer} に更新しました。`);
  }
  if (isNew) {
    for (const store of stores) {
      const data = ixDB_ORG[store.name];
      cMsg_SL(`${store.name} ストア`);
      if (data === undefined) {
        console.warn(`⚠️ データなし: ${store.name}`);
        continue;
      }
      try {
        await putData(store.name, data);
        cMsg_SL(` ${store.name} データ登録完了`);
      } catch (e) {
        console.error(`❌ データ登録失敗: ${store.name}`, e);
      }
    }
  }
  closeDB();
  await dbRead();
}
*/

function closeDB() {	// DBクローズ（必須）
  if (dbp) {
    console.log("🔒 DB close");
    dbp.close();
    dbp = null;
  }
}


function deleteDB(name = DB_NAME) {	// DB削除（Android安定版）
  return new Promise((resolve, reject) => {
    console.log("🧨 delete start");
    closeDB(); // ★最重要 
    setTimeout(() => {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = () => {
        console.log("✅ delete success");
        resolve();
      };
      req.onerror = (e) => {
        console.error("❌ delete error", e.target.error);
        reject(e.target.error);
      };
      req.onblocked = () => {
        console.warn("🚫 delete blocked（まだDB使用中）");
        reject(new Error("delete blocked"));
      };
    }, 50);
  });
}

async function deleteID(sName, id) {
  if (!IDB.dbp) {
    IDB.dbp = await openDB(DB_NAME);
  }
  console.log(`deleteDB sName=${sName} id=${id}`);

  return new Promise((resolve, reject) => {
    const tx = IDB.dbp.transaction(sName, "readwrite");
    const store = tx.objectStore(sName);

    const req = store.delete(id);

    req.onsuccess = () => {
      console.log(`削除成功 id=${id}`);
      resolve(true);
    };

    req.onerror = () => {
      console.warn("削除失敗:", req.error);
      reject(req.error);
    };
  });
}

/*
function deleteDB(name) {  //DB削除処理
 cMsg_SL(`🔹DB削除: ${name}`);
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => {
 cMsg_SL("DB削除成功");
      resolve();
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
 console.warn("⚠️ delete blocked: 他タブでDB使用中");
      reject(new Error("delete blocked"));
    };
  });
} //deleteDB
*/
/*
function dbRead() {	// DB読み出し
  return new Promise((resolve, reject) => {

    console.log("📖 dbRead start");

    if (!dbp) {
      reject(new Error("DB not opened"));
      return;
    }

    const tx = dbp.transaction("main", "readonly");
    const store = tx.objectStore("main");
    const req = store.getAll();

    req.onsuccess = () => {
      console.log("📖 dbRead success");
      resolve(req.result);
    };

    req.onerror = (e) => {
      console.error("📖 dbRead error", e.target.error);
      reject(e.target.error);
    };
  });
}
  */
async function dbRead(store = "all", key = 0) {  //データベースの読み出し
  if (IDB.dbp == null) {
    //IDB.dbp = await openDB(DB_NAME);
    const ret  = await openDB(DB_NAME);
    cMsg(ret);
  }

  if (store === "all") {
    for (const storeObj of STORES) {
      //dbData[storeObj.name] = await readOne(storeObj.name, key);
      IDB.dbd[storeObj.name] = await readOne(storeObj.name, key);
 //(`${storeObj.name}`, dbData[storeObj.name])
   }
  } else {
    IDB.dbd[store] =  await readOne(store, key);
  }

  return IDB.dbd;
}
async function readOne(sName, key = null) {    //読み出し処理
  return new Promise((resolve, reject) => {
    const tx = IDB.dbp.transaction(sName, "readonly");
    const store = tx.objectStore(sName);

    const req = store.get(key === null ? 0 : key);
    req.onsuccess = () => {
      console.log("result:", req.result);
      resolve(req.result ?? null);
    };
    req.onerror = () => reject(req.error);
  });
}


function putData(storeName, data) {  //DB書き込み
  return new Promise((resolve, reject) => {
    if (!dbp) {
      reject(new Error("DB not opened"));
      return;
    }
    try {
      const tx = dbp.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);

      if (Array.isArray(data)) {  // 単体 / 配列 両対応
        data.forEach(item => store.put(item));
      } else {
        store.put(data);
      }
      tx.oncomplete = () => { resolve(true); };
      tx.onerror = (e) =>   { reject(e.target.error); };
      tx.onabort = (e) =>   { reject(e.target.error); };
    } catch (e) {
      reject(e);
    }
  });
}
/*
function putData(storeName, data, ix = 0) {  //ストア　データ書き込
 cMsg_SL(`🔹putData開始: ${storeName}`);
  return new Promise((resolve, reject) => {
    const tx = IDB.dbp.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

 //    store.clear(); // 古いデータを削除

    if (Array.isArray(data)) {  // 配列の場合は個別追加
      data.forEach(item => store.add(item));
    } else {  // オブジェクト単体で追加
      store.put(data);          // key=0 を明示
    }

    tx.oncomplete = () => {
 //cMsg_SL(` ${storeName} add完了`);
      resolve();
    };
    tx.onerror = (e) => {
 console.warn(`⚠️ txエラー: ${storeName}`, e);
      reject(tx.error);
    };
  });
}
*/
/*
function putData(storeName, data, ix = 0) {  //ストア　データ書き込
 cMsg_SL(`🔹putData開始: ${storeName}`);
  return new Promise((resolve, reject) => {
    const tx = dbp.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

 //    store.clear(); // 古いデータを削除

    if (Array.isArray(data)) {  // 配列の場合は個別追加
      data.forEach(item => store.add(item));
    } else {  // オブジェクト単体で追加
      store.put(data);          // key=0 を明示
    }

    tx.oncomplete = () => {
 //cMsg_SL(` ${storeName} add完了`);
      resolve();
    };
    tx.onerror = (e) => {
 console.warn(`⚠️ txエラー: ${storeName}`, e);
      reject(tx.error);
    };
  });
}
*/
function dbWrite(data) {  //DB書き込み
  return new Promise((resolve, reject) => {

    console.log("✏️ dbWrite start");

    if (!db) {
      reject(new Error("DB not opened"));
      return;
    }

    const tx = db.transaction("main", "readwrite");
    const store = tx.objectStore("main");

    data.forEach(item => store.put(item));

    tx.oncomplete = () => {
      console.log("✏️ dbWrite success");
      resolve();
    };

    tx.onerror = (e) => {
      console.error("✏️ dbWrite error", e.target.error);
      reject(e.target.error);
    };

    tx.onabort = (e) => {
      console.error("✏️ dbWrite abort", e.target.error);
      reject(e.target.error);
    };
  });
}

async function resetDB() {	// DBリセット（再構築）
  console.log("🔁 resetDB start");

  await deleteDB(DB_NAME);

  await openDB(DB_NAME, DB_VERSION);

  console.log("✅ resetDB done");
}

async function boot() {	// 起動フロー
  try {
    console.log("🚀 boot start");

    await openDB();

    const data = await dbRead();

    console.log("📦 data loaded", data);

  } catch (e) {

    console.warn("⚠️ boot error → resetDB", e);

    await resetDB();

  }
}

 export const IDB ={
  deleteDB,
  openDB, openDB_init,
  putData, dbRead, deleteID,
  get dbp(){ return dbp; }, 
  set dbp(val){ dbp = val;}, 
  dbd
};

//import { IDB } from "../db/indexdDB.js";
//end of file
