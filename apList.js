// apList.js  機体選択
import { cp } from "./childePage.js";
import { db, dbData } from "./db/dataBase.js";

const chtml = `
<h3 id="childTitle>ターゲット作成/切替、削除</h3>
<div>
  <label for="newTname">ターゲット名:</label>
  <input type="text" id="newTname" placeholder="新ターゲット名">
</div>
<div>
  <select id="acList" size="10"></select><br>
  <button id="dateSortBtn" >日付順</button>
  <button id="nameSortBtn" >名前順</button>
  <button id="delNameBtn" >削除</button>
  
</div>
<button id="toDataBtn">戻る</button>
`;

let nameSort = false;   //ソート指定

function init(initDom = false) {  //子ページの表示
cMsg(`apList`)
  if (initDom != false) { //親ページのDOM設定
    chTitle(`機体選択`);
//    setDomEvent("btn2Start","click", restart, "機体選択");
    setDomEvent("dateSortBtn","click", () => setNameSort(false));
    setDomEvent("nameSortBtn","click", () => setNameSort(true));
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
cMsg(`apList DOM OK`)
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

  const rawList = dbData.target.apList;  //データ入手
  const list = rawList.map(r => ({ name: r[0], created: r[1] }));
  if (nameSort) { //Sort　nameとdate切り替え
    list.sort((a,b) => a.name.localeCompare(b.name, "ja"));
  } else {
    list.sort((a,b) => b.created.localeCompare(a.created));
  }

  const maxLen = Math.max(...list.map(t => t.name.length), 0);
  const columnPos = maxLen + 3; //名前部のカラムをそろえる幅

  const baseOpt = document.createElement("option");
  baseOpt.value = "newBase";
  baseOpt.textContent = "newBase";
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
//  dbData.target.apList = dbData.target.apList.filter(item => item[0] !== name); //name要素を削除
//  await putData("target", dbData.target);  //targetデータ書き込
//  await dbDelete("design2", name);

  await db.req({req: `apList`});
  
}

async function apListDC(event) {  //機体の追加　ダブルクリック処理
  const dcName = event.target.value.trim(); // ダブルクリック名
//  if (!dcName) return;  
//cMsg("ダブルクリック:", dcName);
  const input = document.getElementById("newTname");
  const newTname = input.value.trim();  //ターゲット名
  if(newTname) {  //新規作成
    if (dbData.target.apList.some(t => t[0] === newTname)) {
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

const api = {
    chtml,
    init,
};
cp.childeMap.apList = api; //登録

export const apList = { init };  //機体選択
//end of file
