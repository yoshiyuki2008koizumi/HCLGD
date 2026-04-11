// db/indexdDB.js IndexedDB 安定管理（単一構成）
//    Copyright 	yoshiyuki2008.koizumi@gmail.com

import { DB_NAME, DB_VERSION, STORES} from "./schema.js";
import { db } from "./dataBase.js";        //★debug
import { ed } from "./db_manage.js";        //★debug
import { ixDB_ORG } from "./ixDB_ORG.js";

let dbp = null;

let manege_log = false; //logの表示先切り替えフラグ
function cMsg_SL(...args){  //実行ログメッdbReadセージ　非表示中継
  cMsg2(...args);
  if( manege_log === true){
    ed.showStatus(...args);
  }
}

function openDB(name = DB_NAME, version = DB_VERSION, stores = null) {
  let  onupdb = null;
  return new Promise((resolve, reject) => {
    let isNew = false;
    const req = indexedDB.open(name, version);  //オープン
    req.onupgradeneeded = (e) => {                //ストア作成要求
      const onupdb = e.target.result;
      isNew = true;
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
  const isNew = await openDB(name, version, stores);  //オープン
  if(isNew){   //初期データ書き込み
    for (const store of stores) {                 // ストアごとにデータ登録
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
  await db.dbRead();  //初期データー読み出し
}

function closeDB() {	// DBクローズ（必須）
  if (dbp) {
    console.log("🔒 DB close");
    dbp.close();
    dbp = null;
  }
}

function deleteDB(name = DB_NAME) {	// DB削除（Android安定版）
 // db.debug();
 // ed.debug();
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
      tx.oncomplete = () => {
        resolve(true);
      };
      tx.onerror = (e) => {
        reject(e.target.error);
      };
      tx.onabort = (e) => {
        reject(e.target.error);
      };
    } catch (e) {
      reject(e);
    }
  });
}
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
/*
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
*/
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


/**********
function openDB() {	//① openDB（初回もここで作られる）
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("MyDB", 1);

    req.onupgradeneeded = (e) => {
      const dbp = e.target.result;

      if (!dbp.objectStoreNames.contains("main")) {
        dbp.createObjectStore("main", { keyPath: "id" });
      }
    };

    req.onsuccess = (e) => {
      resolve(e.target.result);
    };

    req.onerror = () => reject(req.error);
  });
}

async function boot() {	//② 初回起動判定（ここが本体）
  const dbp = await openDB();

  const tx = dbp.transaction("main", "readonly");
  const store = tx.objectStore("main");
  const req = store.getAll();

  req.onsuccess = () => {
    if (req.result.length === 0) {
      console.log("初回起動 → 初期データ作成");
      initDB(dbp);
    }
  };
}

function initDB(dbp) {	//③ 初期化処理
  const tx = dbp.transaction("main", "readwrite");
  const store = tx.objectStore("main");

  store.add({ id: 1, value: "初期データ" });
}
  *****************/
 export const IDB ={
  deleteDB, openDB, openDB_init,
};
//import { IDB } from "./indexdDB.js";
//end of file
