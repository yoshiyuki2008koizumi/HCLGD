// dataBase.js
//import { ixDB_ORG } from "./ixDB_ORG.js";
import { ixDB_UPDATE } from "./ixDB_UPDATE.js";
import { DB_NAME, DB_VERSION, STORES} from "./schema.js";
import { cp } from "../childePage.js";
import { ed } from "./db_manage.js";
import { design } from "../design/design.js";
import { enter } from "../entrance.js";
import { apList } from "../selList.js";
import { IDB } from "./indexdDB.js";
const baseList = () => IDB.dbd.baseList;
const dbdBase = () => IDB.dbd.base;
const dbdPrototype = () => IDB.dbd.prototype;

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
    ...baseList, // ここでコピー元のプロパティ名をそのまま使う
  };
  ret(result); 
}
async function db_design(obj, ...arg) {  //設計　機体名指定
  //(obj, ...arg);
  await IDB.dbRead("base", obj.apName);  //旧データ
  const result = {
    ret: "design",
  }; 
  result.apInfo = dbdBase();
  ret({ ret: "design", apInfo: dbdBase()});
}
async function db_db_m(obj, ...arg) {  //DBメンテンナンス
  ret({ ret: "db_m"});
}
async function db_cont(obj, ...arg) {  //DBメンテンナンス
  cMsg(obj, ...arg);
  await IDB.dbRead("design2", dbData.target.exc);  //前回機体名
  const result = {
    ret: "design",
  }; 
  result.apInfo = dbdBase();
  ret({ ret: "design", apInfo: dbdBase()});
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

// #region データベースアクセス

// #endregion 子ページ駆動要求処理


async function update() {   //IndexDB更新 4/14多分不要だが今は残す
  manege_log = true;
 cMsg_SL("🔹 DB init開始");
  if(IDB.dbp !== null){
    IDB.dbp.close();   //DB完了
  }
  IDB.dbp = await openDB(DB_NAME); //Open DB作成

  for (const store of STORES) {                 // ストアごとにデータ登録
    const data = ixDB_UPDATE[store.name];
 cMsg_SL(`${store.name} ストア`, data);
    if (data === undefined) {
 console.warn(`⚠️ データなし: ${store.name}`);
      continue;
    }
    try {
      await IDB.putData(store.name, data);  //データ書き込
 cMsg_SL(` ${store.name} データ登録完了`);
    } catch (e) {
      console.error(`❌ データ登録失敗: ${store.name}`, e);
    }
  }
  close();
  /*
  IDB.dbp.close();   //DB完了
  IDB.dbp = null;
  */
 cMsg_SL("🔹 DB 再構成完了");
   manege_log = false;

//  await db.dbRead(); cMsg(`読み出し完了`)
} //update

 
/* ---------- helpers ---------- */

// #endregion データベースアクセス

// #region 機体リスト処理

async function delAp(name=null){   //機体削除
  cMsg(name);
  if(name === null)name = dbdBase().id;
  baseList().apList = baseList().apList.filter(item => item[0] !== name); //name要素を削除
  await IDB.putData("baseList", baseList());  //targetデータ書き込
  await IDB.deleteDB("base", name);
} //delAp
async function addAp(name, abase = null){ //機体データ追加
  cMsg(`${name} ${abase}`);

  if(abase === "prototype"){
    IDB.dbd.base = dbdPrototype();    //初期 データ
  }else{
    if(abase !== null){  //既存データを元に作成
      await IDB.dbRead("base", abase);      //旧データ
      dbdBase()["oldId"] = dbdBase()["id"];
    }
  }
  const created = formatDateLocal();
 // dbData["abase"]["date"] = created;  //日付
  dbdBase()["id"] = name;
  if(abase !== null)
    dbdBase()["mode"] = "base";
  await IDB.putData("base", dbdBase());  //データ書き込

  baseList().apList.push([name, created]);   //機体名の追加
  await IDB.putData("baseList", baseList());  //データ書き込  cp.init(apList);
} //addAp
async function saveAp(){//機体データ保存
  await IDB.putData("design2", dbdBase());  //データ書き込
} //saveAp
async function chgAp(name){//機体データid変更（削除して追加）
  await delAp();  //ターゲット削除
  dbdBase()["id"] = name;  //idの書き換え
  await addAp( name);  //データ書き込
} //chgAp
// #endregion 機体リスト処理

export const db = {

   close, req, update, 
  delAp, addAp, saveAp, chgAp };
//import { db, dbData } from "./dataBase.js";
//import { apInfo, prototype, baseList, } from "./dataBase.js";   // indecedDB データ
//end of file