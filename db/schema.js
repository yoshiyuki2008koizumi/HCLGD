// DB名・バージョン
export const DB_NAME = "HCLGD";
export const DB_VERSION = 1;

// ストア定義
export const STORES = [
  { name: "apInfo", single: true  },   // keyPath省略 → 自動キー
  { name: "prototype", single: true  },
  { name: "baseList", single: true  },
  { name: "base", keyPath: "id", autoIncrement: true   },
];

//end of file