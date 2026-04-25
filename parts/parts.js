//parts.js
//import { drawer, LInv } from "../canvas/canvas.js";
//import { dbData } from "../db/dataBase.js";
import { MC2, LInv, LStart, LEnd, LCol,} from "../canvas/canvas2.js";
import { aero } from "../design/aero.js";
import { IDB } from "../db/indexdDB.js";
import { BASE } from "../design/base.js";

const dbdBase = () => IDB.dbd.base;

let val = {};   //変数

function valProc(pat = null){  //基本設計数値処理(入力値変更)　起動時とtabe入力から呼び出す
  const cEnble = "#9df79dff";
  const color = (name) =>  table.setColor(pat, name, cEnble); //入力有効色設定
  const patVal = val[pat];
  let aria, span = 0, chord = 0, aspect =0;  //矩形翼
  let rootChord, tipChord, tipDiff;   //テーパ
  let sweep;                          //後退角
  let mac;
 //cMsg(`valProc ${pat}`)


  function ll_mac(mac){
    let list = [];
    MC2.ll_start(list,mac.y,0+mac.def);
    MC2.ll_end(list,mac.y,mac.length+mac.def);
    MC2.ll_start(list,0,0+mac.def,LInv);
    MC2.ll_end(list,4,0+mac.def);
    MC2.ll_start(list,0,mac.length+mac.def,LInv);
    MC2.ll_end(list,4,mac.length+mac.def);

    const macOffset = mac.length / 4 + mac.def
    MC2.ll_mOrg(list,0,-macOffset); //オリジン座標をMACの1/4に移動
    MC2.draw(list);
  }
  function crRLI(m){ //矩形翼描画情報作成　Drawing Information
   cMsg(` - ${m}`)
    const part = parts.init("rect_" + pat); 
    let list = part.ll;
    MC2.ll_start(list,0,0,LInv);
    MC2.ll_start(list,span/2,tipDiff,LInv);   // +tipDef
    MC2.ll_start(list,span/2,tipChord+tipDiff,LInv);   //tipChord
    MC2.ll_end(list,0,rootChord);   // tipChord+tipDef
    mac = aero.calcMAC(list); //MAC算出

    //ll_mac(mac);  //llにMACを追記

    if(part === "body"){

    }else{
      if(pat === "vs"){ //双垂直尾翼ならX座標[0]を移動
        const span = dbdBase().val.base.hs.span_o;
        const chord = dbdBase().val.base.hs.rootChord_o;
        list.forEach(ll => {       //各X座標の移動
          ll[0] += span;
        });
      }
      const macOffset = mac.length / 4 + mac.def
      MC2.ll_mOrg(list,0,-macOffset); //オリジン座標をMACの1/4に移動
    }

    dbdBase().val[m] ??= {}; //矩形翼線情報の保存
    dbdBase().val[m][pat] = list;
  //  hsma(70,)
    drawRLI(m);  //パーツcanvas描画  
  }//crRLI
  function drawRLI(m){   //canvas描画
    function reductionRatio(){  //縮小率
      let result = 1;
      let mw_span = dbdBase().val.base.mw.span_o;  //canvas縮小係数
  //cMsg(mw_span)
      for(let i = 0; ; i++){  //縮小設定
        if(mw_span <= A5Hp2[0])break;
        mw_span /= 2;
        result /= 2;
      }
      return result;
    }
    if(design.mName === pat){ //tableが同一

      MC2.save(); // ← 状態を全部保存（色・太さ・その他全て）
        MC2.scale(reductionRatio());  // ← 縮小（相対）

        if(pat === "vs")    //垂直尾翼なら合わせて水平尾翼を追記 
          MC2.draw(dbdBase().val[m].hs,1); //薄い黒
        MC2.draw(dbdBase().val[m][pat]);
        ll_mac(mac);  //llにMACを追記
      MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
    //    debugger
    }
  }

   function rectProc(){  //矩形翼処理
 //cMsg(`rectProc`)
    let rectFix = false;  //翼成立フラグ
    span = Number(patVal.hspan_i)*2;   //翼幅
    chord = Number(patVal.chord_i); //翼弦
    patVal.tipDiff = tipDiff = 0;
    if((aria = span*chord)){  //翼幅、翼弦指定
      table.setColor(pat,"hspan_i",cEnble);
      color("chord_i")
      table.setColor(pat,"chord_i",cEnble);
      rectFix = true;
    }else if((aria = Number(patVal.area_i))){ //面積指定
      table.setColor(pat, "area_i",cEnble);
    }else if(pat === "mw"){   //MWなら翼面荷重
      const l = patVal.loading_i;
      const w = patVal.weight_i;
      if(l * w){
        table.setColor(pat,"loading_i",cEnble);
        table.setColor(pat,"weight_i",cEnble);
        aria = l * w * 100;
      //  table.setVal (pat, "area_i",aria, false);
      }
    }
    if(aria && !rectFix){  //面積有効で確定ではない
      if(span + chord){ //幅弦どちらか有効
        if(Number(patVal.hspan_i)){
          chord = aria / span;
          table.setColor(pat,"hspan_i",cEnble);
        }
        if(Number(patVal.chord_i)){
          span = aria / chord;
          table.setColor(pat,"chord_i",cEnble);
        }
        rectFix = true;
      }else if((aspect = Number(patVal.aspect_i))){
        chord = Math.sqrt(aria / aspect);
        span = aria / (chord);
        table.setColor(pat,"aspect_i",cEnble);
        rectFix = true;
      }
    }
    if(rectFix)aspect = span / chord;

    if(aria != 0)patVal.area_o = aria; //面積確定
    if(span != 0)patVal.span_o = span; //翼幅確定
    if(chord != 0){
      rootChord = tipChord = chord;
      patVal.rootChord_o = chord;  //翼根弦確定
      patVal.tipChord_o = chord;   //翼端弦確定
    }
    if(aspect != 0)patVal.aspect_o = aspect;   //アスペクト比確定

    if(patVal["area_io"] === ""){ //初回起動(参考面積初期設定未設定)
      const maria = val.mw["area_o"]; //主翼面積
      let taria = val.mw["area_o"] * patVal["ariap_i"] /100;
      table.setVal (pat, "area_io", taria); //設定して
      //       patVal.area_io = taria; //設定して
      if(!aria){  //かつ面積が未定なら
        if(pat === "vs"){
          //taria /= 2;  //双垂直尾翼
          table.setVal (pat, "chord_i",dsMode.val["hs"]["rootChord_o"], false);
        }
        table.setVal (pat, "area_i", taria);  //面積を書き込む
        return null;   //多重呼び出し、この処理終了
      }
    }
    return rectFix;
  }//rectProc
  function taperProc(){ //テーパ翼処理
    const taper = Number(patVal.taper_i);   //テーパー
    if(!taper){
      patVal.tipChord_o = chord;
      patVal.rootChord_o = chord;
      patVal.tipDiff_o = 0;
    }else{
      table.setColor(pat,"taper_i",cEnble);
      rootChord = Number(patVal.rootChord_o)*2 / (taper + 1);
      tipChord = tipChord * taper;
      patVal.tipChord_o = tipChord;
      patVal.rootChord_o = rootChord;
      tipDiff = rootChord*0.25 - tipChord*0.25;
      patVal.tipDiff_o = tipDiff;

    }
    return true;
  }//taperProc
  function sweepProc(full){ //後退角翼処理
    sweep = Number(patVal.sweep_i);   //後退角
    if(!sweep){
      patVal.sweepDiff_o = 0;
    }else{
cMsg (`sweep ${sweep} ${patVal.rootChord_o} ${patVal.tipChord_o} ${patVal.tipDiff_o}`)
      table.setColor(pat,"sweep_i",cEnble);
      const rad = sweep * Math.PI / 180;
      tipDiff = Math.tan(rad) * patVal.span_o;
      //if(tipDiff < 0) tipDiff += patVal.tipChord_o * 0.25;
      //else tipDiff -= patVal.tipChord_o * 0.25;
      tipDiff += (patVal.rootChord_o - patVal.tipChord_o)* 0.25;
      patVal.tipDiff_o = tipDiff;

cMsg (`sweep ${sweep} ${patVal.rootChord_o} ${patVal.tipChord_o} ${patVal.tipDiff_o}`)
      //patVal.area_o = aria;
    }
    cvmsg[pat] = [];
    let v1,v2;
    cvmsg[pat].push(patname[pat]);
    cvmsg[pat].push(`　面積:　${patVal.area_o}`);
    if(full){
      v2 = dspVal(patVal.span_o)
      v1 = v2/2;
      cvmsg[pat].push(`　幅:　${v1}(${v2})`);
      v1 = dspVal(patVal.rootChord_o)
      v2 = dspVal(patVal.tipChord_o)
      cvmsg[pat].push(`　根弦:　${v1}　端弦:　${v2}`);
      cvmsg[pat].push(`　MAC:　XX 　重心:　xx`);
    }
    MC2.sl_canvas(cvmsg[pat]);
    return true;
  }//sweepProc

  //valProc main
  for (const [name, vars] of Object.entries(patVal)) { //入力変数の色を消去
    if (name.endsWith("_i")) {
      table.setColor(pat,name);
    }
  }
  MC2.selCanvasBcal("partP", 7);  //canvas初期化
  MC2.selCanvasBcal("workP", 2);
  MC2.selCanvasBcal("viewP", 5);
  const full = rectProc(); //矩形翼処理
  if(full != null){ //多重呼び出しで描画済みなので描画しない
    if(full){ //矩形翼成立
      crRLI("rect");    //線データ作成
      //drawRLI();  //パーツcanvas描画  
      if(taperProc()){ //テーパー翼処理
        MC2.selCanvasBcal("partP");
        crRLI("taper");    //線データ作成
      }
      if(sweepProc(full)){ //後退翼翼処理
        MC2.selCanvasBcal("workP");
        crRLI("sweep");    //線データ作成
      }
    }else{
       delete dbdBase().val.rect[pat];
    }
    setCanvas();  //全体canvasの表示
  }
}//valProc

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

function setCanvas(){   //全体表示
  function drow(step) {
    if (dbdBase().val?.[step]?.mw !== undefined){
      MC2.draw(dbdBase().val[step].mw);   //主翼
      if (dbdBase().val?.[step]?.hs !== undefined){ 
        MC2.save(); // ← 状態を全部保存（色・太さ・その他全て）
          const {n: oy, s, l} = aero.hsLH(90, dbdBase().val[step].mw, dbdBase().val[step].hs);
        // cMsg (` lH - ${s} ${oy} ${l}`)
          MC2.movOrg([0,oy])   //原点移動
          MC2.ll_Canvas([[2,0,LCol],  [1, 1,    LInv|LStart], [-1,  -1,   LEnd]]);  //X表示
          MC2.ll_Canvas([[2,0,LCol],  [0, s-oy, LInv|LStart], [ 1,  s-oy, LEnd]]);  //-表示
          MC2.ll_Canvas([[2,0,LCol],  [0, l-oy, LInv|LStart], [ 1,  l-oy, LEnd]]);  //-表示
          MC2.draw(dbdBase().val[step].hs); //水平尾翼
        MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
        if (dbdBase().val?.[step]?.vs !== undefined){ 
          MC2.save(); // ← 状態を全部保存（色・太さ・その他全て）
            MC2.movOrg([0,oy])
            MC2.draw(dbdBase().val[step].vs); //水平尾翼
          MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
        }
      }
    }
    const m = ["mw","hs","vs"];
    MC2.sl_canvas(BASE.cvmsg.mw);
    MC2.sl_canvas(BASE.cvmsg.hs,0,600);
    MC2.sl_canvas(BASE.cvmsg.vs,0,800);
  }

  MC2.selCanvasBcal("viewA", 4);
  MC2.selCanvasBcal("partA", 7);  //canvas初期化(非表示)
  MC2.selCanvasBcal("workA", 2);
  MC2.selCanvasBcal("viewA", 5);
  drow("rect");    //線データ作成
  //drow("taper");    //線データ作成
  //drow("sweep");    //線データ作成
  MC2.selCanvasBcal("partA");  //canvas初期化(非表示)
  drow("taper");    //線データ作成
  MC2.selCanvasBcal("workA");
  drow("sweep");    //線データ作成  

/*
  aero.hsLH(60, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(70, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(80, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(90, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
  aero.hsLH(100, dbdBase().val.rect.mw, dbdBase().val.rect.hs);
*/
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
export const parts = {
  init, dbgBtn,
  valProc,
  setCanvas, 
}
//import { parts } from "./parts/parts.js";

//end of file