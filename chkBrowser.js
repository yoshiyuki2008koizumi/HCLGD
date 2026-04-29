//chkBrowser.js

function isTrustedBrowser() { //ブラザー判定　アプリ内ブラウザ系を除外
  const ua = navigator.userAgent;

  // ❌ アプリ内ブラウザ系を除外
  if (/Line\//i.test(ua)) return false;
  if (/FBAN|FBAV/i.test(ua)) return false; // Facebook
  if (/Instagram/i.test(ua)) return false;
  if (/wv/.test(ua)) return false; // Android WebView

  if(false){
    // ✔ 通常ブラウザ判定
    const isChrome = /Chrome/.test(ua) && !/Edg|OPR|Line|wv/.test(ua);
    const isEdge = /Edg/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome|Edg|Line|wv/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    return isChrome || isEdge || isSafari || isFirefox;
  }
  return true; //とりあえず全て許可
}


function hasIndexedDB() { //indexedDBmoのサポート確認
  return typeof indexedDB !== "undefined";
}

function isAllowedEnvironment() {
  return isTrustedBrowser() && hasIndexedDB();
}

function check(){
  if(!isAllowedEnvironment() === true){
    alert("このブラウザは対応していません。標準のブラウザ（Chrome、Edge、Safari、Firefoxなど）でアクセスしてください。");
  }
}
/*
★icon　headの先頭に追加
<link rel="icon" type="image/png" sizes="32X32" href="../icon/DOC32icon.png">
<link rel="icon" type="image/png" sizes="128x128" href="../icon/DOC128icon.png">
<link rel="apple-touch-icon" href="../icon/DOC128icon.png">

★チェック bodyの最後に追加
<script type="module">
import { CHKBRO } from "../chkBrowser.js"; //debug★★
  CHKBRO.check();  //ブラウザチェック
</script>

★ページ切り替え
function docOpen(){
  window.open("DOC/index.html?v1", "_blank", "noopener");
}

*/
export const CHKBRO = { check };
//import { CHKBRO } from "./chkBrowser.js";
