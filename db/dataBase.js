// dataBase.js
import { ixDB_ORG } from "./ixDB_ORG.js";
import { ixDB_UPDATE } from "./ixDB_UPDATE.js";
import { DB_NAME, DB_VERSION, STORES} from "./schema.js";
import { cp } from "../childePage.js";
import { ed } from "./db_manage.js";
import { design } from "../design/design.js";
import { enter } from "../entrance.js";
import { apList } from "../apList.js";

export let dbp = null;   //openDB戻り値
export const dbData = {};  //DBデータバッファ

let manege_log = false; //logの表示先切り替えフラグ
function cMsg_SL(...args){  //実行ログメッdbReadセージ　非表示中継
  cMsg2(...args);
  if( manege_log === true){
    ed.showStatus(...args);
  }
}

// #region 子ページ駆動要求処理
function db_enter(obj, ...arg){ //初回起動要求
  ret({ret: obj.req}, ...arg);  //初回起動
}
async function db_apList(obj, ...arg) {  //機体名リスト
  const result = {
    ret: "apList",
    ...dbData.target, // ここでコピー元のプロパティ名をそのまま使う
  };
  ret(result); 
}
async function db_design(obj, ...arg) {  //設計　機体名指定
  //(obj, ...arg);
  await dbRead("design2", obj.apName);  //旧データ
  const result = {
    ret: "design",
  }; 
  result.apInfo = dbData.design2;
  ret({ ret: "design", apInfo: dbData.design2});
}
async function db_db_m(obj, ...arg) {  //DBメンテンナンス
  ret({ ret: "db_m"});
}
async function db_cont(obj, ...arg) {  //DBメンテンナンス
  cMsg(obj, ...arg);
  await dbRead("design2", dbData.target.exc);  //前回機体名
  const result = {
    ret: "design",
  }; 
  result.apInfo = dbData.design2;
  ret({ ret: "design", apInfo: dbData.design2});
}
function db_tcanvas(obj, ...arg){ //canvas Tesr
  ret({ret: "tcanvas"}, ...arg);
}

const reqTable = {  //要求処理関数テーブル
  db_enter,     //起動時選択
  db_apList,     //機体選択
  db_design,    //設計
  db_db_m,      //DBメンテナンス
  db_cont,      //前回の継続
  db_tcanvas,   //canvas test
};
function req(obj = {req: "enter"}, ...args) { //データベース要求
 cMsg(`db.req ` + JSON.stringify(obj, null, 2));

  const dbFunc = "db_"+ obj.req;
  const handler = reqTable[dbFunc];

  if (handler) {
    handler(obj, ...args);    //ret()を呼び出し、子ページ切り替え
  } else {
    throw new Error(`db.req Error ${obj.req}`);
 //   hEerr(`Unknown request: ${obj.req}`);
  }
}
function ret(obj, ...arg){ //db.reqのcallback（子ページの起動）
 //cMsg(`db.ret ` + JSON.stringify(obj, null, 2));

  try {
    let dom = false;
    if (obj.ret !== cp.g_child.ret){  //子ページDOMの切り替え
      dom = true;
//      Object.keys(g_child).forEach(k => delete g_child[k]); //元のリソースは削除
//      Object.assign(g_child, obj);
      const html = cp.childeMap[obj.ret].chtml;
      document.getElementById("childContent").innerHTML = html;
    }
    cp.g_child = obj;
//k    cp.dbVal = obj.new_design ?? {};
//    Object.keys(dbVal).forEach(k => delete g_child[k]); //元のリソースは削除
//    Object.assign(dbVal, obj.new_design ?? {});
//    initDmName();
    childChgMsg.style.display = 'none';      //DB要求表示OFF
    childContent.style.display = 'block';
    requestAnimationFrame(() => {
      setTimeout(() => {cp.childeMap[obj.ret].init(dom);}, 0);  //子ページの起動
    });
    return true;
  } catch (e) {
    console.error("gasRet内で例外:", e, obj.ret);
    throw e; // DOMイベントと同じ挙動
  }
  
}
// #endregion 子ページ駆動要求処理

// #region データベースアクセス
function migrate(db,version){
 cMsg_SL(`ストア作成 ${version}`);
  for (const store of STORES) {
    if (!db.objectStoreNames.contains(store.name)) {
      db.createObjectStore(store.name, {
        keyPath: "id",
 //       autoIncrement: true
      });
 cMsg_SL(` ${store.name} STORE作成`);
    }
  }
}

async function init() {   //IndexDB初期書き込み

  function openDB(name, version) { //Open処理　ストア作成
  cMsg_SL(`🔹DBOpen: ${name}, version: ${version}`);
    indexedDB.databases().then(dbs => {
      console.log("既存DB:", dbs);
    });

  cMsg_SL("openDB 開始直後");
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(name, version);
  cMsg_SL("open 呼び出し直後");
      req.onupgradeneeded = (e) => {
        const db = req.result;
  cMsg_SL("ストア作成");
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store.name)) {
            db.createObjectStore(store.name, {
              keyPath: "id",
  //            autoIncrement: true
            });
  cMsg_SL(` ${store.name} STORE作成`);
          }
        }
      };
      req.onsuccess = () => {
  cMsg_SL("DBオープン成功");
        resolve(req.result);
      };
      req.onerror = () => {
  console.warn("⚠️ DBオープン失敗");
        reject(req.error);
      };
      req.onblocked = () => {
        console.warn("🚫 open blocked（古い接続が残っています）");
      };
    });
  } //openDB

  manege_log = true;
 cMsg_SL("🔹 DB init開始");
  if(dbp !== null){
    dbp.close();   //DB完了
  }
  await deleteDB(DB_NAME);       //DB削除し全て作り直し
  dbp = await openDB(DB_NAME, DB_VERSION, migrate); //Open DB作成

  for (const store of STORES) {                 // ストアごとにデータ登録
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
  dbp.close();   //DB完了
  dbp = null;
 cMsg_SL("🔹 DB 再構成完了");
   manege_log = false;

  await db.dbRead(); cMsg(`読み出し完了`)
} //init
function close(){
  if (dbp) {
 cMsg_SL("🔹 DB close");
    dbp.close();   // ←これ
    dbp = null;
  }
}
async function update() {   //IndexDB更新
  manege_log = true;
 cMsg_SL("🔹 DB init開始");
  if(dbp !== null){
    dbp.close();   //DB完了
  }
  dbp = await openDB(DB_NAME); //Open DB作成

  for (const store of STORES) {                 // ストアごとにデータ登録
    const data = ixDB_UPDATE[store.name];
 cMsg_SL(`${store.name} ストア`, data);
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
  close();
  /*
  dbp.close();   //DB完了
  dbp = null;
  */
 cMsg_SL("🔹 DB 再構成完了");
   manege_log = false;

//  await db.dbRead(); cMsg(`読み出し完了`)
} //update

async function dbRead(store = "all", key = 0) {  //データベースの読み出し
  if (dbp == null) {
    dbp = await openDB(DB_NAME);
  }

  if (store === "all") {
    for (const storeObj of STORES) {
      dbData[storeObj.name] = await readOne(storeObj.name, key);
 //(`${storeObj.name}`, dbData[storeObj.name])
   }
  } else {
    dbData[store] = await readOne(store, key);
  }

  return dbData;
}
async function readOne(sName, key = null) {    //読み出し処理
  return new Promise((resolve, reject) => {
    const tx = dbp.transaction(sName, "readonly");
    const store = tx.objectStore(sName);

    const req = store.get(key === null ? 0 : key);
    req.onsuccess = () => {
      console.log("result:", req.result);
      resolve(req.result ?? null);
    };
    req.onerror = () => reject(req.error);
  });
}
async function dbDelete(sName, id) {
  if (!dbp) {
    dbp = await openDB(DB_NAME);
  }

  return new Promise((resolve, reject) => {
    const tx = dbp.transaction(sName, "readwrite");
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

function dbWrite(store, key = null){
  manege_log = false;
 cMsg(`dbWrite ${store} ${key}`);
}
 
/* ---------- helpers ---------- */
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

function openDB(name, version=undefined, migrate = undefined) { //Open処理　ストア作成
 cMsg_SL(`🔹DBOpen: ${name}, version: ${version}`);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = (e) => {
      if(migrate !== undefined){
        const db = req.result;
        migrate(db,version);
      }else{
 console.warn("⚠️ onupgradeneeded DBオープン失敗");
         reject(req.error);
      }
    };
    req.onsuccess = () => {
 cMsg_SL("DBオープン成功");
      resolve(req.result);
    };
    req.onerror = () => {
 console.warn("⚠️ DBオープン失敗");
      reject(req.error);
    };
    req.onblocked = () => {
      console.warn("🚫 open blocked（古い接続が残っています）");
    };
  });
} //openDB

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
// #endregion データベースアクセス

// #region 機体リスト処理
async function delAp(name=null){   //機体削除
  cMsg(name);
  if(name === null)name = dbData.design2.id;
  dbData.target.apList = dbData.target.apList.filter(item => item[0] !== name); //name要素を削除
  await putData("target", dbData.target);  //targetデータ書き込
  await dbDelete("design2", name);
} //delAp
async function addAp(name, base = null){ //機体データ追加
  cMsg(`${name} ${base}`);

  if(base === "newBase"){
    dbData.design2 = dbData.newBase;    //初期 データ
  }else{
    if(base !== null){  //既存データを元に作成
      await dbRead("design2", base);      //旧データ
      dbData.design2["oldId"] = dbData.design2["id"];
    }
  }
  const created = formatDateLocal();
  dbData["design2"]["date"] = created;  //日付
  dbData.design2["id"] = name;
  if(base !== null)
    dbData.design2["mode"] = "base";
  await putData("design2", dbData.design2);  //データ書き込

  dbData.target.apList.push([name, created]);   //機体名の追加
  await putData("target", dbData.target);  //データ書き込  cp.init(apList);
} //addAp
async function saveAp(){//機体データ保存
  await putData("design2", dbData.design2);  //データ書き込
} //saveAp
async function chgAp(name){//機体データid変更（削除して追加）
  await delAp();  //ターゲット削除
  dbData.design2["id"] = name;  //idの書き換え
  await addAp( name);  //データ書き込
} //chgAp
// #endregion 機体リスト処理

export const db = {
  dbRead,
  init, close, req, update, dbWrite ,dbDelete,
  delAp, addAp, saveAp, chgAp };
//end of file