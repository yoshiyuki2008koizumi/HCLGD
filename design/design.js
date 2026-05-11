// design.js  基本設計
import { cp } from "../childePage.js";
//import { dispTest } from "./dispTest.js";
import { db, } from "../db/dataBase.js";
import { EMSbase } from "./base.js";
//3/20　import { MC } from "../canvas/canvas.js";
import { MC2, A5Hp2 } from "../canvas/canvas2.js";
import { table } from "./table.js";
import { IDB } from "../db/indexdDB.js";
import { MC3 } from "../canvas/canvas3.js"; //debug

const dbdBase = () => IDB.dbd.base;

//import { anDesign } from "../design/acNumDesign_2.js"; //空力計算サンプル

export let mode = {};   //mode
export let dsMode = {}; //設計モード呼び出し
export let mName = "";  //table名

let selectedTd = null;  //最後に選択したテーブル
function clickHandl(e){ //画面全体のクリックを拾うイベント
    if(true){
      if (e.target.tagName === "SELECT" || e.target.closest("select")) {
        return;
      }
    }else{
      if (e.target.closest("td")?.querySelector("select")) {
        if (e.target.closest("select")) return;
      }
    }
  const td = e.target.closest("td");  //クリックされた要素から最も近いtdを取得
  if (td) { 
    if(selectedTd !== td){
      if (selectedTd) {
        selectedTd.classList.remove("active");  // 前回選択されたtdのハイライトを解除
      }
      selectedTd = td;
      if (selectedTd)   //tdがクリックされた場合
        selectedTd.classList.add("active"); // 選択されたtdをハイライト
    }else{
      if (document.activeElement) {
          document.activeElement.blur();
      }
      e.preventDefault(); // ← これ追加
      //return; //同じセルがクリックされたら何もしない
    }
  }
}

const ddDomTable = {
  base:    { oder: ["mw", "hs", "vs"], aria: [0,1,2], tbl: [0,1,2], canvas: [0,1,2] },
  modif:   { oder: ["mw", "hs", "vs"], aria: [0,1,2], tbl: [0,1,2], canvas: [0,1,1] },
  bReinfo: { oder: ["mw", "hs", "vs"], aria: [0,1,2], tbl: [0,1,2], canvas: [0,1,1] },
  mReinfo: { oder: ["top", "back", "mid"], aria: [0,1,2], tbl: [0,1,2], canvas: [0,1,1] },
}
let ddDom = ddDomTable.base;

export function getCanvasId(mode,pat){
  const ix = ddDomTable[mode].oder.indexOf(pat);
  //return "canvas"+  + String(ix);
  return "canvas" + String(ddDomTable[mode].canvas[ix]);
}

// #region 機体情報の制御
async function chgcaBtn(add){  //名前(id)の変更/追加
  const msg = add? "add ": "chg ";
  const newName = document.getElementById("newName").value.trim();  //ターゲット名
  if(newName !== ""){
    if (IDB.dbd.baseList.apList.some(t => t[0] === newName)) {
      alert("機体名" + newName + "は既にあり、作成できません");
      return;
    }
 //   if (!confirm("機体名" + newName + "を作成しますか？")) return ; //ユーザー確認
    domDisp("chgAdd", false)
    if(add){
      await db.addAp(newName);   //既存データで作成 
      db.req({req: "design", apName: newName});
    }else{
      await db.chgAp(newName);   //既存データのid修正
      db.req({req: "design", apName: newName});
    }

  }else
    alert("機体名が有りません");
}
async function saveCurrentTarget() { //編集データの保存　ボタン処理
  if(!saveBtn.disabled){
 cMsg('saveCurrentTarget');
    saveBtn.textContent = "保存中";
    await db.saveAp();  //データ書き込
    saveBtn.disabled = true; saveBtn.textContent = "　　";
  }
}
function chgNameBtn(add){  //名前の変更開始
  const domTx = `
      　機体名変更：
      <input type="text" id="newName" placeholder="変更機体名">
      　<button id="chgcaBtn">変更</button>
      　<button id="endcaBtn">中止</button>
  `;
  domDisp("chgAdd");
  document.getElementById("chgAddDisp").innerHTML = domTx;
  setDomEvent("endcaBtn","click", () => { domDisp("chgAdd", false)});
  setDomEvent("chgcaBtn","click", () => { chgcaBtn(false)});
}
function addNameBtn(){     //新規機体追加
  domDisp("chgAdd", false);
  const domTx = `
      　新機体：
      <input type="text" id="newName" placeholder="新機体名">
      　<button id="chgcaBtn">追加</button>
      　<button id="endcaBtn">中止</button>
  `;
  domDisp("chgAdd");
  document.getElementById("chgAddDisp").innerHTML = domTx;
  setDomEvent("endcaBtn","click", () => { domDisp("chgAdd", false)});
  setDomEvent("chgcaBtn","click", () => { chgcaBtn(true)});
}
// #endregion

// #region 起動処理 childeMap
const chtml = `
<!-- ターゲット選択 -->
<div>
  <div id="chgAdd" style="display: none;">
    <span id="chgAddDisp" >:テスト:</span>
    <hr style="margin-top: 40px;">
  </div>

  <!-- 設計ステップ選択切替ボタン -->
  <label>
    　<select id="dStepSel" class="midSelecｖ">
      <option value="base">基本</option>
      <option value="modif">変形</option>
      <option value="bReinfo">裏補強</option>
      <option value="mReinfo">中補強</option>
    </select>
  </label>
  <button id="dsignSelectBtn">選択</button>

 　表示
  <select id="mdisp" class="midSelecｖ">
    <option value="mw">主翼</option>
    <option value="hs">水平尾翼</option>
    <option value="vs">垂直尾翼</option>
    <option value="body">胴体</option>
    <option value="all">全て</option>
  </select>


  　<button id="baseEndBtn">終了</button>
  　<button id="chgNameBtn">名前変更</button>
  　<button id="addNameBtn">新機体</button>
</div>

<div id="dgnTable"></div>  <!-- 設計テーブル表示 -->

<hr>
　<button id="saveBtn" disabledc>　　</button>
　　　　　　　　　　　　　
差分値 <input id="dcDefValue" type="number" value="5" style="width:5em;"> <!-- ダブルクリック加算値 -->
<button id="tblDelBtn">Delet</button>
<button id="tblLeftBtn">Left(+)</button>
<button id="tblRigthBtn">Rigth(-)</button>
<div class="rowContainer">
  <div class="tableContainer">  <!-- 左側テーブル類 -->
    <div id="dgnTable0">TBL1</div>  <!-- table -->
    <div id="dgnTable1">TBL1</div>
    <div id="dgnTable2">TBL1</div>
    <div id="dgnTable3">TBL1</div>
  </div>
  <div id="canvasBoxP" class="canvasBox"> <!-- 右側 Canvas -->
    <canvas id="baseP"></canvas>
    <canvas id="viewP"></canvas>
    <canvas id="partP"></canvas>
    <canvas id="workP"></canvas>
  </div>
</div>
<hr> 


<div id="canvasBoxA" class="canvasBox">
  <canvas id="baseA"></canvas>
  <canvas id="viewA"></canvas>
  <canvas id="partA"></canvas>
  <canvas id="workA"></canvas>
</div>

`;
function init(initDom = false) {  //初期起動
  if (initDom != false) { //親ページのDOM設定
    setDomEvent("chgNameBtn","click", chgNameBtn);
    setDomEvent("addNameBtn","click", addNameBtn);
    setDomEvent("mdisp","change", mdispChange);
    setDomEvent("baseEndBtn","click", baseEnd);
    document.addEventListener("click", clickHandl); //画面全体のクリックを拾うイベント登録  tableだけに修正5/1
    setDomEvent("tblDelBtn","click", clickTblDel);
    setDomEvent("tblLeftBtn","click", clickTblLeft);
    setDomEvent("tblRigthBtn","click", clickTblRigth);
    setDomEvent("saveBtn","click", saveCurrentTarget);

    MC3.baseInit()
    if(true){
      const sel = document.getElementById("mdisp");

      if (sel) {
        sel.addEventListener("change", e => {
          console.log("CHANGE:", sel.value);
        });

        sel.addEventListener("input", e => {
          console.log("INPUT:", sel.value);
        });

        sel.addEventListener("click", e => {
          console.log("CLICK value:", sel.value);
        });
      }
    }

  }
  chTitle(`基本設計　機種:　` + IDB.dbd.base.id);
  saveBtn.disabled = true; //保存ボタン非表示

  mode = dbdBase().mode; //設計のmode読み出し
  document.getElementById("dStepSel").value = mode; //設計ステップ選択切替ボタン　初期値設定

  ddDom = ddDomTable[mode];
  const registry = {
    base: EMSbase,
  }
  dsMode = registry[mode](mode);
    mName = "mw";
  dsMode.init();

  mdispChange2(document.getElementById("mdisp").value); // table表示切替

//anDesign.init(); 

}

function checkSTD(){  //STDの確認
  if(selectedTd){
    if((selectedTd.dataset.col == 0) || selectedTd.dataset.name.endsWith("_i") ){ //入力セル
      return true
    }
  }
  return false
}

function clickTblDel(e){
  if(selectedTd){
    if(Number(selectedTd.dataset.col) != 0){
      if(selectedTd.dataset.name){
        if(selectedTd.dataset.name.endsWith("_i")){ //入力セル
          selectedTd.textContent = "";
          selectedTd.classList.add("active");
          selectedTd.focus(); // ← これ追加
          e.stopPropagation();
        }
      }
    }
  }
}
function clickTblLR(e,pm){
  if(selectedTd){
    if((selectedTd.dataset.col == 0) ||
        selectedTd.dataset.name.endsWith("_i") ){ //入力セル
      table.handleCellAction(pm, selectedTd);
      e.stopPropagation();
    }
  }
}
function clickTblLeft(e){
  clickTblLR(e,true);
}
function clickTblRigth(e){
  clickTblLR(e,false);
}

function baseEnd(){
 cMsg(`baseEndBtn`);
  if(!saveBtn.disabled){
    if (confirm("更新データが有ります、保存しますか？"))
      saveCurrentTarget();
  }
  document.removeEventListener("click", clickHandl);  //画面全体のクリックを拾うイベント削除
  db.req({req: 'apList'});
}

function mdispChange2(value){ //モジュール付与時切替処理
  if(value != "all"){
    mName = value;
  }
  const  all = (value === "all")? "block": "none";
  for(let i = 0; i < 4; i++){  // 全て非表示して  
 //cMsg (`xx ${i}`)
    document.getElementById("dgnTable"+String(i)).style.display = all;
  }
  if(all === "block")return;

  let id;
  switch(mName){  //必つだけ表示
    case "mw": id = "dgnTable0";   break;
    case "hs": id = "dgnTable1";   break;
    case "vs": id = "dgnTable2";   break;
    case "Body": id = "dgnTable3";   break;
  }
  document.getElementById(id).style.display = "block";  // 表示 
  /* chg モジュール　*/ 
  dsMode.valProc(mName);  //データを修正されたことdsModeに通知
}
function mdispChange(event){ //モジュール選択ボタンcallback
  const value = event.target.value;  // 選択された value
  console.log("選択された値:", value);
  mdispChange2(value)
}

const api  = {
    chtml,
    init,
};
cp.childeMap.design = api; //登録
// #endregion

export const design = {
 init,
 get mName(){ return mName; }, 
 get selectedTd(){return selectedTd; },
};

//end of file