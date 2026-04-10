//canvas2.js

//常数
 //用紙サイズ
const Lmm = 297;  //長い方の長さ
const Smm = 210;  //短い方の長さ
export const A5Hp2 = [Lmm/2, Smm/2,  ];  //0横　A5Hp2　table用のcanvas
export const A4Vp1 = [Smm, Lmm,      ];  //5縦　A4V

//Line List 制御フラグ
export const LInv = 0x08;   //反転書き込みフラグ
export const LMask = 0x07;
export const LStart = 1;
//const LNext = 2;
export const LEnd = 3;
export const LMorg = 4;
export const LCol = 5;
let cIdLast;

const colorTble = [ //canvas線の色
  "rgb(0,0,0)",
  "rgba(0,0,0 0.1)",
  "rgb(255, 0, 0)",
  "rgba(255, 0, 0, 0.2)",
  "rgb(0,255, 0)",
  "rgba(0,255, 0, 0.5)",
  "rgb(0,0,255)",
  "rgba(0,0,255, 0.5)",
  "rgba(161, 2, 90, 0.5)",
  "rgba(252, 143, 203, 0.4)",
];
const canvasSize = [
  ["A5Hp2", Lmm/2, Smm/2, ],  //横　1/8 table用のcanvas
  ["A4H"  , Lmm, Smm, ],      //横
  ["A4Hp2", Lmm/2, Smm/2, ],  //横　1/2
  ["A4Hp3", Lmm/3, Smm/3, ],  //横　1/3
  ["A4Hp4", Lmm/4, Smm/4, ],  //横　1/4
  ["A4V"  , Smm, Lmm, ],      //縦
  ["A4Vp2", Smm/2, Lmm/2, ],
  ["A4Vp3", Smm/3, Lmm/3, ],
  ["A4Vp4", Smm/4, Lmm/4, ],
];

//変数
let canvas =  null; //canvas
let ctx =  null;    //canvas コンテキスト
let ctx_xy = [];    //canvasXYサイズ
const dpi = 96;
const ds = (dpi / 25.4);
const mmToPx = mm => mm * ds; //ｍｍをピクセルに変換 1行アロー関数
let d270 = false;  //270度canvasの向き
let cReduction = 1;

function ll_start(list, x, y, inv = 0){ //線情報の開始
  const info = (inv & LInv)? LStart|LInv: LStart;
  list.push([x, y, info]); 
}//ll_start
function ll_set(list, x, y){ //線情報の継続
  list.push([x, y, LStart]); 
}//ll_set
function ll_end(list, x, y){ //線情報の終了
  list.push([x, y, LEnd]); 
}//ll_end
function ll_mOrg(list, x, y){ //線情報に原点の移動値(先頭)追加
  if((list[0][2] & LMask) == LMorg){
    list[0] = [x,y,LMorg];
  }else{
    const inv = list[0][2] & LInv;
    list.unshift([x, y, LMorg | inv]);
  } 
}//ll_mOrg

//Low Level line
function setSize(xy) {  //canvasサイズ設定
  ctx_xy = xy;
  canvas.width = Math.round(ctx_xy[0] * dpi / 25.4);
  canvas.height = Math.round(ctx_xy[1] * dpi / 25.4);
  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";
  return canvas.style.width;
}//setSize
function clear(){ //消去
  ctx.save(); // ← 状態を全部保存（色・太さ・その他全て）
  ctx.setTransform(1,0,0,1,0,0); //原点の初期化
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore(); // ← 色・太さ・点線設定など全部元に戻る
}//clear
function save(){
  ctx.save(); // ← 状態を全部保存（色・太さ・その他全て）
}
function restore(){
  ctx.restore(); // ← 色・太さ・点線設定など全部元に戻る
}
function scale(s){
  ctx.scale(s,s); //縮小
}
function setOrg(xy){   //canvas原点の設定　Pixel単位
 ctx.setTransform(1,0,0,1,0,0); //原点の初期化
 //cMsg (`${mmToPx(xy[0])} ${ mmToPx(xy[1])}`);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(mmToPx(xy[0]), mmToPx(xy[1]));
}//setOrg
function movOrg(xy){   //canvas原点の設定　Pixel単位
 //cMsg (`${mmToPx(xy[0])} ${ mmToPx(xy[1])}`);
  ctx.translate(mmToPx(xy[0]), mmToPx(xy[1]));
}//movOrg
function line(sp,ep){  //2点間の線を引く
  ctx.beginPath();
  ctx.moveTo(mmToPx(sp[0]), mmToPx(sp[1]));
  ctx.lineTo(mmToPx(ep[0]), mmToPx(ep[1]));
  ctx.stroke();
}//line
function selCanvas(id, info = null){ //canvasIDチェック。info=canvasサイズ指定
  let dom = document.getElementById(id)
  if(dom){
    cIdLast = id.slice(-1);   //最後の文字取り出し
    canvas = dom;
    ctx = canvas.getContext("2d")
    ctx.strokeStyle = colorTble[0];   //ディフォルト線色
  if(info){
      const i = canvasSize.findIndex(row => row[0] === info);
      const size = (i != -1)?  canvasSize[i]: canvasSize[0];
      canvas.width = Math.round(mmToPx(size[1]));
      canvas.height = Math.round(mmToPx(size[2]));
    }
  }
  return dom; //canvas(DOM)ではない場合はnull
}//selCanvas
function selCanvasBcal(id,bcol = 0){  //線の色指定付、書き込み開始
  let dom = document.getElementById(id)
  if(dom){
    canvas = dom;
    ctx = canvas.getContext("2d")
    cIdLast = id.slice(-1);   //最後の文字取り出し

    ctx.strokeStyle = colorTble[bcol];
    clear();
  }
  return dom; //canvas(DOM)ではない場合はnull
}
//up Level line
function getcX(xy) { //座標縦横変換
  //if (!d270) return xy[0];
  //return xy[1];
  return ((!d270)? xy[0]: xy[1]) /  cReduction;
}//getcX
function getcY(xy) {    // ???
  //if (!d270) return xy[1];
    //  return A4H - xy[0];
      //return canvas.height - xy[0];
  //return -xy[0];
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
  if(s[2] & LInv){
    linePath(getcX(s)*-1,getcY(s));
    lineStroke(getcX(e)*-1,getcY(e));
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
        break;
      case LCol:
        if(col === null)
          ctx.strokeStyle = colorTble[list[i][0]];
        break;
    }
  }
  ctx.restore(); // ← 色・太さ・点線設定など全部元に戻る
}//ll_Canvas

//part Level line
function drawAll(info){ //パーツの描画
  return
  if(info.pPart === true){
    //if(select(info.name) !== false){
      //setPorg(info.cAdr);
      //canvas = document.getElementById(info.name);
      //if (canvas && (canvas instanceof HTMLCanvasElement)) {
      //  ctx = canvas.getContext("2d");
        //if(info.d270)resizeCanvas(info.size[1],info.size[0]);
        //else resizeCanvas(info.size[0],info.size[1]);
      //d270 = info.d270;

      //resizeCanvas(info.size[0],info.size[1]);
//      clearCanvas();
      //cOrgXY = info.oAdr; //原点を設定
//    }
  }
  ll_Canvas(info.ll);
  info.chPart.forEach(info => {       //子パーツリスト 再起呼び出し
    drawAll(info);
  });
}//drawAll

function draw(ll, col = null, cid = null){  //canvasに線を引く
  if(cid){
    selCanvas(cid);
  }
  ll_Canvas(ll, col);
}

function baseInit(bid){ //canvasの初期化
  function setBoxAcl(xy, y, box){
    if(box){
      const canvasB = document.getElementById(box);
      canvasB.style.width = canvas.width+"px"
      canvasB.style.height = canvas.height+"px"
    }
    setOrg([xy[0]/2, y]);
    if(box){
      const ll = [
        [2,0,LCol],
        [0,-y,LStart],[0,xy[1]-y,LEnd], //センタライン
        [2,0,LCol],
        [1,1,LInv|LStart],[-1,-1,LEnd],
      ]
      ll_Canvas(ll);
    }
  }
  selCanvas("baseP", "A5Hp2"); setBoxAcl(A5Hp2, A5Hp2[1]*0.4,"canvasBoxP")
  selCanvas("viewP", "A5Hp2"); setBoxAcl(A5Hp2, A5Hp2[1]*0.4); 
  selCanvas("partP", "A5Hp2"); setBoxAcl(A5Hp2, A5Hp2[1]*0.4);
  selCanvas("workP", "A5Hp2"); setBoxAcl(A5Hp2, A5Hp2[1]*0.4);

  selCanvas("baseA", "A4V"); setBoxAcl(A4Vp1,  A4Vp1[1]/4,"canvasBoxA")
  selCanvas("viewA", "A4V"); setBoxAcl( A4Vp1,  A4Vp1[1]/4)
  selCanvas("partA", "A4V"); setBoxAcl( A4Vp1,  A4Vp1[1]/4)
  selCanvas("workA", "A4V"); setBoxAcl( A4Vp1,  A4Vp1[1]/4)
}

export const MC2 = {
    baseInit, selCanvas, selCanvasBcal, clear, setOrg, movOrg, line, drawAll, draw,
    ll_start, ll_end, ll_mOrg, ll_Canvas, save, restore, scale
    
    //get ctx() {return ctx},
    //set cReduction(val) { cReduction = val; }, 
    //get cReduction() { return cReduction; }

};
//import { MC2 } from "../canvas/canvas2.js";

//end of file