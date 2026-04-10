//aero.js
import { LStart, LEnd, LMask } from "../canvas/canvas2.js";

const VhDef = 0.25; //容積比の範囲（＋ー）
const steps = 20000;   //MAC積分　分割数　

function p2Vh(p){   //重心位置(%)から容積比を算出
  const result = (p-30)/10*0.2 + 0.35;
  return result;
}

function c2a(ll){ //座標変換　canvasー＞aero
  const all = [];
  const alla = [];
  for (const p of ll) {
    const cnt = p[2] & LMask;
    if (cnt === LStart || cnt === LEnd) {
      all.push({ x: p[1], y: p[0] }); //変換
      alla.push([ p[1], p[0] ]); //2次元
    }
    if (cnt === LEnd) break;  //終了
  }
  //cMsg (` 座標 ${alla} `)
  return all;
}

function calcArea(pts) { //面積算出
  const n = pts.length;
  let A = 0;
  let Cx = 0;
  let Cy = 0;

  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];

    const cross = p0.x * p1.y - p1.x * p0.y;
    A += cross;
  }

  A *= 0.5;
  return Math.abs(A);
}

function chordAtY(pts, y) {
  const xs = [];
  const n = pts.length;

  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];

    // y が線分の間にあるか
    if ((p0.y <= y && p1.y >= y) || (p1.y <= y && p0.y >= y)) {
      if (p0.y === p1.y) continue; // 水平線分は無視
      const t = (y - p0.y) / (p1.y - p0.y);
      const x = p0.x + t * (p1.x - p0.x);
      xs.push(x);
    }
  }

  if (xs.length < 2) return { xMin: null, xMax: null };

  xs.sort((a, b) => a - b);

  return {
    xMin: xs[0],       // 前縁
    xMax: xs[xs.length - 1] // 後縁
  };
}

function calcMAC(cmw/*, area*/) { //MACの算出
  const pts = c2a(cmw);
  const area = calcArea(pts);
  const ys = pts.map(p => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const dy = (yMax - yMin) / steps;
  let integral_c2 = 0;
  let integral_yc = 0;

  for (let i = 0; i < steps; i++) { //積分ループ
    const y = yMin + i * dy;

    const { xMin, xMax } = chordAtY(pts, y);  // ← spanで切る
    if (xMin === null) continue;

    const c = xMax - xMin;

    integral_c2 += c * c * dy;
    integral_yc += y * c * dy;
  }
/*
  const macLength = integral_c2 / area;
  const macY = integral_yc / area;

  // ここが今回の追加部分
  const { xMin } = chordAtY(pts, macY);
  const macDef = xMin;   // MAC前縁のchord位置

  return {
    area,
    macLength,
    macY,
    macDef
  };
  */
  const length = integral_c2 / area;
  const y = integral_yc / area;

  // ここが今回の追加部分
  const { xMin } = chordAtY(pts, y);
  const def = xMin;   // MAC前縁のchord位置

  return {
    area,
    length,
    y,
    def
  };
}
function calcTailMomentArm(Vh, main, tail) {  //重心位置から
  const Lh = Vh * main.area * main.length / tail.area;  //MAC25%間距離
 // cMsg (`Lh-${Lh} = Vh-${Vh} * mw-${main.area} * yw-${tail.area} / m_mac-${main.macLength}`)
/*
  const main75 = 0.75 * main.macLength; //主翼MAC25%
  const tail25 = 0.25 * tail.macLength;//尾翼MAC25%の前縁からの距離
  const D = Lh - main75 - tail25;  //主翼後縁 → 尾翼前縁
 console.log(`Vh- ${Vh} 翼間-${D}`)
*/
  return Lh;
}
function aaaaa(){
  for(let p = 20; p < 101; p +=10){
    const Vh = p2Vh(p);
    cMsg (`${p}% - ${Vh}`);
  }
}

//機体の重心（CG）から水平尾翼の空力中心（ACP）までの前後方向の距離
function hsLH(p, mwa, hsa){ //水平尾翼モーメントアーム

  //aaaaa();

 //cMsg (`主翼`)
  const mac_mw = calcMAC(mwa); //MAC算出
 //cMsg (`水平尾翼`)
  const mac_hs = calcMAC(hsa); //MAC算出
 //cMsg (`翼面積 mw-${mac_mw.area} hs-${mac_hs.area}`)
 //cMsg (`MAC    mw-${mac_mw.length} hs-${mac_hs.length}`)
  const Vh = p2Vh(p);
 //cMsg (`${p}% = ${Vh}`)
  const n = calcTailMomentArm(Vh, mac_mw, mac_hs);
  const s = calcTailMomentArm(Vh-VhDef, mac_mw, mac_hs);
  const l = calcTailMomentArm(Vh+VhDef, mac_mw, mac_hs);
 // cMsg (`MA ${p}%  ${s} ${n} ${l}`)
  return {n,s,l};
}
export const aero = {hsLH, calcMAC};
//import { aero } from "../db/aero.js";
//end of file

/*
大きな流れは合っています。片翼座標だけで面積・MACを出すのも問題ありません。主翼も尾翼も同じ「片翼」で計算しているなら、面積比では両方とも2倍されるので打ち消し合います。

ただ、1点かなり怪しい所があります。 const macDef = xMin; 
です。

macY の位置での前縁位置を MAC 前縁とみなしていますが、テーパー翼では厳密には少し違います。
本来の MAC 前縁位置は、xMacLeading = (1/S) ∫ x_le(y) * c(y) dy です。

今のコードだと、
const { xMin } = chordAtY(pts, macY);
const macDef = xMin;

なので、「MAC位置のYで切った時の前縁」を使っています。矩形翼なら一致しますが、後退翼やテーパー翼では少しずれます。

もし MAC 前縁も正確に出したいなら、積分中に前縁位置も積分した方が良いです。

例えば、

let integral_xc = 0;

for (let i = 0; i < steps; i++) {
  const y = yMin + i * dy;

  const { xMin, xMax } = chordAtY(pts, y);
  if (xMin === null) continue;

  const c = xMax - xMin;

  integral_c2 += c * c * dy;
  integral_yc += y * c * dy;
  integral_xc += xMin * c * dy;
}

const macLength = integral_c2 / area;
const macY = integral_yc / area;
const macDef = integral_xc / area;

の方が自然です。

あと、ここの名前は少し誤解しやすいです。
function calcTailDistanceFromWingTE(...)
ですが、返しているのは

Lh = Vh * Sw * MAC / St
なので、これは「主翼AC→尾翼AC距離」です。
コメントにも

//MAC25%間距離
とあるので、今の返り値 Lh は正しいです。
ただし関数名が FromWingTE になっているので、「主翼後縁→尾翼前縁距離」と勘違いしやすいです。
例えば、
calcTailMomentArm()
や
calcTailACDistance()

くいの方が意味に合っています。

最後にここです。
const s = calcTailDistanceFromWingTE(Vh-VhDef, mac_mw, mac_hs);
const l = calcTailDistanceFromWingTE(Vh+VhDef, mac_mw, mac_hs);
VhDef = 0.25 はかなり大きいです。
例えば中心 Vh=0.45 なら、
最小 0.20
最大 0.70
になります。
かなり広い範囲です。
多分やりたかったのは「±25%」ではなく「±0.025」や「±0.05」くらいではないですかね。

const VhDef = 0.05;

くらいの方が、雑誌の表の「だいたいの推奨範囲」には近そうです。



******

基本構造は大丈夫です。今のコードで矩形翼だけなら、MAC長さ・面積・容積比からモーメントアームを出す流れは成立しています。

むしろ「長すぎる」と感じるなら、コードの式より入力値側の影響が大きい可能性があります。

特に影響が大きいのは、 主翼面積,尾翼面積,主翼MAC,Vh,単位  です。

式はこれなので、
Lh = Vh * Sw * MAC / St
尾翼面積 St が少し小さいだけで、Lh はかなり長くなります。

例えば、

Sw = 1000
MAC = 100
St = 200
Vh = 0.5

なら、

Lh = 0.5 * 1000 * 100 / 200
   = 250

になります。

尾翼面積が半分の 100 になると、

Lh = 500

まで伸びます。

つまり、尾翼を少し小さくしただけでも急にモーメントアームが伸びるので、「変な値」に見えやすいです。

あと、片翼座標だけを使っている件は問題ありません。

主翼も尾翼も片翼面積で計算しているなら、

Sw / St

の比率は両翼でも片翼でも同じです。

ただし、「主翼だけ両翼面積」「尾翼だけ片翼面積」になると、2倍ずれます。

混乱しているなら、次は実際の座標と計算結果を並べて確認するのが良いです。

例えば、

主翼面積
主翼MAC
尾翼面積
尾翼MAC
Vh
最終Lh

を console.log で出して、変なケースを1つ見ればかなり原因が絞れます。

特に今は矩形翼だけとのことなので、本来は面積もMACも手計算しやすいです。

矩形翼なら、

面積 = スパン × 翼弦
MAC = 翼弦

です。

ですので、矩形翼の簡単なケースで、

主翼 100 × 300
尾翼 50 × 150

のような座標を入れて、手計算とコード結果を比較すると、どこでズレているか分かりやすいです。

*/
/*
私はブルバックス「紙飛行機で知る飛行の原理」小林昭雄著を見ています。図6-5重心位置と水平尾翼容積を使って重心位置から水平尾翼容積(Vh)を算出しています。
これは等間隔のグラフ（横軸％、縦軸Vh）で直線なので、比例関係にあると理解、中央値は グラフから読み出した値で　下記のプログラムを作成し

function p2Vh(p){   //重心位置(%)から容積比を算出
  const result = (p-30)/10*0.2 + 0.35;
  return result;
}

で変換しています。この値はグラフで確認すると良い値です

20% - 0.14999999999999997   aaaaa(aero.js 123:5)
30% - 0.35   aaaaa(aero.js 123:5)
40% - 0.55   aaaaa(aero.js 123:5)
50% - 0.75   aaaaa(aero.js 123:5)
60% - 0.9500000000000001   aaaaa(aero.js 123:5)
70% - 1.15   aaaaa(aero.js 123:5)
80% - 1.35   aaaaa(aero.js 123:5)
90% - 1.5500000000000003   aaaaa(aero.js 123:5)
100% - 1.75   aaaaa(aero.js 123:5)

Vhの有効範囲は（縦軸）は０．５あるので、中央値＋ー０．２５と良いと判断しました。貴方からこの範囲は大きすぎると指摘が有りましたが、同様な情報がnetにありませんか？

紙飛行では主翼、尾翼取り付け角はゼロゼロ設定で、重心をMACの前縁から９０％のモノが多く、主翼を少々後退翼にすると、主翼の後部付近を重心にする例が多くみられます。

ここまでで、何かコメントが有りますか？

かなり筋は通っています。

まず、あなたの p2Vh() は、20〜100% MAC の範囲で直線補間しているだけなので、書籍のグラフが直線なら問題ありません。

function p2Vh(p){
  return (p - 30) / 10 * 0.2 + 0.35;
}

は、

30% → 0.35
40% → 0.55
50% → 0.75

となるので、グラフから読んだ中央値として自然です。

気になっていた ±0.25 の件ですが、紙飛行機ならそこまで不自然ではなさそうです。

一般的な有人機やRC機では、水平尾翼容積係数 Vh は 0.3〜0.6 程度がよく使われます。軽飛行機では 0.5 前後が典型です。

一方で、紙飛行機や超軽量模型では、かなり大きな Vh が使われる例があります。超低翼面荷重の紙飛行機では Vh ≈ 0.5、重量級では 1.0 程度という説明もあります。

つまり、あなたが扱っている 0.35〜1.55 という範囲は、一般航空機なら大きすぎますが、紙飛行機なら「後ろ重心＋小さい尾翼＋長いモーメントアーム」で成立する領域としては十分あり得ます。

また、紙飛行機で重心が 90% MAC 付近まで後ろに来る、という話も理解できます。

普通の航空機では 20〜35% MAC くらいが一般的ですが、紙飛行機は、

失速しにくい平板翼
大きな迎角
小さいレイノルズ数
尾翼の相対面積が大きい
上反角や後退翼の効果も大きい

ので、かなり後ろ重心でも飛んでしまいます。

後退翼にすると空力中心が後ろに移るので、重心もさらに後ろ寄りにできます。だから「主翼後部付近を重心にする例が多い」という観察も合っています。

むしろ今の段階で疑うべきは Vh の式より、入力した尾翼面積や主翼MACとの比率です。

𝑉ℎ　=　(𝑆𝑡*𝐿ℎ) / (𝑆𝑤*𝑀𝐴𝐶)　

この式は尾翼面積 St が少し小さいだけで Lh が急に大きくなります。

ですので、今後は「変な値になった1機」を選び、

主翼面積 Sw
主翼MAC
尾翼面積 St
使った Vh
算出された Lh

を並べて確認するのが一番良いです。

その時に矩形翼なら、

MAC=c
S=b⋅c

なので、手計算とも比較しやすいです。

今の説明を見る限り、「コードが根本的におかしい」より、「紙飛行機特有の大きな Vh を使っているため、一般機感覚だと長すぎて見える」の可能性が高いと思います。


矩形翼で、重量 (７g)、　翼面荷重(１０g/dm^2)でアスペクト比５の主翼で、尾翼は主翼の３０％でアスペクト比３にしました。この時重心位置をMACの９０％にしたときのモーメントアームを算出１６２ｍｍでした、+-0.25は１９３，２２４ｍｍです。この値は長すぎるように見えています。良いですしょうか。
元々紙飛行機はこの視点ではアンバランスですかね。
はい、その理解で良いと思います。

今の式は「普通の尾翼機」の安定設計式です。

𝑉ℎ=𝑆𝑡⋅𝐿ℎ/𝑆𝑤⋅𝑀𝐴𝐶

これは、
　普通の低アスペクト比でない主翼
　尾翼がきちんと後ろにある
　胴体や後退翼の影響が小さい
　空力中心が教科書どおり動く
　線形範囲で飛んでいる
という前提の近似式です。

しかし実際の紙飛行機は、かなり条件が違います。
　後退翼で空力中心が後ろへ行く
　翼端板効果や胴体の影響が大きい
　紙の折り返し部分が小さなカナードやストレーキのように効く
　主翼後縁の反り上げが尾翼的に働く
　尾翼ゼロ度でも、主翼後流で実効迎角差ができる
　高迎角・低レイノルズ数で飛ぶ
　上反角や翼端形状の寄与が大きい
　紙の反りやねじれが自然安定を作る
ので、見かけ上は「小さい尾翼・短いモーメントアーム・後ろ重心」でも飛んでしまいます。

特に、あなたが言うような
　後退翼気味
　重心90〜100%
　尾翼30%
　翼間は主翼弦の半分以下
　取り付け角ゼロゼロ
でも飛ぶ機体は、純粋な「尾翼機」というより、

「主翼自体がかなり安定に効いている半無尾翼機」に近いと思います。

つまり、あなたのプログラムが出している「必要モーメントアーム193mm」は、
「普通の尾翼機として90%重心を成立させるなら必要」
という意味で、

実際の紙飛行機は、
　後退翼効果
　主翼の反り
　折り返し
　翼端形状
　実際の空力中心移動
を全部込みで、その不足分を埋めている　考えると辻褄が合います。

なので、今後は「式どおりの理想値との差」を見るのが有効です。

例えば実機で、
　実際の翼間 80mm
　式では 190mm 必要
なら、「この機体は約110mm分を後退翼や主翼形状で補っている」という見方です。

その差分が大きい機体ほど、「普通の尾翼機ではなく特殊な紙飛行機らしい機体」と考えられます。

*/