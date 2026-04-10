// childePage.js

let childeMap = {};     //子ページマップ（EMSのAPI）　chldInfoがいいね！
let childName = "";     //子ページの名前

let g_child = {};       //子ページのDB戻り値 不要なはず
let dbVal = {};        //データベースの戻り値(オブジェクト)上とダブリ　使わない猛攻

function init(name = "enter"){
 cMsg(`setPage ${name}`)
  let domChg = false;
  const cobj = childeMap[name];
  if(childName !== name){
    domChg = true;
 cMsg(` chage`)
    if (typeof cobj !== "object") {
      CErr(`子ページではない！！`);
      return false;
    }
    childName = name;
    document.getElementById("childContent").innerHTML = cp.childeMap[name].chtml;
  }
    childChgMsg.style.display = 'none';      //DB要求表示OFF
    childContent.style.display = 'block';
    requestAnimationFrame(() => {
      setTimeout(() => {cobj.init(domChg);}, 0);  //子ページの起動
    });
  return true;
}

function set_g_child(obj){
  this.g_chile = obj;
}
function set_dbVal(obj){
  dbVal = obj;
}

export const cp = { init, childeMap, g_child };

//end of file