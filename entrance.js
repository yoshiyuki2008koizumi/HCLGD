// entrance.js  起動処理　(機体選択or前回機能継続指定)
import { cp } from "./childePage.js";
import { ed } from "./db/db_manage.js";
import { db, } from "./db/dataBase.js";
import { IDB } from "./db/indexdDB.js";

// #region ボタン処理
function contBtn() {  //前回起動情報取得
 cMsg(`contBtn`);
  db.req({ req: 'cont' });
}
function apListBtn() {  //設計機体選択取得
 cMsg(`apListBtn`);
  db.req({req: 'apList'});
}
function extBtn() {  //拡張
 cMsg(`extBtn`);
  db.req({ req: 'ext' });
}
function restartBtn(){  //ディバッグ再起動
  db.req();
}

function dbInirextBtn() {  //indexedDB
 db.req({req: "db_m"})
}
function tcanvasBtn() {  //indexedDB
 db.req({req: "tcanvas"})
}
function designBtn(){       //設計
//  db.req({req: "design", apName:  dbData.design2.id});
  db.req({req: "design", apName: IDB.dbd.baseList.exc});
}
window.designBtn = designBtn;
// #endregion

// #region 起動処理 childeMap
const chtml = `
<h3 id="childTitle">初期選択</h3>
<button id="btnapList">機体選択</button>
<button id="btnCont">継続</button>
<button id="btnExt">拡張</button>
<button id="btnDbInit">indexedDB</button>
`;
function init(initDom = false) {    //入り口の初期起動
 cMsg(`init`);
  if (initDom != false) {
    chTitle(`起動選択`);
    setDomEvent("btn1Start","click", restartBtn, "起動選択");
    setDomEvent("btn2Start","click", apListBtn, "機体選択");
    setDomEvent("btn3Start","click", designBtn, "基本設計");
    setDomEvent("btn4Start","click", dbInirextBtn, "DB");
    setDomEvent("btn5Start","click", tcanvasBtn, "Canvas");

    //親ページのDOM設定
    setDomEvent('btnapList', 'click', apListBtn);
    setDomEvent('btnCont', 'click', contBtn);
    setDomEvent('btnExt', 'click', extBtn);
    setDomEvent('btnDbInit', 'click', dbInirextBtn);
  }
}
const api = {
  chtml,
  init,
};
cp.childeMap.enter = api; //登録
// #endregion

export const enter = { init };
//end of file