// schema.js　DB管理情報
export const DB_NAME = "HCLGD";
export const DB_VERSION = 3;

// ストア定義
export const STORES = [
  { name: "apInfo", single: true  },   // keyPath省略 → 自動キー
  { name: "prototype", single: true  },
  { name: "baseList", single: true  },
  { name: "base", keyPath: "id", autoIncrement: true   },
];

/*
 export const IDB ={
  deleteDB,
  openDB, openDB_init,
  putData, dbRead,
  get dbp(){ return dbp; }, 
  set dbp(val){ dbp = val;}, 
  dbd
};
*/
//import { IDB } from "./indexdDB.js";

//end of file