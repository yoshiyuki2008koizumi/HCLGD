import { DB_NAME, DB_VERSION, STORES} from "./schema.js";
import { db, } from "./dataBase.js";
import { cp } from "../childePage.js";

import { IDB } from "./indexdDB.js";


// HTML UI
const chtml = `
<h3 id="childTitle">IndexedDb管理</h3>
<button id="btnDbInit">初期化</button>
<button id="btnDbUpdate">更新</button>
<button id="btnBackup">バックアップ</button>
<input type="file" id="restoreFile" style="display:none">
<button id="btnRestore">復元</button>
<button id="btnDelete">削除</button>
<button id="btnEnd">終了</button>

<br><br>
<div id="backupStatus" style="white-space: pre-wrap; border:1px solid #ccc; padding:10px; height:300px; overflow:auto;">
  状態表示エリア
</div>
`;

let restoring = false;  //リストア中
let restored = false;   //復元完了、再実行禁止　初期値=false、成功=true

function showStatus(...msgs) {  // 複数メッセージ対応
  const area = document.getElementById("backupStatus");
  if (area) {
    msgs.forEach(msg => {  // msgs は配列になっているので forEach で回す
      area.textContent += msg + "\n";
    });
    area.scrollTop = area.scrollHeight;
  }
}
function clearShowStatus() {  // 複数メッセージ対応
  const area = document.getElementById("backupStatus");
  if (area) {
      area.textContent = "";
    };
}

export function init() {// 初期化
 cMsg(`XX`)
  chTitle(`HCLGD DB`);
//  setDomEvent("btn8Start","click", init, "DB");

  document.getElementById("childContent").innerHTML = chtml;

  setDomEvent('btnDbInit', 'click', initDB);
  setDomEvent('btnBackup', 'click', backupDB);
  setDomEvent('btnDbUpdate', 'click', updateDB);
  setDomEvent('btnDelete', 'click', deleatDB);

  // 復元ボタン
  setDomEvent('btnRestore', 'click', () => {
    if (restored) {
      showStatus("　　★★すでに復元済みです★★"); // 2回目以降は注意表示のみ
      return;
    }
    const fileInput = document.getElementById("restoreFile");
    fileInput.value = ""; // 前回と同じファイルでもchange発火
    fileInput.click();
  });

  document.getElementById("restoreFile").addEventListener("change", restoreDB);
  setDomEvent('btnEnd', 'click', close);
}

async function deleatDB(){
  showStatus("削除開始...");

  try {
    await IDB.deleteDB();
    showStatus("削除完了");
  } catch (e) {
    showStatus("削除失敗: " + e.message);
  }
}
/*
  function deleatDB(){
  showStatus("削除開始...");
  IDB.deleteDB();
  showStatus("削除完了");
}
*/
async function initDB(){  // 初期化
  showStatus("初期化開始...");
  await IDB.openDB_init(DB_NAME, DB_VERSION, STORES);

  showStatus("初期化完了");
}

async function updateDB(){  // 更新
  showStatus("更新開始...");
  clearShowStatus();
  await db.update();
  showStatus("更新完了");

  await db.dbRead();
  showStatus(`読み出し完了`);
}

async function backupDB() { // バックアップ
  function formatJSON(value, indent = 0) {
    const space = "  ".repeat(indent);
    if (Array.isArray(value)) {    // 配列
      // 要素が「配列でもオブジェクトでもない」場合 → 1行
      if (value.every(v => !Array.isArray(v) && typeof v !== "object")) {
        return `[ ${value.map(v => JSON.stringify(v)).join(", ")} ]`;
      }
      // それ以外（外側配列など）→ 改行あり
      return `[\n${value
        .map(v => space + "  " + formatJSON(v, indent + 1))
        .join(",\n")}\n${space}]`;
    }else if (typeof value === "object" && value !== null) {// オブジェクト
      return `{\n${Object.entries(value)
        .map(([k, v]) =>
          `${space}  "${k}": ${formatJSON(v, indent + 1)}`
        )
        .join(",\n")}\n${space}}`;
    }else{
      return JSON.stringify(value);  // 文字列・数値など
    }
  }
  //ここから本処理
  showStatus("バックアップ開始...");
  clearShowStatus();
  const db = await new Promise((resolve, reject) => { //Open
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const data = {};
  const tx = db.transaction(db.objectStoreNames, "readonly");

  await Promise.all(                                  //getall
    Array.from(db.objectStoreNames).map(storeName => {
      return new Promise((resolve, reject) => {
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          data[storeName] = req.result;
          showStatus(`ストア "${storeName}" を取得 (${req.result.length}件)`);
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    })
  );

  const json = formatJSON(data);                    //データの整形処理
  const blob = new Blob([json], { type: "application/json" });

  const a = document.createElement("a");            //データのダウンロード
  a.href = URL.createObjectURL(blob);
  a.download = DB_NAME + "_backup.json";  //ファイル名
  a.click();
  showStatus("バックアップ完了");
}

async function restoreDB(event) { // 復元
  if (restoring) return; // 復元中は無視

  db.close()
  /*
  if (dbp) {
    dbp.close();   // ←これ
    dbp = null;
  }
    */

  clearShowStatus();
  const file = event.target.files?.[0];
  if (!file) return;

  restoring = true;
  try {
    showStatus("復元開始...");
    const text = await file.text();
    const jsonData = JSON.parse(text);

    // DB削除
    await new Promise((resolve, reject) => {
      const delReq = indexedDB.deleteDatabase(DB_NAME);
      delReq.onsuccess = resolve;
      delReq.onerror = () => reject(delReq.error);
      delReq.onblocked = () => showStatus("復元中: ブロックされています");
    });

    // DB作成
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        for (const s of STORES) {
          const opts = s.keyPath ? { keyPath: s.keyPath } : { autoIncrement: true };
          db.createObjectStore(s.name, opts);
          showStatus(`ストア "${s.name}" を作成`);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    // データ書き込み
    const tx = db.transaction(Object.keys(jsonData), "readwrite");
    for (const storeName of Object.keys(jsonData)) {
      const store = tx.objectStore(storeName);
      jsonData[storeName].forEach(item => store.put(item));
      showStatus(`ストア "${storeName}" に ${jsonData[storeName].length} 件書き込み`);
    }

    await new Promise((res, rej) => {
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });

    showStatus("復元完了");
   // alert("復元完了です"); // 初回のみ
    restored = true;

  } catch (e) {
    console.error(e);
    alert("復元中にエラーが発生しました");
  } finally {
    restoring = false;
  }
}

async function close() {  //終了
    db.req();   // init
}

const api = {
  chtml,
  init,
};
cp.childeMap.db_m = api; //登録

export const ed = { init, showStatus, clearShowStatus };
//import { ed } from "./db_manage.js";
