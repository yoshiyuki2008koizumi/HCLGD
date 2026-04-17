//parts.js
//import { drawer, LInv } from "../canvas/canvas.js";
//import { dbData } from "../db/dataBase.js";
import { MC2, LInv, LStart, LEnd, LCol,} from "../canvas/canvas2.js";
import { aero } from "../design/aero.js";
import { IDB } from "../db/indexdDB.js";
const dbdBase = () => IDB.dbd.base;

function init(name){  //partsオブジェクトの初期化
  const obj = {
    name: "",       //canvas名　or　部品名
    org: true,      //原型
    ll: [],         //線情報
    cAdr: [0,0],    //描画位置
    d270: false,    //canvas縦
    chPart: [],     //子パーツリスト
    pPart: true,    //親パーツ　リンク
  }
  
  const result = structuredClone(obj);  //深いコピー
  result.name = name;
  return result;
}

function setCanvas(){
 //  cMsg (`workA`)
  MC2.selCanvasBcal("viewA", 4);

/*
  aero.hsLH(60, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(70, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(80, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(90, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(100, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
*/
  if (dbdBase().val?.rect?.mw !== undefined){
    MC2.draw(dbdBase().val.rect.mw);   //主翼
    if (dbdBase().val?.rect?.hs !== undefined){ 
      MC2.save(); // ← 状態を全部保存（色・太さ・その他全て）

      const {n: oy, s, l} = aero.hsLH(90, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
     // cMsg (` lH - ${s} ${oy} ${l}`)
      MC2.movOrg([0,oy])   //原点移動
      MC2.ll_Canvas([[2,0,LCol],  [1, 1,    LInv|LStart], [-1,  -1,   LEnd]]);  //X表示
      MC2.ll_Canvas([[2,0,LCol],  [0, s-oy, LInv|LStart], [ 1,  s-oy, LEnd]]);  //-表示
      MC2.ll_Canvas([[2,0,LCol],  [0, l-oy, LInv|LStart], [ 1,  l-oy, LEnd]]);  //-表示

      MC2.draw(dbdBase().val.rect.hs); //水平尾翼
      MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
      if (dbdBase().val?.rect?.vs !== undefined){ 
        MC2.save(); // ← 状態を全部保存（色・太さ・その他全て）
        MC2.movOrg([0,oy])
        MC2.draw(dbdBase().val.rect.vs); //主直尾翼
      }
    }
  }
  MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
}

function dbgBtn(){  //デバッグボタン設定
    setDomEvent("btn8Start","click", testCanvas, "testCanvas");
}
let dbg_init = false;//true;
function testCanvas(){
  if(dbg_init){
    dbg_init = false;
    designBtn();
  }
  setCanvas();
}
export const parts = {init, dbgBtn, setCanvas, }
//end of file