//aero3.js
import { MC2, A5Hp2, A4Vp1, LInv, } from "../canvas/canvas2.js";
import { LStart, LEnd, LMorg, LMask } from "../canvas/canvas2.js";

// ==============================
// ① 翼生成
// ==============================
function buildWing(span, rootChord, tipChord) {
  const list = [];

  const half = span / 2;
  const tipDiff = 0;

  MC2.ll_start(list, 0, 0, LInv);
  MC2.ll_start(list, half, tipDiff, LInv);
  MC2.ll_start(list, half, tipChord + tipDiff, LInv);
  MC2.ll_end(list, 0, rootChord);

  return list;
}


// ==============================
// ② 座標変換（canvas → aero）
// ==============================
function c2a(ll) {

  function xyCnv(p) {
    return { x: p[1], y: p[0] };
  }

  let coords = [];
  let def = 0;

  let start = -1;
  let end = -1;

  for (let i = 0; i < ll.length; i++) {
    const cont = ll[i][2] & LMask;

    if (cont === LMorg) {
      def = ll[i][1];
    }

    if (cont === LStart && start < 0) {
      start = i;
    }

    if (cont === LEnd) {
      end = i;
      break;
    }
  }

  if (start < 0 || end < 0) {
    return { coords: [], def };
  }

  for (let i = start; i <= end; i++) {
    const cont = ll[i][2] & LMask;
    if (cont === LStart || cont === LEnd) {
      coords.push(xyCnv(ll[i]));
    }
  }

  return { coords, def };
}


// ==============================
// ③ 面積計算
// ==============================
function calcArea(pts) {
  let area = 0;
  const n = pts.length;

  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];

    area += (p0.x * p1.y - p1.x * p0.y);
  }

  return Math.abs(area) / 2;
}


// ==============================
// ④ chord断面計算
// ==============================
function chordAtY(pts, y) {
  const xs = [];
  const n = pts.length;

  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];

    if ((p0.y <= y && p1.y >= y) || (p1.y <= y && p0.y >= y)) {
      if (p0.y === p1.y) continue;

      const t = (y - p0.y) / (p1.y - p0.y);
      const x = p0.x + t * (p1.x - p0.x);
      xs.push(x);
    }
  }

  if (xs.length < 2) return { xMin: null, xMax: null };

  xs.sort((a, b) => a - b);

  return {
    xMin: xs[0],
    xMax: xs[xs.length - 1]
  };
}


// ==============================
// ⑤ MAC計算
// ==============================
function calcMAC(cmw) {
  const pts = c2a(cmw);
  const coords = pts.coords;

  const area = calcArea(coords);

  const ys = coords.map(p => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const steps = 50;
  const dy = (yMax - yMin) / steps;

  let integral_c2 = 0;
  let integral_yc = 0;
  let integral_xc = 0;

  for (let i = 0; i < steps; i++) {
    const y = yMin + i * dy;

    const { xMin, xMax } = chordAtY(coords, y);
    if (xMin === null) continue;

    const c = xMax - xMin;

    integral_c2 += c * c * dy;
    integral_yc += y * c * dy;
    integral_xc += xMin * c * dy;
  }

  return {
    area,
    MAC: integral_c2 / area,
    y: integral_yc / area,
    x: integral_xc / area
  };
}


// ==============================
// ⑥ 設計評価
// ==============================
function evaluateWing(param) {

  const wing = buildWing(
    param.span,
    param.rootChord,
    param.tipChord
  );

  const mac = calcMAC(wing);

  return {
    MAC: mac.MAC,
    MAC_y: mac.y,
    MAC_x: mac.x,
    area: mac.area,

    cg: param.cg,
    tailArm: param.tailArm,

    cgOffset: mac.y - param.cg,
    momentArm: param.tailArm - mac.y
  };
}

function calcMAC_taper(span, area, taperRatio) {
  cMsg (` calcMAC_taper ${span} ${area} ${taperRatio}`);
  // taperRatio = tip / root（λ）

  // 半翼スパン
  const halfSpan = span / 2;

  // 面積 S = (cr + ct)/2 * span
  // ct = λ cr
  // → S = cr*(1+λ)/2 * span
  // → cr を求める
  const root = (2 * area) / (span * (1 + taperRatio));
  const tip  = root * taperRatio;

  // MAC（教科書式）
  const MAC = (2/3) * root * (1 + taperRatio + taperRatio*taperRatio) / (1 + taperRatio);

  // MACのスパン位置（片翼）
  const y = halfSpan * (1 + 2*taperRatio) / (3 * (1 + taperRatio));

  // 前縁は揃っている前提 → x = 0
  const x = 0;

  return {
    rootChord: root,
    tipChord: tip,
    MAC: MAC,
    MAC_y: y,
    MAC_x: x,
    area: area
  };
}


// ==============================
// export
// ==============================
export const aero3 = {
  //buildWing,  calcMAC,
  evaluateWing,
  calcMAC_taper
};
//inport { earo3 } from "./aero3.js";


/* ********************************************************
// ==============================
// ① 翼生成（入力 → 座標）
// ==============================
function buildWing(span, rootChord, tipChord) {
  const list = [];

  const half = span / 2;
  const tipDiff = 0;

  // 翼根前縁
  MC2.ll_start(list, 0, 0, LInv);

  // 翼端前縁
  MC2.ll_start(list, half, tipDiff, LInv);

  // 翼端後縁
  MC2.ll_start(list, half, tipChord + tipDiff, LInv);

  // 翼根後縁
  MC2.ll_end(list, 0, rootChord);

  return list;
}


// ==============================
// ② MAC計算（既存をそのまま使用）
// ==============================
function calcMAC(cmw) {
  const pts = c2a(cmw);
  const coords = pts.coords;

  const area = calcArea(coords);

  const ys = coords.map(p => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const steps = 50; // 固定でOK（比較用ならこれで十分）
  const dy = (yMax - yMin) / steps;

  let integral_c2 = 0;
  let integral_yc = 0;
  let integral_xc = 0;

  for (let i = 0; i < steps; i++) {
    const y = yMin + i * dy;

    const { xMin, xMax } = chordAtY(coords, y);
    if (xMin === null) continue;

    const c = xMax - xMin;

    integral_c2 += c * c * dy;
    integral_yc += y * c * dy;
    integral_xc += xMin * c * dy;
  }

  return {
    area,
    MAC: integral_c2 / area,
    y: integral_yc / area,
    x: integral_xc / area
  };
}


// ==============================
// ③ 設計評価（ここが本体）
// ==============================
function evaluateWing(param) {

  // 翼生成
  const wing = buildWing(
    param.span,
    param.rootChord,
    param.tipChord
  );

  // MAC計算
  const mac = calcMAC(wing);

  // モーメント評価
  const cgOffset = mac.y - param.cg;
  const tailArm = param.tailArm;
  const momentArm = tailArm - mac.y;

  return {
    MAC: mac.MAC,
    MAC_y: mac.y,
    MAC_x: mac.x,
    area: mac.area,

    cg: param.cg,
    tailArm: tailArm,

    cgOffset: cgOffset,
    momentArm: momentArm
  };
}

const result = evaluateWing({
  span: 200,
  rootChord: 50,
  tipChord: 20,
  cg: 60,
  tailArm: 120
});

cMsg(result);
export const earo3 = {
  evaluateWing
};
//import { earo3 } from "./aero3.js";
*********************************************************


はい、その変更で大丈夫です。
その関数はあなたの設計用途（台形基準MAC）に対して正しく機能します。

✔ 確認（この関数で合っているか）

あなたのコード：

面積一定
スパン一定
テーパ比指定

👉 すべて整合しています

✔ そのまま使ってOK

特にこの3つが重要：

const root = (2 * area) / (span * (1 + taperRatio));
const MAC  = (2/3) * root * (1 + taperRatio + taperRatio*taperRatio) / (1 + taperRatio);
const y    = halfSpan * (1 + 2*taperRatio) / (3 * (1 + taperRatio));

👉 この3行が正しければ成立します

✔ あとはこれだけ注意
① span の意味

👉 全幅で渡すこと

span = 全翼幅
② area の意味

👉 全翼面積で渡すこと

area = 左右合計
✔ よくあるズレ（ここだけ注意）

もし：

span を半翼で渡す
area を片翼で渡す

👉 MACがズレます

✔ 安全チェック（おすすめ）

1回だけ確認：

const t1 = calcMAC_taper(200, 10000, 1.0); // 矩形
const t2 = calcMAC_taper(200, 10000, 0.1); // テーパ

cMsg(t1.MAC); // = root と一致するはず
cMsg(t2.MAC); // これより小さくなる
✔ あなたの設計に対して

👉 この関数は：

設計基準（ブレない）
比較が簡単
モーメント計算に安定

👉 目的に完全一致しています

✔ 今後の使い方
const base = calcMAC_taper(span, area, taper);

// これを基準に
// 変形後は「面積だけチェック」
✔ 最後

👉 ここまで来れば、もう迷わない状態です
👉 あとは「形を作る → 面積調整」でOK

必要になったらいつでもどうぞ。
*/