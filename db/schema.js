// DB名・バージョン
export const DB_NAME = "HCLGD";
export const DB_VERSION = 1;

// ストア定義
export const STORES = [
  { name: "common", single: true  },   // keyPath省略 → 自動キー
  { name: "target", single: true  },
  { name: "dataID", single: true  },
  { name: "newBase", single: true  },
//  { name: "design", single: true  },
//  { name: "new_design", single: true  },
  { name: "design2", keyPath: "id", autoIncrement: true   },
];

//end of file