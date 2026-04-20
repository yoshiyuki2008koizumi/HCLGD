//table.js
//import { dbData } from "../db/dataBase.js";
import { dsMode } from "./design.js";
import { BASE } from "./base.js";
import { IDB } from "../db/indexdDB.js";
const dbdBase = () => IDB.dbd.base;


function onCellCommit(info, commit = true) { //入力セル確定callback
 // cMsg(`キー入力 ${JSON.stringify(info)}`);
  dsMode.val[info.pat][info.name] = info.val? info.val: "";   //値の更新
  document.getElementById("saveBtn").disabled = false;        //保存ボタン表示

  if(info.name.endsWith("_i") & commit === true){
    dsMode.valProc(info.pat);  //tableデータを修正されたので再計算
  }
}
function enableInputCells(td, callback) {     //入力セルcallback
 //console.log("enableInputCells fired", performance.now());
  td.contentEditable = true;  // 編集可
  td.style.backgroundColor = "#fff";
  td.dataset.prev = td.textContent; // 元の値を保持

  td.addEventListener("beforeinput", e => {         // キー入力制限（IME中も一部チェック）
    if (e.inputType === "insertText") {
      const char = e.data;
      if (!char.match(/[0-9.\-]/)) {
        e.preventDefault(); // 数字・小数点・マイナス以外は挿入不可
      }
    }
  });
  td.addEventListener("compositionend", e => {      // IME確定後の文字チェック
    let value = td.textContent.trim();
    if (!/^[-]?\d*\.?\d*$/.test(value)) {
      td.textContent = td.dataset.prev; // 元の値に戻す
    }
  });
  td.addEventListener("keydown", e => {               // Enterキーで確定
    if (e.key === "Enter") {
      e.preventDefault();
      td.blur(); // blur に集約
    }
  });
  td.addEventListener("blur", () => {                 //Enter,フォーカス外れ。関数登録
    let value = td.textContent.trim();
    if (!/^[-]?\d*\.?\d*$/.test(value)) {
      value = td.dataset.prev; // 元の値に戻す
    }
    td.textContent = value;
    td.dataset.prev = value; // 新しい確定値を保存
    callback({
      name: td.dataset.name,
      val: Number(value),//value,
      pat: td.closest("table").dataset.block,
    });
  });
}
function handleCellAction(add, td) {  // (左ダブルクリック-false、右クリック=true
 //console.log("handleCellAction fired", performance.now());
//  event.preventDefault(); //いらないはず4/13
//  event.stopPropagation();
const nameTbl = {
  loading_i:      "翼面荷重",
  weight_i:       "重量",
  loading_i_def:  "",
  weight_i_def:   "",
  area_io:        "参考面積",
  ariap_i:        "参考面積％",
  ariap_i_def:    "",
  aspect_i:       "アスペクト比",
  aspect_i_def:   "",
  area_i:         "面積",
  area_i_def:     "",
  hspan_i:         "半翼幅",
  chord_i:        "翼弦",
  hspan_i_def:     "",
  chord_i_def:    "",
  taper_i:        "テーパー比",
  taper_i_def:    "",
  sweep_i:        "後退角",
  sweep_i_def:    "",
  area_o:         "",
  span_o:         "",
  chord_o:        "",
  rootChord_o:    "",
  tipCord_o:      "",
  tipDiff_o:      "",
  sweepDiff_o:    "",
};
  const pat = td.closest("table").dataset.block;
  const ds = td.dataset;
  const row = Number(ds.row);
  const col = Number(ds.col);

  if (ds.col === "0"){  //col==0なら差分値の設定
    const name = dbdBase()[pat][row+1][add? 1: 2];
    if(name.endsWith("_i")){ //差分変数
      let defval = dsMode.val[pat][name+"_def"];
      const newDefVal = document.getElementById("dcDefValue").value;
      const ok = confirm(`${nameTbl[name]} の差分値を ${defval} -> ${newDefVal} に変更しますか？`);
      if(ok)dsMode.val[pat][name+"_def"] = newDefVal;
    }
  }else{
 cMsg(`HCD ${add} ${ds.name}`);
    if (ds.name === "sweep_i"){
      if(dbdBase().base[pat][td.dataset.row][3] !== "後退角度指定")return;
    }
    if (ds.name && ds.name.endsWith("_i")) {
      let defVal =  dsMode.val[pat][ds.name+"_def"] * ((add === true) ? 1 : -1);

      let value = Number(td.textContent) || 0;
      //if(!value)return;
      value += defVal;
      if(value < 0){
        if(td.dataset.adDs !== "enM")
          return;
      }
      td.textContent = value.toFixed(1).replace(/\.0$/, '');
      if (ds.name === "taper_i"){
        const info = {
          name: "sweep_i",
          val: dbdBase().base[pat][Number(td.dataset.row) + 2][3],
          row: Number(td.dataset.row)+2,
          col: 3,
          pat: pat
        };
        //BASE.sweep_pd(dbdBase().base[pat][Number(td.dataset.row) + 2][3]);
        BASE.sweep_pd(info);
        //return;
      }
      onCellCommit({
        name: td.dataset.name,
        val: Number(value),//value,
        pat: td.closest("table").dataset.block,
      });
      //_i変更の更新完了　後退角PD処理
      
    }else if(ds.name == "area_io") {
      setVal(pat, ds.name, dsMode.val["mw"]["area_o"] * dsMode.val[pat]["ariap_i"] / 100);
    }
  }
}
function onCellCommit_pd(info){ //プルダウンのcallback処理
 // cMsg(`xx`)
}

function getTd(pat,name){ //pat,nameのtableを習得
  const table = document.querySelector(`table[data-block="${pat}"]`);  // blockが一致するtableを取得
  return table.querySelector(`td[data-name="${name}"]`); // nameが一致するtdを取得
}
function setVal(pat, name, val, commit = true) { //テーブル変数(含むarray)の設定
  function fNum(n) {  //表示桁数変換
    if (n < 10) return n.toFixed(2);   // 2桁
    if (n <= 80) return n.toFixed(1);   // 1桁
    return Math.round(n).toString(); // 小数なし
  }
  const td = getTd(pat, name);
  if (td) {
    td.textContent = (val === "" || val == null)? "": val.toFixed(1).replace(/\.0$/, '');
  }
  onCellCommit({ name: name, val: val, pat: pat,}, commit);
}
function setColor(pat, name, col = "") { //テーブル変数の色づけ
  const td = getTd(pat, name);
  td.style.backgroundColor = col;
}
function setup(ix,base, pat) {  //テーブル初期表示
  function addTd(name,ds,val){
    const td = getTd(pat, name);
   cMsg (`addTd ${name} ${ds} ${val}`)
    td.dataset[ds] = val;
    // if ("ds" in td.dataset) {   cMsg(td.dataset.ds);  }
  }
  const tableDom = document.getElementById("dgnTable" + String(ix));  //DOM
  tableDom.innerHTML = "";  //クリアテーブル
  const block = dbdBase()[base][pat];        //dbVal.blocks[name];
  const table = document.createElement("table");  //table作成
  table.className = "cell-block";
  table.dataset.block = pat;
  for (let i = 0; i < block.length; i += 2) {   //row
    const row = block[i];
    const row2 = block[i+1];
    const tr = document.createElement("tr");
    for (let j = 0; j < 4; j++) {               //col 0～3
      const td = document.createElement("td");
      td.textContent = row[j] ?? "";
      td.style.padding = "4px";
      td.style.border = "1px solid #666";
      td.style.whiteSpace = "nowrap";
      td.dataset.row = i;
      td.dataset.col = j;
      const name = row2[j];           //セルの変数名
      if(name !== ""){
        td.dataset.name = name;
        const val = dbdBase().val[base][pat][name];
        //td.textContent = val? val: "";  //変数値で初期化
        td.textContent = fNum(val); //val? val: "";  //変数値で初期化
        if(name.includes("_o")){ 
          td.style.backgroundColor = "#e0f7fa"; //出力セル
        }else if(name.endsWith("_i")){ 
          enableInputCells(td, onCellCommit); //キー入力callback登録
        }else if(name.endsWith("_pd")){ 
          dsMode.setup_pd(pat,td,name,onCellCommit_pd);  //プロダウンの設定
        }
      }else{
        if(j){
          td.style.backgroundColor = "#f0f0f0"; //未使用セル
        }
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
    tableDom.appendChild(table);
  }
  addTd("sweep_i","adDs","enM");  //td　dataset追加
//  enableInputCells(onCellCommit); //キー入力設定
  tableDom.addEventListener("dblclick", e => { //左ダブルクリック
//    e.preventDefault();        // ★ 追加これもいらないはず
//    e.stopPropagation();       // ★ 追加

    if (e.button !== 0) return;
    const td = e.target.closest("td");
    if (!td) return;

    handleCellAction(true, td);
  });
  tableDom.addEventListener("contextmenu", e => {  //右クリック
    const td = e.target.closest("td");
    if (!td) return;

    e.preventDefault(); //これは必要
    handleCellAction(false, td);
  });
}

function init(){   //初期起動
//  dTable = table;
}

export const table = {
  init, setup, setVal, setColor, onCellCommit, handleCellAction 
};
//import { table } from "./table.js";
//end of file