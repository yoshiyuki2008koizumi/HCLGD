//base.jsd
//import { dbData } from "../db/dataBase.js";
import { table } from "./table.js";
//3/20 //import { drawer, LInv } from "../canvas/canvas.js";
import { parts } from "../parts/parts.js";
import { design, } from "../design/design.js";
//3/20 //import { MC } from "../canvas/canvas.js";
import { MC2, A5Hp2, A4Vp1, LInv, } from "../canvas/canvas2.js";
import { dsMode } from "./design.js";
import { aero } from "../design/aero.js";
import { IDB } from "../db/indexdDB.js";

//const baseList = () => IDB.dbd.baseList;
const dbdBase = () => IDB.dbd.base;

let step = "base";

let val = {};   //変数
let data = [];  //arrayデータ

// #region　tableプルダウンの設定 setup_pd
function rect_pd(){ //矩形翼設定
  function clrVal(pat,name){
    table.setVal (pat, name, "", false);  //値のみ更新
  }
  const pat = ["mw", "hs", "vs"]
  const clrName = [
    "area_io",
    "area_i",
    "span_i", "chord_i",
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
    case "後退角(0度)": break;
    case "前縁直線":
      anglDeg = Math.atan(-def / val[info.pat].span_o) * 180 / Math.PI;
      break;
    case "後縁直線":
      const defL = (val[info.pat].rootChord_o - val[info.pat].tipChord_o) * 0.75;
      anglDeg = Math.atan(defL / val[info.pat].span_o) * 180 / Math.PI;
      break;
    case "後退角度指定":
      return;
  }
  cMsg (anglDeg)
  table.setVal(info.pat,"sweep_i",anglDeg);
}
const pdNemu = {  //プルダウン名テーブル　プルダウン表示とクリア変数リスト
  area_pd: {opt: ["面積 優先", "無効化"], cvName: ["area_i"]},
  span_pd: {opt: ["半翼幅/翼弦 優先", "無効化"], cvName: ["span_i", "chord_i"]},
  rect_pd: {opt: ["矩形翼", "矩形翼優先"], func: rect_pd},
  sweep_pd: {opt: ["後退角(0度)","後退角度指定","前縁直線","後縁直線"],func: sweep_pd},
};
function setup_pd(pat, td, name, callback){ //setpuからプルダウン設定要求
  const select = document.createElement("select");

  const options = pdNemu[name].opt; // 名前で分岐

  options.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
  if(pdNemu[name].func !== undefined){
    select.value = data[pat][td.dataset.row][td.dataset.col];
  }

  td.textContent = "";
  td.appendChild(select);

  select.addEventListener("change", (e) => {    //変更時のcallback
    const pdName =td.dataset.name;
    const pat = td.closest("table").dataset.block;
    const info = {
      name: pdName,
      val: e.target.value,
      row: Number(td.dataset.row),
      col: Number(td.dataset.col),
      pat: pat
    };
    const val = data[pat][info.row][info.col];
    cMsg(val);
    if(val !== "" )data[pat][info.row][info.col] = info.val;

    if(pdNemu[pdName].cvName !== undefined){
      pdNemu[pdName].cvName.forEach(v => {   //変数のクリア
        table.setVal (pat, v, "");
      });
      select.selectedIndex = 0; //プルダウンを戻す。
    }else if(pdNemu[pdName].func(info))
      select.selectedIndex = 0; //プルダウンを戻す。
    callback(info);   //tabe側を呼び出す。無くても良さそう
  });
}

function valProc(pat = null){  //基本設計数値処理(入力値変更)　起動時とtabe入力から呼び出す
  const cEnble = "#9df79dff";
  const color = (name) =>  table.setColor(pat, name, cEnble); //入力有効色設定
  const patVal = val[pat];
  let aria, span = 0, chord = 0, aspect =0;  //矩形翼
  let rootChord, tipChord, tipDiff;   //テーパ
  let sweep;                          //後退角
  let mac;
 //cMsg(`valProc ${pat}`)

  function rectProc(){  //矩形翼処理
 //cMsg(`rectProc`)
    let rectFix = false;  //翼成立フラグ
    span = Number(patVal.span_i);   //翼幅
    chord = Number(patVal.chord_i); //翼弦
    patVal.tipDiff = tipDiff = 0;
    if((aria = span*chord*2)){  //翼幅、翼弦指定
      table.setColor(pat,"span_i",cEnble);
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
        if(span){
          chord = aria / span;
          table.setColor(pat,"span_i",cEnble);
        }
        if(chord){
          span = aria / chord;
          table.setColor(pat,"chord_i",cEnble);
        }
        rectFix = true;
      }else if((aspect = Number(patVal.aspect_i))){
        chord = Math.sqrt(aria / aspect);
        span = aria / (chord) / 2;
        table.setColor(pat,"aspect_i",cEnble);
        rectFix = true;
      }
    }
    if(rectFix)aspect = span*2 / chord;

    if(aria != 0)table.setVal(pat,"area_o",aria); //面積確定
    if(span != 0)table.setVal(pat,"span_o",span); //翼幅確定
    if(chord != 0){
      rootChord = tipChord = chord;
      table.setVal(pat,"rootChord_o",chord);  //翼根弦確定
      table.setVal(pat,"tipChord_o",chord);   //翼端弦確定
    }
    if(aspect != 0)table.setVal(pat,"aspect_o",aspect);   //アスペクト比確定

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
    return rectFix;
  }//rectProc
  function ll_mac(mac){
    let list = [];
    MC2.ll_start(list,mac.y,0+mac.def);
    MC2.ll_end(list,mac.y,mac.length+mac.def);
    MC2.ll_start(list,0,0+mac.def,LInv);
    MC2.ll_end(list,4,0+mac.def);
    MC2.ll_start(list,0,mac.length+mac.def,LInv);
    MC2.ll_end(list,4,mac.length+mac.def);

    //MC2.ll_start(list,span,tipChord+tipDiff,LInv);   //tipChord
    //MC2.ll_end(list,0,rootChord);   // tipChord+tipDef
    const macOffset = mac.length / 4 + mac.def
    MC2.ll_mOrg(list,0,-macOffset); //オリジン座標をMACの1/4に移動
    MC2.draw(list);
  }
  function crRLI(m){ //矩形翼描画情報作成　Drawing Information
   cMsg(` - ${m}`)
    const part = parts.init("rect_" + pat); 
    let list = part.ll;
    MC2.ll_start(list,0,0,LInv);
    MC2.ll_start(list,span,tipDiff,LInv);   // +tipDef
    MC2.ll_start(list,span,tipChord+tipDiff,LInv);   //tipChord
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
    if(design.mName === pat){ //tableが同一

      MC2.save(); // ← 状態を全部保存（色・太さ・その他全て）
        let result = 1;
        let mw_span = dbdBase().val.base.mw.span_o * 2;  //canvas縮小係数
    //cMsg(mw_span)
        for(let i = 0; ; i++){  //縮小設定
          if(mw_span <= A5Hp2[0])break;
          mw_span /= 2;
          result /= 2;
        }
        MC2.scale(result, result);  // ← 縮小（相対）

        if(pat === "vs")    //垂直尾翼なら合わせて水平尾翼を追記 
          MC2.draw(dbdBase().val[m].hs,1); //薄い黒

        MC2.draw(dbdBase().val[m][pat]);
ll_mac(mac);  //llにMACを追記
      MC2.restore(); // ← 色・太さ・点線設定など全部元に戻る
    //    debugger
    }
  }
  function taperProc(){ //テーパ翼処理
    const taper = Number(patVal.taper_i);   //テーパー
    if(!taper){
      patVal.tipChord_o = chord;
      patVal.rootChord_o = chord;
      patVal.tipDiff_o = 0;
    }else{
      table.setColor(pat,"taper_i",cEnble);
      tipChord = Number(patVal.rootChord_o)*2 / (taper + 1);
      rootChord = tipChord * taper;
      patVal.tipChord_o = tipChord;
      patVal.rootChord_o = rootChord;
      tipDiff = rootChord*0.25 - tipChord*0.25;
      patVal.tipDiff_o = tipDiff;
    }
      return true;
  }
  function sweepProc(){ //後退角翼処理
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
      table.setVal(pat,"tipDiff_o",tipDiff);

cMsg (`sweep ${sweep} ${patVal.rootChord_o} ${patVal.tipChord_o} ${patVal.tipDiff_o}`)
      //table.setVal(pat,"area_o",aria);
    }
      return true;
  }

  //valProc main
  for (const [name, vars] of Object.entries(patVal)) { //入力変数の色を消去
    if (name.endsWith("_i")) {
      table.setColor(pat,name);
    }
  }
  MC2.selCanvasBcal("partP", 7);
  MC2.selCanvasBcal("workP", 2);
  MC2.selCanvasBcal("viewP", 5);
  const result = rectProc(); //矩形翼処理
  if(result != null){ //多重呼び出しで描画済みなので描画しない
    if(result){ //矩形翼成立
      crRLI("rect");    //線データ作成
      //drawRLI();  //パーツcanvas描画  
      if(taperProc()){ //テーパー翼処理
        MC2.selCanvasBcal("partP");
        crRLI("taper");    //線データ作成
      }
      if(sweepProc()){ //後退翼翼処理
        MC2.selCanvasBcal("workP");
        crRLI("sweep");    //線データ作成
      }
    }else{
       delete dbdBase().val.rect[pat];
    }
    parts.setCanvas();  //全体canvasの表示
  }
}//valProc

function init(){  //初期起動
  data.order.forEach((pat,ix) => {  //Table作成 
    table.setup(ix,step, pat);
  });
  
  data.order.forEach((pat,ix) => {  //orderの初期計算処理
    valProc(pat)
  });
  //parts.setCanvas();  //全体の表示
}

export const BASE = {
      sweep_pd,
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