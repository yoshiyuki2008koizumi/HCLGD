// start.js
import { db, } from "./db/dataBase.js";
import { cp } from "./childePage.js";
import { parts } from "./parts/parts.js";
//import { anDesign } from "./design/acNumDesign_2.js"; //空力計算サンプル
import { IDB } from "./db/indexdDB.js";

const upDbg = `
<!-- デバッグ/操作ボタン -->　　
<button id="btn1Start" ></button>
<button id="btn2Start" ></button>
<button id="btn3Start" ></button>
<button id="btn4Start" ></button>
<button id="btn5Start" ></button>
<button id="btn6Start" ></button>
<button id="btn7Start" ></button>
<button id="btn8Start" ></button>
<button id="btn9Start" ></button>
<button id="btn10Start" ></button>
<button id="btn11Start" ></button>
<button id="btnEndEtc2" ></button>
`;
/*
<button id="btn1Start" style="display:none;></button>
<button id="btn2Start" style="display:none;></button>
<button id="btn3Start" style="display:none;></button>
<button id="btn4Start" style="display:none;></button>
<button id="btn5Start" style="display:none;></button>
<button id="btn6Start" style="display:none;></button>
<button id="btn7Start" style="display:none;></button>
<button id="btn8Start" style="display:none;></button>
<button id="btnEndEtc2" style="display:none;>endEtc2</button>
*/

console.log("start.js")
async function init(initDom = false) {
 cMsg(`start.init`);


  if (initDom) { //親ページのDOM設定
 cMsg(`　 set DOM`)

    setDomEvent("btn1Start","click", () => cp.init(), "初期選択");

/*
    setDomEvent("btn2Start","click", () => switchPage(htmlDesign_main));
    setDomEvent("btn3Start","click", () => switchPage(htmlDesignChange));
    setDomEvent("btn4Start","click", () => switchPage(htmlDesign_ext));
    setDomEvent("btn5Start","click", () => switchPage(''));
    
    setDomEvent("btn6Start","click", iTest);
    setDomEvent("btn7Start","click", iTest1);
    setDomEvent("btn8Start","click", iTest2);

    const errDisp = document.getElementById("errDisp"); //エラー非表示
    errDisp.innerHTML = errMsgHtml;
    errDisp.style.display = "none";

    const errArea = document.getElementById("errorBox");  //エラー表示
    document.getElementById("btnClearErr").addEventListener("click", () => {
      errArea.textContent = ""; //エラー表示を消す
      errDisp.style.display = "none";   //クリックで非表示(エラー時表示し)
    });
*/
  }
  
  cMsg(`Stest`);

/*
//  await rebuildDB();   // ← 今 or 将来 IndexedDB を触るなら必須

  document.getElementById("childContent").innerHTML = chtml;  //子ページ


  const iframe = document.getElementById("oldApp");

  setDomEvent("btnHide","change", (e) => { //select 停止/継続
    iframe.style.display = e.target.value;
  });
*/
}

async function db_dbRead(){
  if(10){
 // debugger
    await IDB.openDB_init();//DB_NAME, DB_VERSION, STORES);
 // dbData.target.exc = "aaa";   // debug★★
  }
}


//script rootアプリの開始
window.addEventListener("DOMContentLoaded", async () => {
  setAppStart();  //アプリの実行前認識識

  setDomEvent("reloadBtn","click", () => {  //再起動ボタン
    location.reload(true);
  });
  chTitle(`start`,upDbg); //ディバッグボタン設定

  const iframe = document.getElementById("oldApp");     //旧アプリ表示
  setDomEvent("btnOld","click", () => {
    iframe.src = "OLD_VSC/old.html";
    iframe.style.display = "block";
  });
  setDomEvent("btnHide","change", (e) => { //旧アプリフレーム 停止/継続
    iframe.style.display = e.target.value;
  });

  document.getElementById("title").textContent = "Hand Catapult Launch Glider Design";; //タイトル名

 //   debugger
 // anDesign.init(); 
  parts.dbgBtn();
  db_dbRead();

  cMsg(`初期　読み出し完了`);
 
  switch(0){
//    case 0: cp.init();   break;          //初期起動
    case 0: db.req();   break;          //初期起動
    case 1: cp.init('apList');   break;  //機体選択　デバッグ
  //  case 2: ed.init();  break;        //バックアップ・復元テスト
   case 9: cp.init("apList");
  }
});

//end of file