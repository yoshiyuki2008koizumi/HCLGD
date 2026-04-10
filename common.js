// common.js 共通処理

export function chTitle(title,upDbg = null){  //子ページのタイトルとデバッグボタン追加
  const eId = document.getElementById("childTitle"); //タイトル名
  eId.textContent = title;

  if(upDbg !== null){
    document.getElementById("dbgBtn").innerHTML = upDbg;  //ディバッグボタンDOM設定
  }
}

export function setDomEvent(id,ev,hd,dstr = ""){ //DOMイベントの設定
  const domp = document.getElementById(id);
  domp.addEventListener(ev, hd);
  if(dstr !== ""){
    domp.textContent = dstr;
  }
  domp.style.display = "inline-block";
}

export function domDisp(name,on=true){ //DOMの表示制御　表示・非表示
  document.getElementById(name).style.display = on? "block": "none";
}

export function fNum(n) {  //表示桁数変換
  if(n == 0)return "";
  if (n < 10) return n.toFixed(2);   // 2桁
  if (n <= 80) return n.toFixed(1);   // 1桁
  return Math.round(n).toString(); // 小数なし
}

//end of file