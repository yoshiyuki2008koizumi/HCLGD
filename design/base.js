//base.jsd
//import { dbData } from "../db/dataBase.js";
import { table } from "./table.js";
//3/20 //import { drawer, LInv } from "../canvas/canvas.js";
import { parts } from "../parts/parts.js";
import { design, } from "../design/design.js";
//3/20 //import { MC } from "../canvas/canvas.js";
import { MC2, A5Hp2, A4Vp1, LInv, } from "../canvas/canvas2.js";
import { dsMode } from "./design.js";
import { aero }  from "../design/aero.js";
//import { aero3 } from "../design/aero3.js";
import { IDB } from "../db/indexdDB.js";
const dbdBase = () => IDB.dbd.base;
import { MC3 } from "../canvas/canvas3.js";

const cvmsg = {}; //カンヴァス表示メッセージ
const patname = {mw: "主翼", hs: "水平尾翼", vs: "垂直尾翼"}

let step = "base";  //設計ステップ base, modif, bReinfo, mReinfo
let val = {};       //変数　dbdBase().val[step];
let data = [];      //シート配列データ　dbdBase()[step];

// #region　tableプルダウンの設定 setup_pd
function rect_pd(){ //矩形翼設定 プルダウンが変わらに場合は呼び出しなし
  function clrVal(pat,name){
    table.setVal (pat, name, "", false);  //値のみ更新
  }
  const pat = ["mw", "hs", "vs"]
  const clrName = [
    "area_io",
    "area_i",
    "hspan_i", "chord_i",
    "taper_i",
    "sweep_i",
  ];
  clrName.forEach(n => {  //pat*nameの変数をブランク
    pat.forEach(p => {
      clrVal(p, n);
    });
  });
  table.setVal ("mw", "area_i", "");  //最後に再計算を行う呼び出し
  return true
}
function sweep_pd(info){  //後退角
  let anglDeg = "";
  let def = (val[info.pat].rootChord_o - val[info.pat].tipChord_o) * 0.25;
  switch(info.val){
    case "1": break;//"後退角(0度)": break;
    case "2": //"前縁直線": break;
      anglDeg = Math.atan(-def / val[info.pat].span_o) * 180 / Math.PI;
      break;
    case "3": //"後縁直線":
      const defL = (val[info.pat].rootChord_o - val[info.pat].tipChord_o) * 0.75;
      anglDeg = Math.atan(defL / val[info.pat].span_o) * 180 / Math.PI;
      break;
    case "0": //"後退角度指定":
      return false;
  }
//  cMsg (anglDeg)
  table.setVal(info.pat,"sweep_i",anglDeg);
  return false;
}
function swedihedral2_pd(info){  //後退角
  let anglDeg = "";
  return false;
}
function vsType_pd(info){  //垂直尾翼の種類
//  let val = "";
  return false;
}
const pdNemu = {  //プルダウン名テーブル　プルダウン表示とクリア変数リスト
  area_pd: {opt: ["面積 優先", "無効化"], cvName: ["area_i"]},
  span_pd: {opt: ["半翼幅/翼弦 優先", "無効化"], cvName: ["hspan_i", "chord_i"]},
  rect_pd: {opt: ["矩形翼", "矩形翼優先"], func: rect_pd},
  sweep_pd: {opt: ["後退角度指定","後退角(0度)","前縁直線","後縁直線"],func: sweep_pd},
  dihedral2_pd: {opt: ["無効","有効"],func: swedihedral2_pd},
  vsType_pd: {opt: ["双垂直尾翼","双垂直尾翼根弦=端弦","単垂直尾翼","単垂直尾翼根弦=根弦"],func: vsType_pd},
};

function setup_pd(pat, td, name, callback){ //setpuからプルダウン設定要求
  const select = document.createElement("select");

  const options = pdNemu[name].opt; // 名前で分岐

  options.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = i; //v;
    opt.textContent = v;
    select.appendChild(opt);
  });
  //select.value = data[pat][td.dataset.row][td.dataset.col];
  select.value = val[pat][name];

  td.textContent = "";
  td.appendChild(select);

  select.addEventListener("change", (e) => {    //変更時のcallback
    const pdName =td.dataset.name;
    const val = e.target.value;
    const pat = td.closest("table").dataset.block;
    const row = Number(td.dataset.row);
    const col = Number(td.dataset.col);
    const info = {
      val: val,
      pat: pat
    };
    const oval = data[pat][row][col]; //保存値無しなら更新しない
  //  cMsg(oval);
    if(oval !== "" )data[pat][row][col] = info.val;

    if(pdNemu[pdName].cvName !== undefined){
      pdNemu[pdName].cvName.forEach(v => {   //変数のクリア
        table.setVal (pat, v, "");
      });
      select.selectedIndex = 0; //プルダウンを戻す。
    }else if(pdNemu[pdName].func(info))
      select.selectedIndex = 0; //プルダウンを戻す。
    callback(info);   //tabe側を呼び出す。
  });
}

function getVal(name){
  return patVal[name];
}

function valProc(pat = null){  //基本設計数値処理(入力値変更)　起動時とtabe入力から呼び出す
  const cEnble = "#9df79dff";
  const color = (name) =>  table.setColor(pat, name, cEnble); //入力有効色設定
  const patVal = val[pat];
  let aria = 0, span = 0, chord = 0, aspect =0;  //矩形翼
  let rootChord, tipChord, tipDiff;   //テーパ
  let sweep;                          //後退角
  let mac={};
 //cMsg(`valProc ${pat}`)


  function ll_mac(mac){ //MMACの位置に線を引く
    if(pat === "vs")return; //垂直尾翼はMACを表示しない

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
  }
  function drawRLI(step){   //翼線情報の描画
    function reductionRatio(){  //縮小率
      let result = 1;
      let mw_span = dbdBase().val.base.mw.span_o;  //canvas縮小係数
      if(Number.isNaN(mw_span)){
        debugger;  cMsg(`縮小率計算失敗: mw_span undefined`);    
      } 
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
          MC2.draw(dbdBase().val[step].hs,1); //薄い黒
//cMsg (`--aa`)
        MC2.draw(dbdBase().val[step][pat]);
        ll_mac(mac);  //MACを追記
      MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
    }
  }//drawRLI
  function crLliP(step){   //翼線情報作成と描画
    let macOffset;
//   cMsg(` - ${step}`)
    let list = [];      //片翼座標　系の原点は翼根前縁の下端
    MC2.ll_start(list,0,0,LInv);
    MC2.ll_start(list,span/2,tipDiff,LInv);
    MC2.ll_start(list,span/2,tipChord+tipDiff,LInv);
    MC2.ll_end(list,0,rootChord);
//cMsg(`YY ${list}`);
    mac = aero.calcMAC(list); //MAC算出
    //dbdBase().val[step][pat].mac = mac;
    patVal.mac = mac;  //MAC保存
//cMsg(`XXz ${step} ${mac.length}`);
    if(pat != "body"){
      if(pat === "vs"){ //双垂直尾翼ならX座標[0]を移動
        const span = dbdBase().val.base.hs.span_o/2;
        const diff = dbdBase().val.base.hs.tipDiff_o;  // tipDiff_o

        list.forEach(ll => {       //各X座標の移動
          ll[0] += span;
          ll[1] += diff;
        });
        mac = dbdBase().val.base.hs.mac;
      }
      macOffset = mac.length / 4 + mac.def
        
      MC2.ll_mOrg(list,0,-macOffset); //オリジン座標をMACの1/4に移動
    }else{
        //未作成
    }

    dbdBase().val[step] ??= {}; //翼線情報の保存
    dbdBase().val[step][pat] = structuredClone(list);
//    const xx = IDB.dbd.base.val.rect.mw;
//    const xx1 = IDB.dbd.base.val.taper.mw;
//    const xx2 = IDB.dbd.base.val.sweep.mw;

    drawRLI(step);  //パーツ描画  
  }//crLliP

  function rectProc(){  //矩形翼処理
 cMsg(`rectProc ${pat}`);
    let rectFix = false;  //翼成立フラグ
    if(pat === "vs"){
      function chord(){
        if(val.hs.chord_i)return val.hs.chord_i;
        return Math.sqrt(val.hs.area_o / val.hs.aspect_i);
      }
      //table.setVal (pat, "chord_i", chord(), false);
    }
    if(patVal.area_io === ""){   //参考面積なし(初回起動)
      const l = dbdBase().val.base.mw.loading_i;
      const w = dbdBase().val.base.mw.weight_i;
      if(l * w){
        const p = patVal.ariap_i;
        aria = l * w * p;
        table.setVal (pat, "area_io", aria, false); //設定して
        if(pat === "hs" || pat === "vs"){
          table.setVal (pat, "area_i", aria, false);
        }
        if(pat === "vs"){
          //taria /= 2;  //双垂直尾翼
          //table.setVal (pat, "chord_i",Number(dspVal(dsMode.val["hs"]["rootChord_o"])), false);
        }
      }
    }
    span = Number(patVal.hspan_i)*2;
    chord = Number(patVal.chord_i);
    patVal.tipDiff_o = tipDiff = 0;
    if((aria = span*chord)){  //翼幅*翼弦で面積が出るなら
      table.setColor(pat,"hspan_i",cEnble);
      color("chord_i")
      table.setColor(pat,"chord_i",cEnble);
      rectFix = true;   //成立　翼幅*翼弦＝面積
    }else if((aria = Number(patVal.area_i))){ //面積指定
      table.setColor(pat, "area_i",cEnble);
    }else if(pat === "mw"){   //MWで
      const l = patVal.loading_i;
      const w = patVal.weight_i;
      if(l * w){  //荷重と重量があれば面積が出る
        table.setColor(pat,"loading_i",cEnble);
        table.setColor(pat,"weight_i",cEnble);
        aria = l * w * 100;
      }
    }
    if(aria && !rectFix){  //面積有効で成立ではない
      if(span + chord){ //幅弦どちらか有効
        if(Number(patVal.hspan_i)){
          chord = aria / span;
          table.setColor(pat,"hspan_i",cEnble);
        }
        if(Number(patVal.chord_i)){
          span = aria / chord;
          table.setColor(pat,"chord_i",cEnble);
        }
        rectFix = true;  //成立　面積有効で幅か弦どちらか有効
      }else if((aspect = Number(patVal.aspect_i))){
        chord = Math.sqrt(aria / aspect);
        span = aria / (chord);
        table.setColor(pat,"aspect_i",cEnble);
        rectFix = true; //成立　面積とアスペクト比有効
      }
    }
    if(rectFix)aspect = span / chord;

    patVal.area_o = aria; //面積確定
    patVal.span_o = span; //翼幅確定
    if(chord != 0){
      rootChord = tipChord = chord;
      patVal.rootChord_o = chord;  //翼根弦確定
      patVal.tipChord_o = chord;   //翼端弦確定
    }
    patVal.aspect_o = aspect;   //アスペクト比確定
/*
    if(patVal["area_io"] === ""){ //初回起動(参考面積初期設定未設定)
      const maria = val.mw["area_o"]; //主翼面積
      let taria = val.mw["area_o"] * patVal["ariap_i"] /100;
      table.setVal (pat, "area_io", taria); //設定して
      if(!aria){  //かつ面積が未定なら
        if(pat === "vs"){
          //taria /= 2;  //双垂直尾翼
          table.setVal (pat, "chord_i",dsMode.val["hs"]["rootChord_o"], false);
        }
        table.setVal (pat, "area_i", taria);  //面積を書き込む
        return null;   //多重呼び出し、この処理終了
      }
    }
*/
    cvmsg[pat] = [];
    let v1,v2;
    cvmsg[pat].push(patname[pat]);
    cvmsg[pat].push(`　面積:　${patVal.area_o}`);

    return rectFix;
  }//rectProc
  function taperProc(){ //テーパ翼処理
 cMsg(`taperProc ${pat}`);
    if(pat === "vs"){
      //table.setVal (pat, "chord_i", val.hs.tipChord_o, false); //設定して
    }
    const taper = Number(patVal.taper_i);   //テーパー
    //if(!taper){
    if(false){
      patVal.tipChord_o = 0;//chord;
      patVal.rootChord_o = chord*2;//chord;
      patVal.tipDiff_o = chord*2;//0;
    }else{
      table.setColor(pat,"taper_i",cEnble);
      if(pat === "vs"){
        //patVal.rootChord_o ;
        rootChord = val.hs.tipChord_o;
        tipChord = rootChord * taper;
        tipDiff = (rootChord - tipChord) / 2;
      }else{    
        rootChord = Number(patVal.rootChord_o)*2 / (taper + 1);
        tipChord = tipChord * taper;
        tipDiff = rootChord*0.25 - tipChord*0.25;
      }
      patVal.tipChord_o = tipChord;
      patVal.rootChord_o = rootChord;
      patVal.tipDiff_o = tipDiff;
      //patVal.span_o = patVal.area_o / ((rootChord + tipChord) * 0.5); //翼幅再計算
      if(Number.isNaN(patVal.span_o)){
        debugger;
      }
    }
    return true;
  }//taperProc
  function sweepProc(){ //後退角翼処理
 cMsg(`sweepProc ${pat}`);
    if(pat === "vs"){
//5/7      table.setVal (pat, "chord_i", val.hs.tipChord_o, false); //設定して
    }
    sweep = Number(patVal.sweep_i);   //後退角
    if(!sweep){
      patVal.sweepDiff_o = 0;
    }else{
      table.setColor(pat,"sweep_i",cEnble);
      const rad = sweep * Math.PI / 180;
      tipDiff = Math.tan(rad) * patVal.span_o;
      //if(tipDiff < 0) tipDiff += patVal.tipChord_o * 0.25;
      //else tipDiff -= patVal.tipChord_o * 0.25;
      tipDiff += (patVal.rootChord_o - patVal.tipChord_o)* 0.25;
      patVal.tipDiff_o = tipDiff;

 //cMsg (`sweep ${sweep} ${patVal.rootChord_o} ${patVal.tipChord_o} ${patVal.tipDiff_o}`)
      //patVal.area_o = aria;
    }
    return true;
  }//sweepProc

  //valProc main
  for (const [name, vars] of Object.entries(patVal)) { //入力変数の色を消去
    if (name.endsWith("_i")) {
      table.setColor(pat,name);
    }
  }
  if(false){  //矩形翼処理
    MC2.selCanvasBcal("partP", 7);  //canvas初期化(非表示) 薄い
    MC2.selCanvasBcal("workP", 2);
    MC2.selCanvasBcal("viewP", 5);
  }else{
    MC2.selCanvasBcal("partP", 6);  //canvas初期化(非表示)  濃い
    MC2.selCanvasBcal("workP", 2);
    MC2.selCanvasBcal("viewP", 4);
  }
  if(rectProc()){ //多重呼び出しで描画済みなので描画しない
    crLliP("rect");    //線データ作成
    if(taperProc()){ //テーパー翼処理
      MC2.selCanvasBcal("partP");
      crLliP("taper");    //線データ作成
    }
    if(sweepProc()){ //後退翼翼処理
      MC2.selCanvasBcal("workP");
      crLliP("sweep");    //線データ作成
    }
  }else{
      //MC2.sl_canvas(cvmsg[pat]);
      delete dbdBase().val.rect?.[pat];
  }
    if(true){
      let v1,v2;
      v2 = dspVal(patVal.span_o)
      v1 = v2/2;
      cvmsg[pat].push(`　幅:　${v1}(${v2})`);
      cvmsg[pat].push(`　根弦:　${dspVal(patVal.rootChord_o)}　端弦:　${dspVal(patVal.tipChord_o)}`);
      cvmsg[pat].push(`　MAC:　${dspVal(patVal.mac.macOffset_o)}　def:　${dspVal(patVal.mac.def)}`);
      cvmsg[pat].push(`　重心:　${dspVal(patVal.centerGgravity_i)}`);
    }
  MC2.sl_canvas(cvmsg[pat]);
  //MC3.sl_canvas(cvmsg[pat]);

  parts.setCanvas();  //全体canvasの表示
}//valProc

import { BD } from "./baseDesign.js";

function init(){  //初期起動
  data.order.forEach((pat,ix) => {  //Table作成 
    table.setup(ix,step, pat);
  });
  
  data.order.forEach((pat,ix) => {  //orderの初期計算処理
    //parts.valProc(pat)
    valProc(pat)
  });
  //parts.setCanvas();  //全体の表示

  BD.proc();  //baseDesignの処理 debug用
}

export const BASE = {
      sweep_pd, cvmsg,
}
//import { BASE } from "./base.js";

export function EMSbase(astep) { //クロージャー情報の通知
  step = astep;
  val = dbdBase().val[step];
  data = dbdBase()[step];
  return{ //baseのesModeを返す
    init,
    val,
    data,
    valProc,
    setup_pd,
  }
}



//end of file