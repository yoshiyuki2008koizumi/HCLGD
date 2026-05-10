// BD baseDesign.js
import { MC2, A5Hp2, A4Vp1, LInv, } from "../canvas/canvas2.js";
import { parts } from "../parts/parts.js";
import { IDB } from "../db/indexdDB.js";
import { design, } from "./design.js";
import { aero } from "../design/aero.js";
import { table } from "./table.js";

//const dbdBase = () => IDB.dbd.base;
let initF = true;  //初回呼び出しフラグ debug

const cEnble = "#9df79dff";
const cvmsg = {}; //カンヴァス表示メッセージ
const patname = {mw: "主翼", hs: "水平尾翼", vs: "垂直尾翼"}

let apd;  //機体データ base,rect,taper,sweep
let apdI;  //機体データ base,rect,taper,sweep 入力
let apdO;  //機体データ base,rect,taper,sweep　出力
let apdOl;  //線情報
let bsApd;  //ステップデータ
let ptApd;  //パーツデータ

function initSet(){
  apd = IDB.dbd.base.val.base;
}

function ll_mac(mac){ //MMACの位置に線を引く
//  if(pat === "vs")return; //垂直尾翼はMACを表示しない

  const macOffset = mac.length / 4 + mac.def
  let list = [];
  MC2.ll_start(list,mac.y,0+mac.def);           //片翼のMAC位置に線を引く
  MC2.ll_end(list,mac.y,mac.length+mac.def);
  MC2.ll_start(list,0,0+mac.def,LInv);          //中心線にMAC位置表示上
  MC2.ll_end(list,4,0+mac.def);
  MC2.ll_start(list,0,mac.length+mac.def,LInv); //中心線にMAC位置表示下
  MC2.ll_end(list,4,mac.length+mac.def);
  MC2.ll_mOrg(list,0,-macOffset); //オリジン座標をMACの1/4に移動
  MC2.draw(list);
}//ll_mac

function drawRLI(base, part){   //翼線情報の描画
  function reductionRatio(){  //縮小率
    let result = 1;
    let mw_span = apd.mw.span_o;  //主翼幅
    if(Number.isNaN(mw_span)){
      debugger;  cMsg(`縮小率計算失敗: mw_span undefined`);    
    } 
    for(let i = 0; ; i++){  //縮小設定
      if(mw_span <= A5Hp2[0])break;
      mw_span /= 2;
      result /= 2;
    }
    return result;
  }
  if(design.mName === part){ //tableが同一 ?MW
    MC2.save(); // ← 状態を全部保存（色・太さ・その他全て）
      MC2.scale(reductionRatio());  // ← 縮小（相対）
      MC2.draw(apdOl[part]);
    const xx = IDB.dbd.base.val.rect.mw;
    const xx1 = IDB.dbd.base.val.taper.mw;
    const xx2 = IDB.dbd.base.val.sweep.mw;
      //if(part === "vs")MC2.draw(apd.hs,1);
      if(part === "vs")MC2.draw(apdOl.hs,1);
      else ll_mac(ptApd.mac);  //
    MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
  }
}//drawRLI

function crLliP(base, part){   //翼線情報作成と描画
  let macOffset;
//   cMsg(` - ${base}`)
  let list = [];      //片翼座標　系の原点は翼根前縁の下端
  MC2.ll_start(list,0,0,LInv);
  MC2.ll_start(list,apdO.span_o/2,apdO.tipDiff_o,LInv);
  MC2.ll_start(list,apdO.span_o/2,apdO.tipChord_o+apdO.tipDiff_o,LInv);
  MC2.ll_end(list,0,apdO.rootChord_o);
//cMsg(`YY ${list}`);
  let mac = aero.calcMAC(list); //MAC算出
  //dbdBase().val[base][part].mac = mac;
  apdO.mac = mac;  //MAC保存
//cMsg(`XXz ${base} ${mac.length}`);
  if(part != "body"){
    if(part === "vs"){ //双垂直尾翼ならX座標[0]を移動
      const span = apd.hs.span_o/2;
      const diff = apd.hs.tipDiff_o;  // tipDiff_o

      list.forEach(ll => {       //各X座標の移動
        ll[0] += span;
        ll[1] += diff;
      });
      mac = apd.hs.mac;
    }
    macOffset = mac.length / 4 + mac.def
      
    MC2.ll_mOrg(list,0,-macOffset); //オリジン座標をMACの1/4に移動
  }else{
      //未作成
  }

  apdOl ??= {}; //翼線情報の保存
  apdOl[part] = structuredClone(list);

//  drawRLI(step);  //パーツ描画  
  drawRLI(base, part);  //翼線描画
}//crLliP

function rectProc(base, part){  //矩形翼処理
  const color = (name) =>  table.setColor(part, name, cEnble); //入力有効色設定
  let chord,aria,aspect,span,rootChord,tipChord,tipDiff ;
cMsg(`rectProc ${part}`);
  let rectFix = false;  //翼成立フラグ
  if(part === "vs"){
    function chord(){
      if(apdI.chord_i)return apdI.chord_i;
      return Math.sqrt(apdO.area_o / adI.aspect_i);
    }
    //table.setVal (part, "chord_i", chord(), false);
  }
  if(apdI.area_io === ""){   //参考面積なし(初回起動)
    const l = dbdBase().val.base.mw.loading_i;
    const w = dbdBase().val.base.mw.weight_i;
    if(l * w){
      const p = apdI.ariap_i;
      aria = l * w * p;
      table.setVal (part, "area_io", aria, false); //設定して
      if(part === "hs" || part === "vs"){
        table.setVal (part, "area_i", aria, false);
      }
      if(part === "vs"){
        //taria /= 2;  //双垂直尾翼
        //table.setVal (part, "chord_i",Number(dspVal(dsMode.val["hs"]["rootChord_o"])), false);
      }
    }
  }
  span = Number(apdI.hspan_i)*2;
  chord = Number(apdI.chord_i);
  apdO.tipDiff_o = 0;
  if(span*chord == 0 & part === "vs"){
    chord = apd.hs.tipChord_o;
  }
  if((aria = span*chord)){  //翼幅*翼弦で面積が出るなら
    table.setColor(part,"hspan_i",cEnble);
    color("chord_i")
    table.setColor(part,"chord_i",cEnble);
    rectFix = true;   //成立　翼幅*翼弦＝面積
  }else if((aria = Number(apdI.area_i))){ //面積指定
    table.setColor(part, "area_i",cEnble);
  }else if(part === "mw"){   //MWで
    const l = apdI.loading_i;
    const w = apdI.weight_i;
    if(l * w){  //荷重と重量があれば面積が出る
      table.setColor(part,"loading_i",cEnble);
      table.setColor(part,"weight_i",cEnble);
      aria = l * w * 100;
    }
  }
  if(aria && !rectFix){  //面積有効で成立ではない
    if(span + chord){ //幅弦どちらか有効
      if(Number(apdI.hspan_i)){
        chord = aria / span;
        table.setColor(part,"hspan_i",cEnble);
//      }
//      if(Number(apdI.chord_i)){
      }else{
        span = aria / chord;
        table.setColor(part,"chord_i",cEnble);
      }
      rectFix = true;  //成立　面積有効で幅か弦どちらか有効
    }else if((aspect = Number(apdI.aspect_i))){
      chord = Math.sqrt(aria / aspect);
      span = aria / (chord);
      table.setColor(part,"aspect_i",cEnble);
      rectFix = true; //成立　面積とアスペクト比有効
    }
  }
  if(rectFix)aspect = span / chord;
  apdO.aspect_o = aspect;   //アスペクト比確定
  apdO.area_o = aria; //面積確定
  apdO.span_o = span; //翼幅確定
  if(chord != 0){
    rootChord = tipChord = chord;
    apdO.rootChord_o = chord;  //翼根弦確定
    apdO.tipChord_o = chord;   //翼端弦確定
  }
  cvmsg[part] = [];
  let v1,v2;
  cvmsg[part].push(patname[part]);
  cvmsg[part].push(`　面積:　${apdO.area_o}`);

  if(rectFix){
    let taper = 1,sweep = 0;
    if(base !== "rect"){
      taper = Number(apdI.taper_i);   //テーパー入力値
      table.setColor(part,"taper_i",cEnble);
      if(base === "sweep"){
        sweep = Number(apdI.sweep_i);   //後退角入力値
        table.setColor(part,"sweep_i",cEnble);
      }
    }
    if(base === "rect" & part === "vs") {
      rootChord = tipChord = apd.hs.area_o / apd.hs.span_o;
    }else{
      rootChord = (part === "vs")? chord: chord*2 / (taper + 1);
      tipChord = rootChord * taper;
    }
 
    apdO.tipChord_o = tipChord;
    apdO.rootChord_o = rootChord;
    tipDiff = (rootChord - tipChord) * 0.25;
    apdO.span_o = apdO.area_o / ((rootChord + tipChord) * 0.5); //翼幅再計算
    if(Number.isNaN(apdO.span_o)){
      debugger;
    }

    const rad = sweep * Math.PI / 180;
    const tipDiffS = Math.tan(rad) * apdO.span_o;
    tipDiff += tipDiffS;
    apdO.tipDiff_o = tipDiff;

 //cMsg (`sweep ${sweep} ${apdO.rootChord_o} ${apdO.tipChord_o} ${apdO.tipDiff_o}`)
      //apdO.area_o = aria;
/*
    let taper;// = Number(apdI.taper_i);   //テーパー
    let sweep;// = Number(apdI.sweep_i);   //後退角
    if(base === "rect"){
      taper = 1;
      sweep = 0;
    }else{
      taper = Number(apdI.taper_i);   //テーパー
      if(base === "sweep")
        sweep = Number(apdI.sweep_i);   //後退角
    }
    
    table.setColor(part,"taper_i",cEnble);
    if(part === "vs"){
      //apdO.rootChord_o ;
      rootChord = apd.hs.tipChord_o;
      tipChord = rootChord * taper;
      tipDiff = (rootChord - tipChord) / 2;
    }else{    
      rootChord = Number(apdO.rootChord_o)*2 / (taper + 1);
      tipChord = tipChord * taper;
      tipDiff = rootChord*0.25 - tipChord*0.25;
    }
    apdO.tipChord_o = tipChord;
    apdO.rootChord_o = rootChord;
    apdO.tipDiff_o = tipDiff;
    apdO.span_o = apdO.area_o / ((rootChord + tipChord) * 0.5); //翼幅再計算
    if(Number.isNaN(apdO.span_o)){
      debugger;
    }

    if(!sweep){
      apdO.sweepDiff_o = 0;
    }else{
      table.setColor(part,"sweep_i",cEnble);
      const rad = sweep * Math.PI / 180;
      tipDiff = Math.tan(rad) * apdO.span_o;
      //if(tipDiff < 0) tipDiff += apdO.tipChord_o * 0.25;
      //else tipDiff -= apdO.tipChord_o * 0.25;
      tipDiff += (apdO.rootChord_o - apdO.tipChord_o)* 0.25;
      apdO.tipDiff_o = tipDiff;

 //cMsg (`sweep ${sweep} ${apdO.rootChord_o} ${apdO.tipChord_o} ${apdO.tipDiff_o}`)
      //apdO.area_o = aria;
*/      

    crLliP(base, part);
  }

  return rectFix;
}//rectProc

function procB(base, part){  //tabel 計算
  cMsg (`procB ${base} ${part}`);
  apdOl = IDB.dbd.base.val[base];
//  console.log(Object.keys(IDB.dbd.base.val));
//  console.log(Object.keys(base));
//  console.log(apd);
  ptApd = apd[part];
  apdI = apd[part];
  apdO = apd[part];

  //drawRLI(base, part);  //翼線描画
  //crLliP(base, part);  //翼線描画データ作成
  rectProc(base, part);  //計算処理
}

function proc(){  //table input
  if(initF){  //起動処理
    setDomEvent("btn9Start","click", proc, "newDB");
    initF = false;
    initSet();
    return
  }
  MC2.selCanvasBcal("viewP", 4);  //canvas消去
  MC2.selCanvasBcal("workP", 2);
  MC2.selCanvasBcal("partP", 4);

  const base = [["rect","partP", 4], ["taper","viewP", 6], ["sweep","workP", 2]];   //rect, taper, sweep　矩形、テーパー、後退角
  const partsT = ["mw", "hs", "vs"];  //主翼、水平尾翼、垂直尾翼
  function check(a,b,c){ //
    procB(base[b][0], partsT[c]);
  }
  if(1){
    base.forEach(base => {
      MC2.selCanvasBcal(base[1],base[2]);
      partsT.forEach(part=> {
        procB(base[0], part);
      });
    });
  }else{  //デバッグ
    check(0,0,1);
    check(0,0,2);
//    check(0,1,2);
//    check(0,2,2);
  }

  MC2.selCanvasBcal("partA", 6);  //canvas消去
  MC2.selCanvasBcal("workA", 2);
  MC2.selCanvasBcal("viewA", 4);
  parts.setCanvas();  //全体canvasの表示

}

export const BD = {
  proc,  //table input
};
//import { BD } from "./baseDesign.js";
//end of file

/*
  design
   step = ["base", "modif", "bReinfo", "mReinfo"];
    base = {rect, taper, sweep}
      pat = ["mw", "hs", "vs", "top", "back", "mid"];

*/