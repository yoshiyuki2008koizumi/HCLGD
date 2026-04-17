// selList.js  機体選択
import { cp } from "./childePage.js";
import { db, } from "./db/dataBase.js";
import { IDB } from "./db/indexdDB.js";

const baseList = () => IDB.dbd.baseList;

const chtml = `
<h3 id="childTitle>ターゲット作成/切替、削除</h3>
<div>
  <label for="newTname">ターゲット名:</label>
  <input type="text" id="newTname" placeholder="新ターゲット名">
</div>
<div>
  　<select id="dispSel" class="midSelecｖ">
    <option value="date">日付順</option>
    <option value="name">名前順</option>
  </select>　
  <button id="selectBtn" >選択</button>
  <button id="delNameBtn" >削除</button><br>
  <select id="acList" size="10"></select><br>


  
</div>
<button id="toDataBtn">戻る</button>
`;

let nameSort = false;   //ソート指定

function init(initDom = false) {  //子ページの表示
cMsg(`selList`)
  if (initDom != false) { //親ページのDOM設定
    chTitle(`機体選択`);
//    setDomEvent("btn2Start","click", restart, "機体選択");
    setDomEvent("dispSel","change", dispSelect);
    setDomEvent("selectBtn","click", DCButtan);
    setDomEvent("delNameBtn","click", delApList);
  
    //ターゲット名(input)のdelキーの有効化
    const input = document.getElementById("newTname");
    /*
    input.addEventListener("keydown", e => {
      if (e.key === "Delete") {
        e.preventDefault();       // 標準の削除を止める
        e.target.value = "";      // 全部消す
      }
      });
    */
    acList.addEventListener("dblclick", apListDC);  //ダブルクリック有効化
    document.getElementById("toDataBtn").onclick = () => {  //戻るボタン　onclick　イベント
      cp.init()
    }
cMsg(`selList DOM OK`)
  }

  dspApList(); //ターゲットリストの表示
}
function setNameSort(mode){ //日付/名前順ボタンから呼び出し
  nameSort=mode;
 cMsg(`Sort name-${nameSort}`);
  dspApList(); 
}

function dspApList() {  //機体リストの表示
  const sel = document.getElementById("acList");
  sel.innerHTML = ""; //前の値削除

  const rawList = baseList().apList;  //データ入手
  const list = rawList.map(r => ({ name: r[0], created: r[1] }));
  if (nameSort) { //Sort　nameとdate切り替え
    list.sort((a,b) => a.name.localeCompare(b.name, "ja"));
  } else {
    list.sort((a,b) => b.created.localeCompare(a.created));
  }

  const maxLen = Math.max(...list.map(t => t.name.length), 0);
  const columnPos = maxLen + 3; //名前部のカラムをそろえる幅

  const baseOpt = document.createElement("option");
  baseOpt.value = "prototype";
  baseOpt.textContent = "prototype";
  sel.appendChild(baseOpt); //先頭newBase追加

  list.forEach(t => {       //Sort結果の追加
    const opt = document.createElement("option");
    opt.value = t.name;
    opt.textContent =
      t.name.padEnd(columnPos, "\u00A0") + (t.created || "");
    sel.appendChild(opt);
  });
}

async function delApList() {   //機体の削除
cMsg(`delapList`);
  const sel=document.getElementById("acList");
  const name = sel.value;
  if(!name) return;
  if(name==="dataOrg") { alert("dataOrgは削除できません"); return; }
//  if(!confirm(name+" を削除しますか？")) return;
cMsg(`del sheet ${name}`)

//  db.req({req: "delapList", del: name});

  db.delAp(name);
//  baseList().apList = baseList().apList.filter(item => item[0] !== name); //name要素を削除
//  await putData("target", baseList());  //targetデータ書き込
//  await dbDelete("design2", name);

  await db.req({req: `apList`});
  
}

function dispSelect(event){ //リスト表示切替
  const sel = (event.baseList.value === "name")? true: false;
  setNameSort(sel)
}

async function DCSelect(dcName) {  //機体の追加　ダブルクリック処理
 cMsg("ダブルクリック:", dcName);
  if (!dcName) return;

  const input = document.getElementById("newTname");
  const newTname = input.value.trim();  //ターゲット名
  if(newTname) {  //新規作成
    if (baseList().apList.some(t => t[0] === newTname)) {
      alert(newTname + " ターゲットは既にあり、作成できません");
      return;
    }
//    if (!confirm(newTname + " ターゲットを新規作成しますか？")) return ; //ユーザー確認

cMsg(`newTarget:  ${newTname} (dcName: ${dcName})`);
    await db.addAp(newTname, dcName);
    input.value = "";
    db.req({req: `apList`});
  } else {  //ターゲット切り替え　（ターゲット名なし）
    if(dcName == "newBase"){ dcName = null; }
    if(!dcName) {
      alert("新規はターゲット名が必要です");
      return;
    }
cMsg(`target:  ${dcName}`);
    db.req({req: "design", apName: dcName});
  }
}
function DCButtan(){ //ダブルクリックボタン
  const sel=document.getElementById("acList");
  const name = sel.value;
cMsg (`DCButtan ${name}`)
  DCSelect(name);  
}
async function apListDC(event) {  //機体の追加　ダブルクリック処理
  const dcName = event.target.value.trim(); // ダブルクリック名
  DCSelect(dcName);  
}

const api = {
    chtml,
    init,
};
cp.childeMap.apList = api; //登録

export const apList = { init };  //機体選択
//end of file
