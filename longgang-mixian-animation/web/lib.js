// 手繪線稿引擎：rough.js 抖動線條 + 邊畫邊出現 + 可重用元件
const W = 1920, H = 1080;
const G = { t: 0, f: 0, boil: 0, lt: 0 };
const PAL = {
  day:   { bg: '#f3ecdc', ink: '#2b2520', fill: '#f4eee0', soft: '#8a7c68', red: '#c23a2b', pink: '#e59c98', gold: '#c7963a', glow: '#f3c565' },
  night: { bg: '#15213d', ink: '#ead9a6', fill: '#17243f', soft: '#7d86a0', red: '#e3664f', pink: '#eaa2a0', gold: '#f2c86a', glow: '#ffd88a' },
};
let P = PAL.day;
const RG = rough.generator();
let SID = 0;
const RCACHE = new Map();

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = x => { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
const easeOut = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const easeBack = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const sub = (p, a, b) => clamp((p - a) / (b - a));
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const f1 = v => Math.round(v * 10) / 10;
// 場景內時間進度：t0 秒開始，dur 秒畫完
const dr = (t0, dur) => clamp((G.lt - t0) / dur);

// ---------- 路徑工具 ----------
const M = (x, y) => `M${f1(x)} ${f1(y)}`;
const line = (x1, y1, x2, y2) => `M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`;
const poly = (pts, close) => pts.map((p, i) => (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join('') + (close ? 'Z' : '');
const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
// Catmull-Rom 平滑曲線
function curve(pts, close) {
  const n = pts.length; if (n < 2) return '';
  const g = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  let d = M(pts[0][0], pts[0][1]);
  const segs = close ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + (close ? 'Z' : '');
}
function ellPts(cx, cy, rx, ry, n = 16, a0 = 0, a1 = Math.PI * 2) {
  const pts = []; const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  const m = full ? n : n + 1;
  for (let i = 0; i < m; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return pts;
}
const ell = (cx, cy, rx, ry, n = 16) => curve(ellPts(cx, cy, rx, ry, n), true);
const arc = (cx, cy, rx, ry, a0, a1, n = 10) => curve(ellPts(cx, cy, rx, ry, n, a0, a1), false);

// ---------- 手繪筆觸 ----------
function roughD(d, o) {
  const key = d + '|' + o.seed + '|' + o.roughness + '|' + o.bowing;
  let v = RCACHE.get(key);
  if (v === undefined) {
    const dw = RG.path(d, o);
    v = RG.toPaths(dw).map(p => p.d).join(' ');
    if (RCACHE.size > 40000) RCACHE.clear();
    RCACHE.set(key, v);
  }
  return v;
}
// sk：畫一筆手繪線（可帶底色遮擋後景）
// o: p 進度, c 線色, w 線寬, fill 底色(true=紙色), fo 底色透明, wash 淡彩, hatch 排線色, r 粗糙度, op 透明度, dbl 雙線
function sk(d, o = {}) {
  const id = ++SID;
  const p = o.p === undefined ? 1 : o.p;
  if (p <= 0 || !d) return '';
  const op = o.op === undefined ? 1 : o.op;
  if (op <= 0.003) return '';
  let s = '';
  const fp = clamp(p * 4);
  if (o.fill) s += `<path d="${d}" fill="${o.fill === true ? P.fill : o.fill}" fill-opacity="${f1((o.fo ?? 1) * fp * 100) / 100}"/>`;
  if (o.wash) s += `<path d="${d}" fill="${o.wash}" fill-opacity="${f1((o.wo ?? .55) * sub(p, .5, 1) * 100) / 100}"/>`;
  if (o.hatch) {
    const hk = 'H|' + d + '|' + o.hatch + '|' + (o.hg || 9) + '|' + (o.ha ?? -41) + '|' + (id % 7);
    let hp = RCACHE.get(hk);
    if (hp === undefined) {
      const all = RG.toPaths(RG.path(d, { seed: 1 + (id % 7) * 131, roughness: 1, stroke: 'none', fill: o.hatch, fillStyle: 'hachure', hachureGap: o.hg || 9, fillWeight: o.hw || 1.6, hachureAngle: o.ha ?? -41 }));
      hp = all.filter(x => x.stroke === o.hatch).map(x => x.d).join(' ');
      RCACHE.set(hk, hp);
    }
    s += `<path d="${hp}" fill="none" stroke="${o.hatch}" stroke-width="${o.hw || 1.6}" stroke-linecap="round" opacity="${f1(sub(p, .45, 1) * .8 * 100) / 100}"/>`;
  }
  if (o.c === 'none') return op < 1 ? `<g opacity="${op}">${s}</g>` : s;
  const c = o.c || P.ink, w = o.w || 3;
  const seed = 1 + (id * 9973 + G.boil * 7919) % 2000000;
  const rs = roughD(d, { seed, roughness: o.r ?? .85, bowing: o.b ?? .7, disableMultiStroke: true });
  const dash = p < 1 ? ` pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${(1 - p).toFixed(4)}"` : '';
  s += `<path d="${rs}" fill="none" stroke="${c}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`;
  if (o.dbl !== false && w >= 2.2) {
    const rs2 = roughD(d, { seed: seed + 17, roughness: (o.r ?? .85) * 1.3, bowing: o.b ?? .7, disableMultiStroke: true });
    s += `<path d="${rs2}" fill="none" stroke="${c}" stroke-width="${f1(w * .45)}" stroke-linecap="round" opacity=".45"${dash}/>`;
  }
  return op < 1 ? `<g opacity="${f1(op * 100) / 100}">${s}</g>` : s;
}
// 平滑線（不抖動；用於蒸氣、水紋等流動物）
const sm = (d, c, w, op = 1, extra = '') => d ? `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${f1(op * 100) / 100}" ${extra}/>` : '';
const grp = (tf, s, op) => s ? `<g${tf ? ` transform="${tf}"` : ''}${op !== undefined && op < 1 ? ` opacity="${f1(clamp(op) * 100) / 100}"` : ''}>${s}</g>` : '';
const halo = (x, y, r, id = 'hG', op = 1) => op > 0.003 ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#${id})" opacity="${f1(clamp(op) * 100) / 100}"/>` : '';
function txt(x, y, str, o = {}) {
  const size = o.size || 40, fam = o.fam || "'Noto Serif CJK TC'", wt = o.wt || 700, anc = o.anc || 'middle';
  const col = o.c || P.ink; const p = o.p === undefined ? 1 : o.p;
  if (p <= 0) return '';
  const id = 'c' + (++SID);
  const tw = o.tw || size * str.length * 1.05;
  const x0 = anc === 'middle' ? x - tw / 2 : anc === 'end' ? x - tw : x;
  const style = `font-family:${fam};font-weight:${wt};font-size:${size}px;${o.it ? 'font-style:italic;' : ''}${o.ls ? `letter-spacing:${o.ls}px;` : ''}`;
  const vert = o.vert ? ` writing-mode="tb"` : '';
  const clip = p < 1 ? (o.vert ? `<clipPath id="${id}"><rect x="${x - size}" y="${y - size * 1.2}" width="${size * 2}" height="${f1(tw * p + size * .3)}"/></clipPath>`
    : `<clipPath id="${id}"><rect x="${f1(x0 - 10)}" y="${f1(y - size * 1.3)}" width="${f1((tw + 20) * p)}" height="${f1(size * 1.8)}"/></clipPath>`) : '';
  return `${clip}<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anc}" fill="${col}" style="${style}"${vert}${p < 1 ? ` clip-path="url(#${id})"` : ''}${o.op !== undefined ? ` opacity="${o.op}"` : ''}>${str}</text>`;
}

// ---------- 元件：人物 ----------
// o: walk(相位), face(1右/-1左), hat('cap'|'straw'|'bun'|'none'|'old'), arms[後,前](度，0下垂 90前平 180上舉)
//    sit, dress, carry('pole'|'rifle'|'bowl'|'torch'|'basin'|'hoe'|'hammer'|'chop'), acc 衣色點綴, p 進度, kid
function person(x, y, s, o = {}) {
  s *= o.raw ? 1 : 1.3;
  const f = o.face || 1, p = o.p === undefined ? 1 : o.p;
  if (p <= 0) return '';
  const w = (2.2 + 1.2 * s) / s;
  const wk = o.walk;
  const sw = wk !== undefined ? Math.sin(wk) : 0;
  const bob = wk !== undefined ? -Math.abs(Math.cos(wk)) * 3 : 0;
  const kid = o.kid ? .72 : 1;
  const hipY = (o.sit ? -44 : -80 * kid) + bob;
  const shY = hipY - 52 * kid;
  const R = a => a * Math.PI / 180;
  const limb = (x0, y0, a, b, l1, l2) => { // a: 大段角度(0 下垂, 正=向前), b: 關節彎曲
    const x1 = x0 + Math.sin(R(a)) * l1, y1 = y0 + Math.cos(R(a)) * l1;
    const x2 = x1 + Math.sin(R(a + b)) * l2, y2 = y1 + Math.cos(R(a + b)) * l2;
    return [[x0, y0], [x1, y1], [x2, y2]];
  };
  let legs;
  if (o.sit) legs = [limb(-3, hipY, 90, -90, 38, 40), limb(4, hipY, 84, -84, 38, 40)];
  else if (wk !== undefined) legs = [limb(-2, hipY, 24 * sw, -Math.max(0, -Math.cos(wk)) * 26 - 4, 40 * kid, 40 * kid), limb(2, hipY, -24 * sw, -Math.max(0, Math.cos(wk)) * 26 - 4, 40 * kid, 40 * kid)];
  else legs = [limb(-4, hipY, -4, 2, 40 * kid, 40 * kid), limb(4, hipY, 5, -3, 40 * kid, 40 * kid)];
  const ar = o.arms || (wk !== undefined ? [-26 * sw, 26 * sw] : [4, 8]);
  const ab = o.bend || [-18, -18];
  const arms = [limb(-2, shY + 5, ar[0], ab[0], 30 * kid, 28 * kid), limb(3, shY + 5, ar[1], ab[1], 30 * kid, 28 * kid)];
  const pw = p;
  const legD = l => poly(l);
  let out = '';
  const inkW = w * 1.25;
  // 後手、後腳
  out += sk(legD(arms[0]), { w: inkW, p: sub(pw, .3, .8) });
  out += sk(legD(legs[0]), { w: inkW * 1.15, p: sub(pw, .1, .6) });
  // 軀幹
  const tw = 13 * kid, hw = o.dress ? 24 : 12 * kid;
  const hemY = o.dress ? hipY + 26 : hipY + 4;
  const torso = curve([[-tw, shY + 2], [0, shY - 3], [tw, shY + 2], [hw * .95, hemY - 6], [hw, hemY], [0, hemY + 2], [-hw, hemY], [-hw * .95, hemY - 6]], true);
  out += sk(torso, { fill: true, w, p: sub(pw, 0, .5), wash: o.acc, wo: .5 });
  // 前腳、前手
  out += sk(legD(legs[1]), { w: inkW * 1.15, p: sub(pw, .15, .65) });
  const hand = arms[1][2];
  out += carry(o, hand, arms[0][2], shY, w, pw);
  out += sk(legD(arms[1]), { w: inkW, p: sub(pw, .3, .8) });
  // 頭
  const hy = shY - 17 * (o.kid ? .9 : 1), hr = o.kid ? 13 : 14;
  out += sk(ell(2, hy, hr, hr + 1, 10), { fill: true, w, p: sub(pw, .2, .7) });
  if (pw > .6) {
    out += `<circle cx="${f1(2 + hr * .5)}" cy="${f1(hy - 2)}" r="${f1(1.6 + w * .2)}" fill="${P.ink}"/>`;
    if (o.smile) out += sm(arc(2 + hr * .45, hy + 4, 4, 3, .2, 2.2, 5), P.ink, w * .6);
  }
  out += hat(o.hat, hy, hr, w, pw, o);
  const tf = `translate(${f1(x)} ${f1(y)}) scale(${f1(f * s * 1000) / 1000} ${f1(s * 1000) / 1000})`;
  return grp(tf, out, o.op);
}
function hat(type, hy, hr, w, pw, o) {
  const hp = sub(pw, .5, 1);
  if (!type || type === 'none') return '';
  if (type === 'cap') return sk(poly([[-hr - 1, hy - 5], [-hr + 2, hy - hr - 5], [hr + 1, hy - hr - 6], [hr + 1, hy - 5], [hr + 10, hy - 3]]), { fill: true, w, p: hp, hatch: o.night ? null : P.soft, hg: 6, hw: 1 });
  if (type === 'straw') return sk(poly([[-hr - 14, hy - 4], [2, hy - hr - 16], [hr + 18, hy - 4]], true), { fill: true, w, p: hp, wash: P.gold, wo: .45 });
  if (type === 'bun') return sk(ell(-hr + 1, hy - hr * .5, 7, 7, 8), { fill: P.ink, w, p: hp }) + sk(arc(2, hy, hr, hr, Math.PI * 1.05, Math.PI * 1.95, 8), { w: w * 1.4, p: hp });
  if (type === 'old') return sk(arc(2, hy, hr + 1, hr + 1, Math.PI * 1.1, Math.PI * 1.9, 8), { w: w * .8, p: hp, c: P.soft }) + sk(poly([[hr - 3, hy + 6], [hr - 1, hy + 12], [hr - 6, hy + 11]]), { w: w * .7, p: hp });
  if (type === 'kid') return sk(arc(2, hy, hr, hr, Math.PI * 1.0, Math.PI * 2, 8), { w: w * 1.6, p: hp });
  return '';
}
function carry(o, hand, hand2, shY, w, pw) {
  const cp = sub(pw, .55, 1); if (cp <= 0 || !o.carry) return '';
  const [hx, hy] = hand;
  switch (o.carry) {
    case 'rifle': return sk(line(-16, shY + 40, 22, shY - 34), { w: w * 1.5, p: cp }) + sk(line(-16, shY + 40, -22, shY + 48), { w: w * 2.2, p: cp });
    case 'pole': {
      const bb = o.bounce || 0;
      const s = sk(line(-62, shY - 2 + bb, 62, shY - 2 - bb), { w: w * 1.4, p: cp });
      const bk = (x, y) => sk(line(x, y, x - 14, y + 44) + line(x, y, x + 14, y + 44), { w: w * .7, p: cp }) + sk(poly([[x - 20, y + 44], [x + 20, y + 44], [x + 15, y + 70], [x - 15, y + 70]], true), { fill: true, w, p: cp, hatch: P.gold, hg: 7 }) +
        sk(curve([[x - 16, y + 44], [x - 6, y + 34], [x + 4, y + 38], [x + 16, y + 44]]), { w: w * .8, p: cp, c: P.ink });
      return s + bk(-58, shY - 2 + bb) + bk(58, shY - 2 - bb);
    }
    case 'bowl': return sk(curve([[hx - 16, hy - 4], [hx - 10, hy + 8], [hx + 10, hy + 8], [hx + 16, hy - 4]]) + 'Z', { fill: true, w, p: cp, wash: P.red, wo: .35 });
    case 'torch': return sk(line(hx, hy + 8, hx + 8, hy - 60), { w: w * 1.6, p: cp }) + flame(hx + 8, hy - 62, .6, 3.1) + halo(hx + 8, hy - 70, 70, 'hG', .9);
    case 'basin': return sk(curve([[hx - 30, hy - 8], [hx - 22, hy + 10], [hx + 22, hy + 10], [hx + 30, hy - 8]]) + 'Z', { fill: true, w, p: cp, wash: P.gold, wo: .5 });
    case 'hoe': return sk(line(hx - 10, hy + 26, hx + 30, hy - 50), { w: w * 1.4, p: cp }) + sk(poly([[hx - 10, hy + 26], [hx - 26, hy + 34], [hx - 22, hy + 22]], true), { fill: P.ink, w, p: cp });
    case 'hammer': return sk(line(hx, hy, hx + 26, hy - 12), { w: w * 1.3, p: cp }) + sk(rect(hx + 20, hy - 24, 12, 22), { fill: P.ink, w, p: cp });
    case 'chop': return sk(line(hx - 2, hy, hx + 30, hy - 14) + line(hx + 1, hy + 3, hx + 32, hy - 9), { w: w * .7, p: cp });
    case 'fan': return sk(curve([[hx, hy], [hx + 30, hy - 30], [hx + 40, hy - 5], [hx, hy]]), { fill: true, w, p: cp, wash: P.pink });
  }
  return '';
}

// ---------- 元件：自然 ----------
function cloud(x, y, s, o = {}) {
  const pts = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n; const r = (i % 2 ? .78 : 1.05);
    pts.push([x + Math.cos(a) * 110 * s * r, y + Math.sin(a) * 38 * s * r * (a > 0 && a < Math.PI ? .55 : 1.05)]);
  }
  return sk(curve(pts, true), { fill: true, w: o.w || 2.4, p: o.p, c: o.c || P.soft, op: o.op }) +
    (o.p === undefined || o.p > .7 ? sk(arc(x - 20 * s, y - 2 * s, 36 * s, 14 * s, Math.PI * 1.1, Math.PI * 1.7, 5), { w: 1.6, c: o.c || P.soft, p: sub(o.p ?? 1, .7, 1), op: o.op }) : '');
}
function mountains(y, peaks, o = {}) {
  // peaks: [[x, h], ...] 依序連成山稜
  const pts = [[peaks[0][0] - 300, y]];
  peaks.forEach(([x, h], i) => { pts.push([x - 160, y - h * .45 - 20 * hash(i + x)]); pts.push([x, y - h]); });
  const last = peaks[peaks.length - 1][0];
  pts.push([last + 160, y - peaks[peaks.length - 1][1] * .4]); pts.push([last + 320, y]);
  let s = sk(curve(pts, false) + `L${last + 320} ${y + 400}L${peaks[0][0] - 300} ${y + 400}Z`, { fill: o.fill || true, c: 'none', p: o.p }) + sk(curve(pts, false), { w: o.w || 2.6, p: o.p, c: o.c });
  // 坡面皴筆
  if (!o.noHatch) peaks.forEach(([x, h], i) => {
    for (let k = 0; k < 4; k++) {
      const yy = y - h * (.7 - k * .15), xx = x + 18 + k * 16;
      s += sk(line(xx, yy, xx + 34 + 10 * hash(k + i), yy + 26), { w: 1.4, c: o.c || P.soft, p: sub(o.p ?? 1, .6 + k * .08, 1), dbl: false });
    }
  });
  return s;
}
function tree(x, y, s, o = {}) {
  const sway = Math.sin(G.t * 1.3 + x * .01) * (o.sway ?? 2.5);
  const p = o.p ?? 1; let str = '';
  if (o.type === 'banana') {
    str += sk(curve([[0, 0], [-4, -60], [2, -130]]), { w: 3.2 / s, p: sub(p, 0, .4) });
    for (let i = 0; i < 5; i++) {
      const a = -150 + i * 55 + sway * (i % 2 ? 1 : -1) * 2, ar = a * Math.PI / 180;
      const L = 90 + 20 * hash(i + x), bx = 2, by = -130;
      const tx = bx + Math.cos(ar) * L, ty = by + Math.sin(ar) * L * .6 + 30;
      const mx = (bx + tx) / 2, my = (by + ty) / 2 - 22;
      const nx = -(ty - by) / L * 16, ny = (tx - bx) / L * 16;
      str += sk(curve([[bx, by], [mx + nx, my + ny], [tx, ty], [mx - nx, my - ny]], true), { fill: true, w: 2.6 / s, p: sub(p, .2 + i * .1, .7 + i * .06) });
      str += sk(curve([[bx, by], [mx, my], [tx, ty]]), { w: 1.2 / s, c: P.soft, p: sub(p, .5, 1), dbl: false });
    }
  } else if (o.type === 'palm') {
    str += sk(curve([[0, 0], [8, -80], [4, -170]]), { w: 3.4 / s, p: sub(p, 0, .4) });
    for (let i = 0; i < 6; i++) {
      const a = (-170 + i * 32 + sway * 2) * Math.PI / 180;
      const tx = 4 + Math.cos(a) * 100, ty = -170 + Math.sin(a) * 50 + 40;
      str += sk(curve([[4, -170], [4 + Math.cos(a) * 55, -170 + Math.sin(a) * 40 - 10], [tx, ty]]), { w: 2.4 / s, p: sub(p, .3 + i * .08, .8) });
    }
  } else {
    str += sk(poly([[-6, 0], [-4, -70], [4, -70], [7, 0]]), { fill: true, w: 2.6 / s, p: sub(p, 0, .4) });
    const pts = []; const n = 14;
    for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n; const r = i % 2 ? 58 : 70; pts.push([Math.cos(a) * r + sway * (Math.sin(a) < 0 ? 1 : 0), -125 + Math.sin(a) * r * .85]); }
    str += sk(curve(pts, true), { fill: true, w: 2.6 / s, p: sub(p, .2, .9), hatch: o.hatch, hg: 10 });
    if (p > .8) for (let k = 0; k < 5; k++) str += sk(arc(-30 + k * 16, -140 + 18 * hash(k + x), 12, 8, 3.4, 5.8, 4), { w: 1.3 / s, c: P.soft, dbl: false, p: sub(p, .8, 1) });
  }
  return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, str);
}
function waves(y0, rows, o = {}) {
  let s = '';
  for (let r = 0; r < rows; r++) {
    const yy = y0 + r * (o.gap || 34), amp = (o.amp || 6) * (1 + r * .25), lam = 90 + r * 20, sp = (o.sp || 40) * (r % 2 ? -1 : 1);
    const pts = [];
    for (let x = (o.x0 ?? -80); x <= (o.x1 ?? W + 80); x += 22) pts.push([x, yy + Math.sin((x + G.t * sp) / lam * 2 * Math.PI) * amp]);
    s += sm(curve(pts), o.c || P.ink, (o.w || 2.2) - r * .1, (o.op ?? .75) * (o.p ?? 1));
  }
  return s;
}
// 蒸氣／炊煙：向上飄動的 S 形細線
function steam(x, y, h, o = {}) {
  let s = ''; const n = o.n || 3;
  for (let i = 0; i < n; i++) {
    const ph = ((G.t * (o.sp || .45) + i / n) % 1);
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10, yy = y - h * (u * .6 + ph * .6);
      pts.push([x + (i - (n - 1) / 2) * (o.sp_x || 14) + Math.sin(u * 5 + G.t * 2.2 + i * 2) * (o.amp || 10) * (0.4 + u), yy]);
    }
    const op = Math.sin(ph * Math.PI) * (o.op ?? .8);
    s += sm(curve(pts), o.c || P.soft, o.w || 2.4, op * (o.p ?? 1));
  }
  return s;
}
function flame(x, y, s, seed = 0, o = {}) {
  const pts = []; const n = 12;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n - Math.PI / 2;
    const fl = 1 + .18 * Math.sin(G.t * 11 + i * 1.7 + seed) + .1 * Math.sin(G.t * 23 + i * 3.1 + seed * 2);
    const up = Math.sin(a) < 0 ? (1.9 + .35 * Math.sin(G.t * 9 + seed)) : 1;
    pts.push([x + Math.cos(a) * 22 * s * (Math.sin(a) < 0 ? .75 : 1) * fl, y + Math.sin(a) * 22 * s * up * fl]);
  }
  const inner = pts.map(([px, py]) => [x + (px - x) * .5, y + 6 * s + (py - y) * .5]);
  return sk(curve(pts, true), { fill: P.red, fo: .75, w: 2.2, c: o.c || P.gold, r: .6, dbl: false }) + sk(curve(inner, true), { fill: P.gold, fo: .9, w: 1.4, c: P.glow, r: .5, dbl: false });
}
function lantern(x, y, s, o = {}) {
  const sw = Math.sin(G.t * 1.6 + x * .013) * 5;
  let str = sk(line(0, -40, 0, -24), { w: 2, p: o.p }) +
    sk(ell(0, 0, 26, 24, 12), { fill: true, wash: P.red, wo: .75, w: 2.6, p: o.p, hatch: P.red, hg: 7 }) +
    sk(rect(-10, -26, 20, 5), { fill: P.gold, w: 2, p: o.p }) + sk(rect(-10, 21, 20, 5), { fill: P.gold, w: 2, p: o.p }) +
    sk(line(0, 26, 0, 44) + line(-4, 44, 4, 44), { w: 1.6, p: o.p, c: P.red });
  if (o.glow) str = halo(0, 0, 90, 'hG', o.glow) + str;
  return grp(`translate(${f1(x)} ${f1(y)}) rotate(${f1(sw)}) scale(${s})`, str);
}
function bunting(x1, y1, x2, y2, n, o = {}) {
  const sag = o.sag || 40; let s = '';
  const pt = u => [lerp(x1, x2, u), lerp(y1, y2, u) + Math.sin(u * Math.PI) * sag + Math.sin(G.t * 2 + u * 6) * 3];
  const pts = []; for (let i = 0; i <= 16; i++) pts.push(pt(i / 16));
  s += sk(curve(pts), { w: 1.8, p: o.p });
  const cols = [P.red, P.pink, P.gold];
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, [a, b] = pt(u - .4 / n), [c, d] = pt(u + .4 / n);
    const fl = Math.sin(G.t * 3 + i) * 4;
    s += sk(poly([[a, b], [c, d], [(a + c) / 2 + fl, (b + d) / 2 + 36]], true), { fill: true, wash: cols[i % 3], wo: .7, w: 1.8, p: sub(o.p ?? 1, i / n * .6, i / n * .6 + .4) });
  }
  return s;
}

// ---------- 元件：建築 ----------
function house(x, y, w, h, o = {}) {
  const p = o.p ?? 1, rh = o.rh || h * .55;
  let s = '';
  s += sk(rect(x, y - h, w, h), { fill: true, w: 2.8, p: sub(p, 0, .45) });
  s += sk(poly([[x - 22, y - h + 4], [x + w * .12, y - h - rh], [x + w * .88, y - h - rh], [x + w + 22, y - h + 4]], true), { fill: true, w: 2.8, p: sub(p, .25, .7), hatch: o.night ? null : P.soft, hg: 11, hw: 1.2, ha: 80 });
  // 屋瓦
  for (let i = 1; i < 8; i++) { const u = i / 8; s += sk(line(x + w * .12 + (w * .76) * u, y - h - rh + 3, x - 22 + (w + 44) * u, y - h + 2), { w: 1.2, c: P.soft, p: sub(p, .55 + u * .2, .8 + u * .2), dbl: false }); }
  const dw = Math.min(46, w * .22), dx = x + (o.doorX ?? w * .2);
  s += sk(rect(dx, y - h * .72, dw, h * .72), { fill: o.light ? P.gold : true, fo: o.light ? .75 : 1, w: 2.4, p: sub(p, .5, .8), wash: o.night ? null : P.red, wo: .35 });
  if (!o.noCouplet) s += sk(rect(dx - 13, y - h * .7, 7, h * .5), { fill: P.red, fo: .8, w: 1.4, p: sub(p, .7, .9), c: P.red }) + sk(rect(dx + dw + 6, y - h * .7, 7, h * .5), { fill: P.red, fo: .8, w: 1.4, p: sub(p, .7, .9), c: P.red });
  const wx = x + w * .58, ww = w * .28, wy = y - h * .72, wh = h * .36;
  s += sk(rect(wx, wy, ww, wh), { fill: o.light ? P.gold : true, fo: o.light ? .8 : 1, w: 2.2, p: sub(p, .6, .85) }) + sk(line(wx + ww / 2, wy, wx + ww / 2, wy + wh) + line(wx, wy + wh / 2, wx + ww, wy + wh / 2), { w: 1.5, p: sub(p, .75, .95) });
  if (o.light) s = halo(wx + ww / 2, wy + wh / 2, 120, 'hG', o.light * .7) + s;
  if (o.chimney) {
    const cx = x + w * .75; s += sk(rect(cx, y - h - rh - 18, 18, rh * .6 + 18), { fill: true, w: 2.2, p: sub(p, .7, .9) });
    if (p >= 1) s += steam(cx + 9, y - h - rh - 22, 140, { n: 2, sp: .25, amp: 14, w: 2.2, op: .6 });
  }
  return s;
}

// ---------- 元件：物件 ----------
function bowl(x, y, s, o = {}) {
  const p = o.p ?? 1; let str = '';
  str += sk(curve([[-100, 0], [-92, 40], [-50, 76], [50, 76], [92, 40], [100, 0]]) + 'Z', { fill: true, w: 3.2, p: sub(p, 0, .5), wash: o.night ? null : P.fill });
  str += sk(rect(-34, 76, 68, 12), { fill: true, w: 2.6, p: sub(p, .3, .6) });
  // 碗緣花紋
  str += sk(curve([[-86, 26], [-44, 40], [0, 44], [44, 40], [86, 26]]), { w: 2, c: P.red, p: sub(p, .4, .8), dbl: false });
  str += sk(ell(0, 0, 100, 18, 16), { fill: true, w: 3, p: sub(p, .1, .55) });
  // 米干寬條
  for (let i = 0; i < 6; i++) {
    const yy = -2 + (i % 3) * 5, x0 = -80 + i * 26;
    str += sk(curve([[x0, yy], [x0 + 12, yy - 8], [x0 + 26, yy + 2], [x0 + 38, yy - 6]]), { w: 5.5, c: P.ink, p: sub(p, .5 + i * .04, .75 + i * .04), dbl: false, op: .9 });
    str += sk(curve([[x0, yy], [x0 + 12, yy - 8], [x0 + 26, yy + 2], [x0 + 38, yy - 6]]), { w: 2.6, c: P.fill, p: sub(p, .5 + i * .04, .75 + i * .04), dbl: false });
  }
  // 肉醬與蔥花
  if (p > .7) {
    str += sk(ell(18, -6, 30, 9, 10), { fill: P.red, fo: .55, w: 1.8, c: P.red, p: sub(p, .7, .9), dbl: false });
    for (let i = 0; i < 7; i++) str += `<circle cx="${f1(-60 + i * 19)}" cy="${f1(-4 + 4 * Math.sin(i * 2))}" r="3" fill="none" stroke="${P.ink}" stroke-width="1.6" opacity="${f1(sub(p, .8, 1) * 100) / 100}"/>`;
  }
  if (o.steam !== false && p > .6) str += steam(0, -16, 170, { n: 3, sp: .35, amp: 12, sp_x: 34, w: 3, op: .75 * sub(p, .6, 1) });
  return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, str);
}
function plane(x, y, s, o = {}) {
  let str = '';
  const body = curve([[-190, 0], [-150, -24], [80, -26], [150, -18], [190, -4], [180, 10], [120, 20], [-150, 16], [-196, 6]], true);
  str += sk(poly([[-180, -8], [-214, -70], [-186, -72], [-150, -18]], true), { fill: true, w: 2.8 });
  str += sk(body, { fill: true, w: 3 });
  str += sk(line(-150, 2, 150, 4), { w: 2.4, c: P.red, dbl: false });
  for (let i = 0; i < 7; i++) str += sk(ell(-100 + i * 30, -8, 7, 6, 8), { w: 1.8, fill: true });
  str += sk(poly([[140, -20], [168, -18], [178, -8], [150, -8]], true), { w: 1.8, fill: true, wash: P.gold, wo: .4 });
  str += sk(curve([[-40, 8], [20, 10], [60, 50], [-30, 52]], true), { fill: true, w: 2.6 });
  str += sk(poly([[-170, -2], [-222, 8], [-160, 10]], true), { fill: true, w: 2.4 });
  str += sk(rect(24, -10, 44, 26), { fill: true, w: 2.4 });
  const pr = Math.abs(Math.sin(G.t * 47)) * 40 + 6;
  str += sm(ell(72, 3, 5, pr, 10), P.ink, 2, .8) + sm(ell(72, 3, 3, 44, 10), P.soft, 1, .35);
  return grp(`translate(${f1(x)} ${f1(y)}) rotate(${f1(o.rot || 0)}) scale(${s})`, str);
}
function taiwan(ox, oy, k, o = {}) {
  const ll = [[121.56, 25.30], [121.75, 25.14], [121.93, 25.02], [121.84, 24.86], [121.83, 24.6], [121.76, 24.36], [121.62, 24.0], [121.5, 23.62], [121.38, 23.2], [121.18, 22.8], [120.95, 22.42], [120.88, 22.1], [120.84, 21.92], [120.72, 21.96], [120.62, 22.28], [120.45, 22.5], [120.26, 22.74], [120.12, 23.02], [120.1, 23.4], [120.2, 23.78], [120.38, 24.14], [120.62, 24.48], [120.86, 24.78], [121.02, 24.98], [121.2, 25.1], [121.4, 25.2]];
  const pr = ([lo, la]) => [ox + (lo - 119.9) * k, oy + (25.4 - la) * k * 1.09];
  return { d: curve(ll.map(pr), true), at: (lo, la) => pr([lo, la]) };
}
function flag(x, y, s, o = {}) {
  let str = sk(line(0, 0, 0, -220), { w: 3, p: o.p });
  const pts = [];
  for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([u * 110, -218 + Math.sin(G.t * 4 - u * 5) * 8 * u]); }
  for (let i = 8; i >= 0; i--) { const u = i / 8; pts.push([u * 110, -150 + Math.sin(G.t * 4 - u * 5 + .5) * 8 * u]); }
  str += sk(curve(pts), { fill: true, wash: P.red, wo: .75, w: 2.4, p: sub(o.p ?? 1, .4, 1), hatch: P.red, hg: 8 });
  return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, str);
}
// 年份標籤卡
function label(x, y, big, small, t0, o = {}) {
  const k = dr(t0, .5); if (k <= 0) return '';
  const sc = easeBack(k);
  const fade = o.t1 ? 1 - dr(o.t1, .4) : 1;
  let s = sk(rect(-20, -64, o.w || 330, 96), { fill: true, fo: .92, w: 2.6 }) +
    sk(line(-6, 18, (o.w || 330) - 40, 22), { w: 5, c: P.red, dbl: false, p: dr(t0 + .3, .5) }) +
    txt(0, -6, big, { size: 52, anc: 'start', tw: 200 }) +
    (small ? txt([...big].reduce((a, c) => a + (c.charCodeAt(0) > 255 ? 54 : 30), 0) + 18, -8, small, { size: 34, anc: 'start', wt: 500, c: P.ink, tw: 220 }) : '');
  return grp(`translate(${x} ${y}) scale(${f1(sc * 1000) / 1000})`, s, fade);
}
function seal(x, y, s, str, k) {
  if (k <= 0) return '';
  const sc = lerp(1.6, 1, easeOut(k)), op = clamp(k * 3);
  const chars = [...str];
  let t = '';
  chars.forEach((c, i) => { t += `<text x="${i < 2 ? 22 : -22}" y="${i % 2 ? 30 : -8}" text-anchor="middle" fill="${P.fill}" style="font-family:'Noto Serif CJK TC';font-weight:900;font-size:40px">${c}</text>`; });
  return grp(`translate(${x} ${y}) scale(${f1(sc * s * 1000) / 1000}) rotate(-4)`, sk(rect(-50, -50, 100, 100), { fill: P.red, fo: .92, w: 3, c: P.red, r: 1.4 }) + t, op);
}
