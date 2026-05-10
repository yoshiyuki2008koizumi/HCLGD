//canvas3.js
import { MC2 } from "./canvas2.js";

//Line List 制御フラグ
export const LInv = 0x08;   //反転書き込みフラグ
export const LMask = 0x07;
export const LStart = 1;
//const LNext = 2;
export const LEnd = 3;
export const LMorg = 4;
export const LCol = 5;

const colorTble = { //canvas線の色
  ctBlack:  "rgb(0,0,0)",
  ctBlack2: "rgba(0,0,0 0.3)",
  ctRead:   "rgb(255, 0, 0)",
  ctRead2:  "rgba(255, 0, 0, 0.3)",
  ctGreen:  "rgb(0,255, 0)",
  ctGrenn2: "rgba(0,255, 0, 0.5)",
  ctBlue:   "rgb(0,0,255)",
  ctBlue2:  "rgba(0,0,255, 0.5)",
  ctBlown:  "rgba(161, 2, 90, 0.5)",  //??
  ctBlown2: "rgba(252, 143, 203, 0.4)",
  ctYellow: "rgba(255,255,0,1)",
  ctYellow2:"rgba(255,255,0,0.5)",
};
 //用紙サイズ
const A4Lmm = 297;  //A4長い方の長さ
const A4Smm = 210;  //A4短い方の長さ
const canvasSize = { //名前、配置(HV)、分割（プリンタ後ろ刺し）
  A5H:   [A4Lmm/2, A4Smm/2],  //横　1/8 table用のcanvas
  A4H:   [A4Lmm,   A4Smm],    //横
  A4Hp2: [A4Lmm/2, A4Smm],    //横　1/2
  A4Hp3: [A4Lmm/3, A4Smm],    //横　1/3
  A4Hp4: [A4Lmm/4, A4Smm],    //横　1/4
  A4V:   [A4Smm,   A4Lmm],    //縦
  A4Vp2: [A4Smm/2, A4Lmm],
  A4Vp3: [A4Smm/3, A4Lmm],
  A4Vp4: [A4Smm/4, A4Lmm],
};

let canvasMap = {};   //canvas ctx保存
let ctx;    //canvasd270
//let ctx_xy = [];    //canvasXYサイズ
const dpi = 96;   //解像度
const ds = (dpi / 25.4);
const mmToPx = mm => mm * ds; //ｍｍをピクセルに変換 1行アロー関数
const canvasCenter = {};  //canvas center P.A: [x,y]　右上座標算出用に保存　pushしてもどてpopすれば不要かも
let cReduction = 1; //使ってない。削減なので、縮小係数のように見える。5/10
let d270 = false;  //270度canvasの向き　縦置を横置にする場合の座標変換？

//書き込みエリアチェック処理
let ulxy = {};  //canvs書き込みエリア
function setUlxyS(xy){//座標の保存
  return
  const p = ulxy[ctx.canvas.id];
  if(p.u[0] > p[0])p.u[0] = xy[0];  //ux
  if(p.u[1] > p[1])p.u[1] = xy[1];  //uy
  if(p.l[0] < p[0])p.l[0] = xy[0];  //lx
  if(p.l[1] < p[1])p.l[1] = xy[1];  //ly
}
function setUlxy(s, e = null){  //通常座標
  setUlxyS(s);
  if(e !== null)
    setUlxyS(e);
}
function setUlxyI(s, e = null){ //　反転座標　x*-1
  setUlxyS([s[0]*-1,s[1]]);
  if(e !== null)
    setUlxyS([e[0]*-1,e[1]]);
}

//up Level line
function getcX(xy) { //座標縦横変換
  return ((!d270)? xy[0]: xy[1]) /  cReduction;
}//getcX
function getcY(xy) {    // ???
  return ((!d270)? xy[1]: -xy[0]) /  cReduction;
}//getcY
function linePath(x,y){   //線の書き込み開始（開始点の指定）
// cMsg(`lp ${x} ${y}`)
  ctx.beginPath();
 //cMsg (`${mmToPx(x)} ${mmToPx(y)}`);
  ctx.moveTo(mmToPx(x), mmToPx(y));
}//linePath
function lineStroke(x,y){     //線の表示（終点）
// cMsg(`ls ${x} ${y}`)
  ctx.lineTo(mmToPx(x), mmToPx(y));
 //cMsg (`${mmToPx(x)} ${mmToPx(y)}`);
  ctx.stroke();
}//lineStroke

function l_line(s, e){
//cMsg(`ll ${s} ${e}`)
  linePath(getcX(s),getcY(s));
  lineStroke(getcX(e),getcY(e));
  setUlxy(s,e);
  if(s[2] & LInv){
    linePath(getcX(s)*-1,getcY(s));
    lineStroke(getcX(e)*-1,getcY(e));
    setUlxyI(s,e);
  }
}//l_line
function l_movOrg(xy, col = null){   //canvas原点の設定　Pixel単位
 //cMsg (`${mmToPx(xy[0])} ${ mmToPx(xy[1])}`);
  movOrg([getcX(xy), getcY(xy)]);
}//l_movOrg
function ll_Canvas(list, col = null){ //線情報のCanvas書き込み（左右対称機能付き)
  let inv;
  let s,e;
  ctx.save(); // ← 状態を全部保存（色・太さ・その他全て）
  if(col)
    ctx.strokeStyle = colorTble[col];
  for (let i = 0; i < list.length; i++) {
    switch(list[i][2] & LMask){
      case LStart:
        s = list[i];
        e = list[i+1];  //?不定の可能性大
        l_line(s, e);
        break;
      case LMorg:
        l_movOrg(list[i])
        ulxy[ctx.canvas.id] = {u: [0,0], l:[0,0]};
        break;
      case LCol:
        if(col === null)
          ctx.strokeStyle = colorTble[list[i][0]];
        break;
    }
  }
  ctx.restore(); // ← 色・太さ・点線設定など全部元に戻る
}//ll_Canvas

function sl_canvas(strl, x = 0, y = 0){ //文字列行リストを表示する
  if(strl === undefined || strl.length === 0) return;
  const type = ctx.canvas.id.at(-1);
  const lineHeight = 20;  // 行間

  ctx.font = "16px sans-serif";
  strl.forEach((line, i) => {
    ctx.fillText(line, x-mmToPx(canvasCenter[type][0]), y-mmToPx(canvasCenter[type][1]) + (i+1) * lineHeight);
  });
}// strl_canvas

function setOrg(xy){   //canvas原点の設定　Pixel単位
  ctx.setTransform(1,0,0,1,0,0); //原点の初期化
 //cMsg (`${mmToPx(xy[0])} ${ mmToPx(xy[1])}`);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // これは必用か？5/10
  ctx.translate(mmToPx(xy[0]), mmToPx(xy[1]));
}//setOrg
function movOrg(xy){   //canvas原点の設定　Pixel単位
 //cMsg (`${mmToPx(xy[0])} ${ mmToPx(xy[1])}`);
  ctx.translate(mmToPx(xy[0]), mmToPx(xy[1]));
}//movOrg

function selCanvas(id, sInfo = null){ //canvasIDチェック。info=canvasサイズ指定
  if(canvasMap[id] === undefined){  //ctx作成済み
    const canvas = document.getElementById(id)
    if(canvas){
      ctx = canvas.getContext("2d")
      if(sInfo){
        const xy = canvasSize[sInfo];
        canvas.width = Math.round(mmToPx(xy[0]));
        canvas.height = Math.round(mmToPx(xy[1]));
      }
      canvasMap[id] = ctx;
    }else
      return canvas; //idはcanvasでは無い
  }else ctx = canvasMap[id].ctx;
  MC2.ctx = ctx;
  MC2.canvas = ctx.canvas;
//  cIdLast = ctx.canvas.at(-1);   //最後の文字取り出し

  return true;
}//selCanvas

function selCanvasBcal(id,bcol = null){  //線の色指定付、書き込み開始
  let dom = document.getElementById(id)
  if(dom){
    canvas = dom;
    ctx = canvas.getContext("2d")
    if(bcol !== null){
      ctx.strokeStyle = colorTble[bcol];
      clear();
      ulxy[id] = {u: [0,0], l:[0,0]};
    }
  }
  return dom; //canvas(DOM)ではない場合はnull
}
function setBoxAcl(nxy, my, box){ //センターラインと重ね枠サイスの設定
  const xy = canvasSize[nxy];
  const y = xy[1] * my;
  if(box){  //canvas重ね合わせ元(div)の設定
    const canvasB = document.getElementById(box);
    canvasB.style.height = ctx.canvas.height+"px"
    canvasB.style.width = ctx.canvas.width+"px"
  }
  setOrg([xy[0]/2, y]); //座標の原点
  if(box){
    const last = ctx.canvas.id.at(-1);   //最後の文字取り出し
    canvasCenter[last] = [xy[0]/2, y];  //センター値保存
    const ll = [
      [2,0,LCol],
      [0,-y,LStart],[0,xy[1]-y,LEnd], //センタライン
      [2,0,LCol],
      [1,1,LInv|LStart],[-1,-1,LEnd],
    ]
    ll_Canvas(ll);
  }
// ctx.lineWidth = 12; //線の太さ指定
}

function baseInit(bid){ //base用にcanvasを初期化
  selCanvas("baseP", "A5H"); setBoxAcl("A5H", 0.4,"canvasBoxP")
  selCanvas("viewP", "A5H"); setBoxAcl("A5H", 0.4); 
  selCanvas("partP", "A5H"); setBoxAcl("A5H", 0.4);
  selCanvas("workP", "A5H"); setBoxAcl("A5H", 0.4);

  selCanvas("baseA", "A4V"); setBoxAcl("A4V",  0.25,"canvasBoxA")
  selCanvas("viewA", "A4V"); setBoxAcl("A4V",  0.25)
  selCanvas("partA", "A4V"); setBoxAcl("A4V",  0.25)
  selCanvas("workA", "A4V"); setBoxAcl("A4V",  0.25)
}

let initF = true;
function test(){  // debug
  if(initF){  //起動処理
    setDomEvent("btn10Start","click", test, "CB3test");
    initF = false;
    return
  }
  //selCanvas("baseA","A5H")
  canvasMap = {}; //debug
  baseInit();
}

export const MC3 ={
  test,
  baseInit,sl_canvas,
}
//import { MC3 } from "./canvas3.js";
//end of file 