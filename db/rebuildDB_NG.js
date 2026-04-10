// db/rebuildDB.js
import { ixDB_ORG } from  "./ixDB_ORG.js";
import { DB_NAME, DB_VERSION, stores } from "./schema.js";

export async function rebuildDB() { //データベースを削除して作り直し
  cMsg(`DB再構成`);
  const xx = ixDB_ORG;
  await deleteDB(DB_NAME);    //DB削除
  const db = await openDB(DB_NAME, DB_VERSION); //作成開始
  /*
  for (const [storeName, data] of Object.entries(seedData)) {
//      await putData(db, storeName, data);
  }
  */
  for (const store of stores) {
    cMsg(`xx ${store.name}`)
    await putData(db, store.name, ixDB_ORG[store.name]);
/*
    if (!db.objectStoreNames.contains(store.name)) {
      db.createObjectStore(
        store.name,
        store.keyPath ? { keyPath: store.keyPath } : { autoIncrement: true }
      );
      cMsg(`　${store.name}作成`)
    }
*/
  }
  db.close(); //作成終了
  console.log("✅ DB Close Rebuild complete");
}

/* ---------- helpers ---------- */

function deleteDB(name) { //DB削除処理
  cMsg(` DB削除`);
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => resolve();  //resolve() を呼んで、Promise を fulfilled 状態
    req.onerror = () => reject(req.error);  //reject(req.error) を呼ぶことで Promise を rejected
    req.onblocked = () => reject(new Error("⚠️ delete blocked: DBが他タブで開かれています")); //使用中なので、注意表示
  });
}

function openDB(name, version) {
  cMsg(` DB Open`);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onupgradeneeded = () => { //versionが上がった場合
      const db = req.result;
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(
            store.name,
            store.keyPath ? { keyPath: store.keyPath } : { autoIncrement: true }
          );
          cMsg(`STORE ${store.name} 作成`)
        }
      }
    };
    req.onsuccess = () => resolve(req.result);  //成功　fulfilledへ
    req.onerror = () => reject(req.error);      //失敗　rejectedへ
  });
}

function putData(db, storeName, data) {
  cMsg(`put ${storeName}`)
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    store.add(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

//end of file