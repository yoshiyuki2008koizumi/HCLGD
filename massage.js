// massage.js window公開関数
import errDisp from "./errDisp.js";

export let appStart = false; //アプリの実行前認識識
export let errCount = 0;
//export let errStop = true;
//export let sysErr = false;

function showError(msg) {  //errorBoxにmsgを追記し表示する
  if(!appStart){
    console.error(msg);
  }else{
    const box = document.getElementById("errorBox");
    box.textContent += msg + "\n";  //追記
    box.style.display = "block"; //表示

    const errDisp = document.getElementById("errDisp"); // ← ① 追加
    errDisp.style.display = "block"; //エラーを表示
    
    errDisp.scrollIntoView({ behavior: "smooth", block: "start" }); //表示位置修正

//    if(errStop | sysErr)await waitForBtn("btnNext");
  }
};

export function setAppStart(){
  errDisp.init();
  appStart = true;
}
 let l_mtStart = 0;             //前回時間 ローカル変数

export function measTime() {  //経過時間計測表示　前回呼び出しからの経過時間の表示が可能

  return function () {
    const now = Date.now();
    let diff = l_mtStart === 0 ? 0 : now - l_mtStart;
    l_mtStart = now;

    const secTotal = diff / 1000;
    const min = Math.floor(secTotal / 60);
    const sec = (secTotal % 60).toFixed(1);
    return ` ** ${min}m${sec}s **`;
  };
}

export function f_n(sn = 2) {  //呼び出し関数名追加 ソースの位置補正追加
  const stack = new Error().stack.split("\n");
  const line = (stack[sn] || "").trim();
  const func = (line.match(/at\s+([^\s(]+)/) || [, "(unknown)"])[1];
  const fileMatch = line.match(/(?:.*[\/\\])?([^\/\\]+\.js):\d+:\d+/);
  const file = fileMatch ? fileMatch[1] : "*.html";
  const pos = (line.match(/:(\d+):(\d+)\)?$/) || [, "?", "?"])
    .slice(1, 3)
    .join(":");
  return `${func}(${file} ${pos})`;
}
export function cMsg(msg, ...args){ //コンソールログ出力
  console.log(`${msg}   ${f_n(3)}`, ...args);
}
export function cMsg2(msg, ...args){ //コンソールログ出力
  console.log(`${msg}   ${f_n(4)}`, ...args);
}
export function cErr(msg, ...args){ //コンソールログ出力
 console.err(`${msg}   ${f_n(3)}`, ...args);
  showError(`${msg}   ${f_n(3)}`, ...args);
}
export function cWarm(msg, ...args){ //コンソールログ出力
  console.err(`${msg}   ${f_n(3)}`, ...args);
}

export function hErr (err) { //HTMLエラー表示
 console.err(`${msg}   ${f_n(3)}`, ...args);
showError(err);
  if(errCount >= 5){
//  await showError(err);
    throw new Error("errオーバー");
  }
  errCount++;
};

export function onerror (message, source, lineno, colno, error) {  //window.onerror（同期/非同期の直列エラー） ----
//  sysErr = true;
  const msg =
    "⚠ JavaScript Error\n" +
    `Message : ${message}\n` +
    `Source  : ${source}\n` +
    `Line    : ${lineno}\n` +
    `Column  : ${colno}\n` +
    (error ? `Stack   : ${error.stack}\n` : "");
//console.error(msg);
  showError(msg);  // グローバル関数を呼ぶ
  return true;  // 既定のアラートは出さない（アプリを止めない）
};

export function onunhandledrejection(event) { //Promise の unhandled エラー ----
//  sysErr = true;
  const err = event.reason;
  const msg =
    "⚠ Unhandled Promise Rejection\n" +
    (err && err.message ? `Message : ${err.message}\n` : "") +
    (err && err.stack ? `Stack   :\n${err.stack}\n` : "");
//console.error(msg);
  showError(msg);
  return true;
};

export function formatDateLocal(date = new Date()){  //時刻の文字列変換
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  const h = String(date.getHours()).padStart(2,"0");
  const min = String(date.getMinutes()).padStart(2,"0");

  return `${y}-${m}-${d} ${h}:${min}`;
}
//end of file