// errDisp.js JSエラー表示

const errMsgHtml = `
<button id="btnEMClear">エラー表示クリア</button>

<pre id="errorBox"></pre>   <!-- エラー表示用　先頭に置く -->
`;  /* エラー表示のDOM */


function init() {
  const errDisp = document.getElementById("errDisp"); //エラーDOM非表示
  errDisp.innerHTML = errMsgHtml;
  errDisp.style.display = "none";

  const errArea = document.getElementById("errorBox");  //エラー表示
  setDomEvent("btnEMClear","click", () => { //ボタン
    errArea.textContent = ""; //エラー表示を消す
    errDisp.style.display = "none";   //クリックで非表示(エラー時表示し)
  });
}

export default { init }; //無条件実行で非公開

//end of file