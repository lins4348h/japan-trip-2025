// 各場景：draw(lt, dur, L) 回傳 SVG 字串；cues(dur, L) 回傳音效提示 [秒, 類型, 音量, 聲像]
// L = 本場景旁白句的 [{s, e}]（場景內秒數）

// ---------- 場景共用小元件 ----------
function bird(x, y, s, ph) {
  const a = Math.sin(ph) * 14;
  return sm(curve([[x - 18 * s, y - a * s * .6], [x - 8 * s, y - 6 * s], [x, y]]) + curve([[x, y], [x + 8 * s, y - 6 * s], [x + 18 * s, y - a * s * .6]]).replace('M', 'M'), P.ink, 2.2, .85);
}
function birds(lt, y, n, dir = 1, sp = 70) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = ((dir > 0 ? -200 : W + 200) + dir * (lt * sp + i * 60) + i * 40 * dir);
    s += bird(x, y + Math.sin(i * 2.3) * 30 + Math.sin(lt * 1.3 + i) * 8, .9 - i * .08, lt * 9 + i * 1.7);
  }
  return s;
}
function mist(y, lt, n = 3, o = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const off = ((lt * (18 + i * 7) + i * 500) % (W + 900)) - 450;
    const pts = [];
    for (let k = 0; k <= 8; k++) pts.push([off + k * 60, y + i * 26 + Math.sin(k * .9 + lt + i) * 5]);
    s += sm(curve(pts), o.c || P.soft, 2, .55);
  }
  return s;
}
function ground(y, p = 1, x0 = -200, x1 = W + 200) {
  const pts = []; for (let x = x0; x <= x1; x += 160) pts.push([x, y + Math.sin(x * .013) * 6]);
  return sk(curve(pts) + `L${x1} ${y + 500}L${x0} ${y + 500}Z`, { fill: true, w: 2.6, p });
}
function grass(x, y, s, p = 1) {
  const sw = Math.sin(G.t * 2 + x * .05) * 3;
  let d = ''; for (let i = -2; i <= 2; i++) d += line(x + i * 5 * s, y, x + i * 9 * s + sw, y - (18 + 8 * (2 - Math.abs(i))) * s);
  return sk(d, { w: 1.8, p, dbl: false });
}
const walkX = (x0, sp, t0) => x0 + sp * Math.max(0, G.lt - t0);
function walker(x0, sp, t0, y, s, o = {}) {
  const x = walkX(x0, sp, t0);
  const moving = G.lt >= t0 && (o.stop === undefined || G.lt < o.stop);
  const xs = o.stop !== undefined && G.lt >= o.stop ? x0 + sp * (o.stop - t0) : x;
  const ph = Math.abs(xs - x0) / (21 * s) + (o.ph0 || 0);
  return person(xs, y, s, Object.assign({ face: sp < 0 ? -1 : 1 }, o, moving ? { walk: ph } : {}));
}
function stars(n, lt, y1 = 520) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = hash(i * 3.1) * W, y = hash(i * 7.7) * y1, tw = .35 + .65 * Math.abs(Math.sin(lt * (1 + hash(i) * 2) + i));
    const r = 2 + hash(i * 1.3) * 3;
    s += `<path d="M${f1(x - r)} ${f1(y)}L${f1(x + r)} ${f1(y)}M${f1(x)} ${f1(y - r)}L${f1(x)} ${f1(y + r)}" stroke="${P.ink}" stroke-width="1.6" opacity="${f1(tw * 100) / 100}"/>`;
  }
  return s;
}
function moon(x, y, r, o = {}) {
  return halo(x, y, r * 3.2, 'hW', .55) + sk(ell(x, y, r, r, 14), { fill: true, fo: 1, wash: P.gold, wo: .35, w: 2.4, p: o.p }) +
    sk(arc(x - r * .3, y - r * .2, r * .25, r * .2, 0, 6.2, 8), { w: 1.2, c: P.soft, dbl: false, p: o.p }) + sk(arc(x + r * .35, y + r * .3, r * .18, r * .14, 0, 6.2, 8), { w: 1.2, c: P.soft, dbl: false, p: o.p });
}
function firework(x, y, tb, col = 'gold', launchX) {
  const t = G.lt - tb; if (t < -1.1 || t > 2.6) return '';
  let s = '';
  if (t < 0) { // 升空
    const u = 1 + t / 1.1; const sx = lerp(launchX ?? x, x, u), sy = lerp(H - 120, y, easeOut(u));
    s += sm(line(sx, sy, lerp(launchX ?? x, x, u - .12), lerp(H - 120, y, easeOut(u - .12)) + 40), P.gold, 2.4, .8) + halo(sx, sy, 26, 'hG', .9);
    return s;
  }
  const n = 18, R = 190 * easeOut(t / .9), fade = 1 - clamp((t - 1.1) / 1.4);
  const c = col === 'gold' ? P.gold : col === 'red' ? P.red : P.pink;
  const hid = col === 'gold' ? 'hG' : col === 'red' ? 'hR' : 'hP';
  s += halo(x, y, 260 * easeOut(t / .5), hid, fade * .9 * (1 - clamp(t / 1.6) * .5));
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n + hash(i + tb) * .2, r0 = R * .35, r1 = R * (0.9 + hash(i * 2 + tb) * .2);
    const drop = t * t * 12;
    s += sm(line(x + Math.cos(a) * r0, y + Math.sin(a) * r0 + drop * .5, x + Math.cos(a) * r1, y + Math.sin(a) * r1 + drop), c, 3, fade);
    s += `<circle cx="${f1(x + Math.cos(a) * r1 * 1.08)}" cy="${f1(y + Math.sin(a) * r1 * 1.08 + drop)}" r="3.4" fill="${P.glow}" opacity="${f1(fade * (0.6 + .4 * Math.sin(G.t * 30 + i)) * 100) / 100}"/>`;
  }
  return s;
}
function sparks(x, y, n, lt, spread = 60, h = 300) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const ph = (lt * (.5 + hash(i) * .5) + hash(i * 5)) % 1;
    const sx = x + (hash(i * 9) - .5) * spread + Math.sin(ph * 6 + i) * 18, sy = y - ph * h;
    s += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(2.6 * (1 - ph) + .8)}" fill="${P.glow}" opacity="${f1((1 - ph) * 100) / 100}"/>`;
  }
  return s;
}
function panelFrame(x, y, w, h, p, tag) {
  return sk(rect(x, y, w, h), { fill: true, w: 3.4, p }) + sk(rect(x + 10, y + 10, w - 20, h - 20), { w: 1.4, c: P.soft, p: sub(p, .3, 1), dbl: false }) +
    (tag ? sk(rect(x + 30, y - 26, tag.length * 44 + 40, 56), { fill: true, w: 2.6, p: sub(p, .4, .8), wash: P.pink, wo: .5 }) + txt(x + 50, y + 16, tag, { size: 38, anc: 'start', tw: tag.length * 42, p: sub(p, .6, 1) }) : '');
}
function stool(x, y, s) { return sk(rect(x - 26 * s, y - 50 * s, 52 * s, 8 * s) + line(x - 20 * s, y - 42 * s, x - 24 * s, y) + line(x + 20 * s, y - 42 * s, x + 24 * s, y), { fill: true, w: 2.4 }); }

// ---------- 場景 ----------
const SC = {};

// 1. 開場：地圖點出地點
SC.open = {
  mode: 'day', cam: { z0: 1, z1: 1.13, x0: 0, x1: 70, y0: 0, y1: 90 },
  draw(lt, dur, L) {
    const tw = taiwan(560, 80, 190);
    const [px, py] = tw.at(121.22, 24.93);
    let bg = '';
    bg += waves(170, 3, { x0: -100, x1: 460, gap: 70, amp: 5, sp: 26, op: .5 }) + waves(560, 4, { x0: -100, x1: 440, gap: 90, amp: 5, sp: 22, op: .5 });
    bg += waves(760, 3, { x0: 960, x1: 1140, gap: 60, amp: 5, sp: 22, op: .45 });
    bg += cloud(200 + lt * 14, 150, .8, { p: dr(.3, 1.2) }) + cloud(1600 - lt * 10, 120, 1.0, { p: dr(.6, 1.2) });
    let mp = sk(tw.d, { fill: true, w: 3.4, p: dr(0, 1.8), hatch: P.soft, hg: 14, hw: 1, ha: 60 });
    // 中央山脈
    for (let i = 0; i < 7; i++) {
      const [mx, my] = tw.at(121.05 + i * .06 - (i > 3 ? (i - 3) * .09 : 0), 24.55 - i * .33);
      mp += sk(poly([[mx - 18, my + 10], [mx, my - 12], [mx + 18, my + 10]]), { w: 2, p: dr(1 + i * .1, .5), dbl: false });
    }
    // 圖釘落下
    const k = dr(1.5, .7), drop = (1 - easeBack(k)) * -260;
    let pin = '';
    if (k > 0) {
      for (let r = 0; r < 3; r++) {
        const rt = ((lt - 2.2 - r * .7) % 2.1) / 2.1;
        if (lt > 2.2 + r * .7) pin += sm(ell(px, py, 20 + rt * 90, (20 + rt * 90) * .38, 16), P.red, 2.4, (1 - rt) * .8);
      }
      pin += grp(`translate(${f1(px)} ${f1(py + drop)})`, sk(curve([[0, 0], [-22, -44], [-20, -66], [0, -78], [20, -66], [22, -44]], true), { fill: P.red, fo: .85, w: 3, c: P.ink }) + sk(ell(0, -58, 8, 8, 8), { fill: true, w: 2 }), clamp(k * 4));
    }
    // 標籤
    const lx = 1060, ly = 300;
    let lab = sk(curve([[px + 34, py - 40], [(px + lx) / 2, py - 70], [lx - 30, ly - 30]]), { w: 2.2, p: dr(2.3, .6), c: P.soft });
    lab += txt(lx, ly, '桃園 · 龍岡', { size: 84, anc: 'start', tw: 480, p: dr(2.6, 1.2) });
    lab += txt(lx + 4, ly + 58, 'Longgang, Taoyuan, Taiwan', { size: 34, anc: 'start', fam: "'Bitstream Charter'", wt: 400, it: 1, tw: 430, p: dr(3.2, 1), c: P.soft });
    lab += sk(line(lx, ly + 84, lx + 470, ly + 88), { w: 5, c: P.red, p: dr(3.6, .6), dbl: false });
    // 右側小村落素描
    let vil = '';
    vil += house(1100, 780, 200, 120, { p: dr(3.6, 1.6), chimney: 1, noCouplet: 1 });
    vil += house(1360, 790, 230, 135, { p: dr(4.1, 1.6), noCouplet: 1 });
    vil += tree(1650, 790, .9, { p: dr(4.6, 1.2) });
    vil += bowl(1520, 700, .5, { p: dr(5.2, 1.2) });
    vil += sk(line(1040, 790, 1760, 796), { w: 2.4, p: dr(3.5, 1.4) });
    const fg = birds(lt, 200, 3, -1, 60);
    return layer(.35, bg) + layer(1, mp + pin + lab + vil) + layer(1.2, fg);
  },
  cues(dur, L) { return [[0, 'amb_sea', 1, 0, dur], [1.95, 'pin', 1, -.2], [2.3, 'gongS', .5, 0], [0.5, 'birds', .6, .3, dur - .5]]; },
};

// 2. 片名卡
SC.title = {
  mode: 'day', cam: { z0: 1.02, z1: 1.07, x0: 0, x1: 0, y0: 0, y1: -10 },
  draw(lt, dur) {
    let s = '';
    s += cloud(260 - lt * 8, 190, .9, { p: dr(0, 1) }) + cloud(1680 + lt * 8, 230, .8, { p: dr(.2, 1) });
    s += txt(W / 2, 250, '桃園 · 龍岡', { size: 44, wt: 500, tw: 300, p: dr(.1, .8), c: P.soft, ls: 8 });
    s += txt(W / 2, 430, '龍岡米干節', { size: 168, tw: 900, p: dr(.3, 1.6), ls: 10 });
    s += sk(curve([[560, 480], [800, 492], [1100, 486], [1360, 474]]), { w: 9, c: P.red, p: dr(1.5, .7), dbl: false, r: 1.2 });
    s += txt(W / 2, 560, '一碗米干裡的異域鄉愁', { size: 54, wt: 500, tw: 560, p: dr(1.9, 1.1), ls: 6 });
    s += txt(W / 2, 620, 'The Longgang Rice Noodle Festival', { size: 36, fam: "'Bitstream Charter'", wt: 400, it: 1, tw: 580, p: dr(2.5, 1.0), c: P.soft });
    s += seal(1530, 320, .85, '龍岡米干', dr(2.4, .35));
    s += bowl(W / 2, 800, .95, { p: dr(.4, 1.8) });
    return layer(1, s);
  },
  cues() { return [[0, 'drumroll', .6, 0], [2.4, 'gong', 1, 0], [2.4, 'thud', .6, 0]]; },
};

// 3. 1949 叢林
SC.jungle = {
  mode: 'day', cam: { z0: 1.04, z1: 1.1, x0: 40, x1: -60, y0: 0, y1: 0 },
  draw(lt, dur, L) {
    const far = mountains(560, [[150, 260], [520, 330], [900, 250], [1300, 360], [1700, 280], [2050, 240]], { p: dr(0, 1.6), c: P.soft, w: 2.2 }) + mist(420, lt, 3);
    let mid = mountains(700, [[-40, 150], [420, 190], [860, 130], [1250, 200], [1650, 150], [2000, 180]], { p: dr(.3, 1.6) });
    mid += tree(160, 720, 1.1, { type: 'banana', p: dr(.6, 1.2) }) + tree(1780, 730, 1.2, { type: 'banana', p: dr(.8, 1.2) }) + tree(1350, 720, .9, { type: 'palm', p: dr(.9, 1.2) });
    mid += mist(620, lt * 1.3, 2);
    // 小徑與界碑
    let path = ground(800, dr(.4, 1.2));
    path += sk(poly([[1180, 800], [1180, 700], [1196, 686], [1212, 700], [1212, 800]], true), { fill: true, w: 2.6, p: dr(1.2, .8) }) + txt(1196, 760, '界', { size: 34, p: dr(1.6, .5) });
    for (let i = 0; i < 9; i++) path += grass(80 + i * 220, 808, 1.2, dr(1 + i * .05, .5));
    // 行軍
    let sold = '';
    for (let i = 0; i < 5; i++) sold += walker(2080 + i * 200, -150, .6, 820, 1.05 - i * .01, { hat: 'cap', carry: 'rifle', arms: undefined, ph0: i * 1.3, acc: null });
    // 前景大葉遮擋
    let fg = '';
    fg += grp(`translate(40 1150) rotate(${f1(-14 + Math.sin(lt * 1.2) * 2)})`, tree(0, 0, 3.2, { type: 'banana', p: 1, sway: 3 }));
    fg += grp(`translate(1900 1170) rotate(${f1(12 + Math.sin(lt * 1.1 + 1) * 2)})`, tree(0, 0, 2.8, { type: 'banana', p: 1, sway: 3 }));
    return layer(.3, far) + layer(.6, mid) + layer(1, path + sold) + layer(1.25, fg) + layer(0, label(110, 150, '1949', '滇緬邊境', 1.6, { w: 400 }));
  },
  cues(dur) { return [[0, 'amb_jungle', 1, 0, dur], [0.6, 'steps', .7, .2, dur - .6]]; },
};

// 4. 撤臺航程
SC.plane = {
  mode: 'day', cam: { z0: 1, z1: 1.07, x0: 0, x1: -40, y0: 0, y1: -20 },
  draw(lt, dur, L) {
    let sky = '';
    for (let i = 0; i < 5; i++) { const x = ((1900 + i * 480 - lt * 90) % 2400 + 2400) % 2400 - 250; sky += cloud(x, 150 + (i % 3) * 110, .7 + (i % 2) * .3, { p: dr(i * .2, 1) }); }
    const coastK = dr(4.5, 3);
    let sea = waves(840, 4, { gap: 44, amp: 6, sp: 50, p: dr(0, 1) });
    // 海岸線浮現（臺灣）
    let coast = '';
    if (coastK > 0) {
      const cx = lerp(2200, 1560, easeOut(coastK));
      coast += mountains(860, [[cx, 190], [cx + 250, 260], [cx + 500, 210]], { p: coastK });
    }
    const u = clamp(lt / (dur - .4));
    const px = lerp(60, 1500, u), py = 470 + Math.sin(lt * 1.4) * 10 + u * 50;
    let pl = plane(px, py, 1.25, { rot: Math.sin(lt * 1.4 + 1) * 1.6 + 2 });
    pl += sm(line(px - 280, py - 2, px - 560, py + 6), P.soft, 2, .5) + sm(line(px - 250, py + 30, px - 470, py + 40), P.soft, 1.6, .4);
    let lab = label(110, 150, '1953–54', '撤退來臺', L[0].s + .2, { w: 470 });
    // 人數計數
    if (L[1]) {
      const k = dr(L[1].s - .1, 2.2);
      if (k > 0) {
        const n = Math.round(7000 * easeOut(k) / 10) * 10;
        lab += grp('translate(1330 160)', sk(rect(-20, -70, 470, 150), { fill: true, fo: .92, w: 2.6, p: dr(L[1].s - .1, .4) }) +
          txt(20, 16, '近 ' + n.toLocaleString('en-US') + ' 人', { size: 70, anc: 'start', tw: 400, c: P.red }) +
          txt(22, 60, 'nearly 7,000 people', { size: 28, anc: 'start', fam: "'Bitstream Charter'", wt: 400, it: 1, tw: 300, c: P.soft }));
      }
    }
    return layer(.3, sky) + layer(.7, sea + coast) + layer(1, pl) + layer(0, lab);
  },
  cues(dur) { return [[0, 'plane', 1, -.8, dur], [0, 'amb_wind', .5, 0, dur]]; },
};

// 5. 1954 忠貞新村建成
SC.village = {
  mode: 'day', cam: { z0: 1, z1: 1.08, x0: 20, x1: -30, y0: 0, y1: 10 },
  draw(lt, dur, L) {
    let far = mountains(600, [[200, 150], [700, 200], [1200, 140], [1700, 190]], { p: dr(0, 1.2), c: P.soft, w: 2 });
    far += cloud(300 + lt * 12, 170, .8, { p: dr(.2, 1) }) + cloud(1300 + lt * 9, 130, .9, { p: dr(.4, 1) });
    let mid = ground(770, dr(0, 1));
    const xs = [120, 470, 820, 1170];
    xs.forEach((x, i) => { mid += house(x, 770, 290, 170, { p: dr(.3 + i * .9, 1.5), chimney: i % 2 === 0 }); });
    mid += tree(1520, 770, 1, { p: dr(1.5, 1) });
    // 村門
    const gp = dr(1.4, 1.4);
    let gate = sk(rect(1600, 520, 26, 260), { fill: true, w: 2.8, p: gp }) + sk(rect(1846, 520, 26, 260), { fill: true, w: 2.8, p: gp }) +
      sk(rect(1570, 488, 330, 40), { fill: true, w: 2.8, p: sub(gp, .3, 1) }) + sk(rect(1650, 540, 170, 60), { fill: true, w: 2.4, p: sub(gp, .5, 1), wash: P.red, wo: .6, hatch: P.red, hg: 7 }) +
      txt(1735, 584, '忠貞新村', { size: 36, tw: 150, p: sub(gp, .7, 1), c: P.ink });
    // 工人敲打
    const hm = Math.sin(lt * 7);
    const hammerArm = 110 + hm * 35;
    mid += person(1470, 790, .9, { face: -1, hat: 'straw', arms: [30, hammerArm], bend: [-30, -50 - hm * 10], carry: 'hammer', p: dr(2.4, .8) });
    mid += flag(1540, 790, .9, { p: dr(2, 1) });
    // 一家人走進村
    let fam = '';
    if (L[1]) {
      const t0 = L[1].s - 1.2;
      fam += walker(1960, -140, t0, 850, 1.05, { hat: 'cap', stop: t0 + 5.2, acc: null });
      fam += walker(2100, -140, t0, 850, 1.0, { hat: 'bun', dress: 1, acc: P.pink, stop: t0 + 5.2, ph0: 1 });
      fam += walker(2220, -140, t0, 850, .95, { kid: 1, hat: 'kid', stop: t0 + 5.2, ph0: 2, acc: P.gold });
    }
    let fg = birds(lt, 240, 3, 1, 80);
    for (let i = 0; i < 8; i++) fg += grass(60 + i * 250, 1000, 1.5, 1);
    return layer(.3, far) + layer(1, mid + gate + fam) + layer(1.15, fg) + layer(0, label(110, 150, '1954 秋', '忠貞新村', L[0].s + .2, { w: 420 }));
  },
  cues(dur, L) {
    const c = [[0, 'amb_birds', .8, 0, dur]];
    for (let n = 0; n < 40; n++) { const t = (1.5 * Math.PI + 2 * Math.PI * n) / 7; if (t > 2.9 && t < dur) c.push([t, 'knock', .5, .55]); }
    return c;
  },
};

// 6. 開墾與忠貞市場
SC.market = {
  mode: 'day', cam: { z0: 1.04, z1: 1.08, x0: 120, x1: -120, y0: 0, y1: 0 },
  draw(lt, dur, L) {
    let far = mountains(560, [[100, 120], [600, 160], [1100, 110], [1700, 150], [2200, 130]], { p: dr(0, 1), c: P.soft, w: 2 }) + cloud(500 + lt * 10, 160, .8, { p: dr(.2, 1) });
    let mid = ground(740, dr(0, 1), -400, 2400);
    // 田地畦溝
    for (let r = 0; r < 5; r++) {
      const y = 780 + r * 38;
      mid += sk(curve([[-300, y], [200, y - 6], [760, y + 4]]), { w: 2, p: dr(.3 + r * .1, .8), c: P.soft, dbl: false });
      for (let k = 0; k < 9; k++) { // 菜苗長大
        const g = easeOut(dr(.8 + r * .15 + k * .05, 1.2)), x = -240 + k * 110 + r * 20;
        if (g > 0) mid += sk(curve([[x, y], [x - 12 * g, y - 16 * g], [x - 2, y - 26 * g]]) + curve([[x, y], [x + 12 * g, y - 18 * g], [x + 3, y - 28 * g]]), { w: 1.8, dbl: false });
      }
    }
    // 香茅／香料叢
    for (let i = 0; i < 3; i++) mid += grass(640 + i * 60, 750, 2.4, dr(1.2, .6));
    // 農夫鋤地
    const hoe = Math.sin(lt * 3.2);
    mid += person(170, 800, 1.0, { face: 1, hat: 'straw', arms: [60 + hoe * 40, 80 + hoe * 50], bend: [-40, -40], carry: 'hoe', p: dr(.5, .8), acc: P.gold });
    // 市場攤位
    let mk = '';
    const stall = (x, t0, goods) => {
      const p = dr(t0, 1.3);
      let s = sk(rect(x, 640, 300, 110), { fill: true, w: 2.8, p }) + sk(line(x + 10, 750, x + 10, 800) + line(x + 290, 750, x + 290, 800), { w: 2.6, p });
      s += sk(line(x + 6, 640, x + 6, 470) + line(x + 294, 640, x + 294, 470), { w: 2.6, p });
      const aw = [[x - 20, 470], [x + 320, 470], [x + 340, 530]];
      let sc = `M${x - 20} 470L${x + 320} 470L${x + 340} 530`;
      for (let i = 6; i >= 0; i--) sc += `Q${x - 20 + i * 60 + 30} 560 ${x - 20 + i * 60} 530`;
      s += sk(sc + 'Z', { fill: true, w: 2.6, p: sub(p, .2, .8), wash: P.red, wo: .55, hatch: P.red, hg: 22, hw: 6, ha: 90 });
      void aw;
      s += goods(x, sub(p, .6, 1));
      return s;
    };
    const chili = (x, p) => { let s = ''; for (let b = 0; b < 3; b++) { const bx = x + 40 + b * 90; s += sk(ell(bx, 628, 36, 12, 10), { fill: true, w: 2.2, p }) + sk(curve([[bx - 36, 628], [bx - 28, 606], [bx, 600], [bx + 28, 606], [bx + 36, 628]]), { fill: b === 1 ? P.gold : P.red, fo: .6, w: 1.8, p }); } return s; };
    const bowls = (x, p) => { let s = ''; for (let b = 0; b < 3; b++) s += sk(curve([[x + 40 + b * 90, 620], [x + 50 + b * 90, 640], [x + 100 + b * 90, 640], [x + 110 + b * 90, 620]]) + 'Z', { fill: true, w: 2.2, p }) + (p > .8 ? steam(x + 75 + b * 90, 612, 90, { n: 2, amp: 7, sp_x: 10, w: 2, op: .6 }) : ''); return s; };
    const ms = L[1] ? L[1].s - 1.3 : 5;
    mk += stall(1080, ms, chili) + stall(1480, ms + .5, bowls);
    const sp = dr(ms + .8, 1);
    mk += sk(line(1400, 360, 1400, 470), { w: 2, p: sp }) + sk(rect(1300, 360, 200, 64), { fill: true, w: 2.6, p: sp, wash: P.gold, wo: .5 }) + txt(1400, 406, '忠貞市場', { size: 38, tw: 170, p: sub(sp, .5, 1) });
    // 挑擔婦人走向市場
    const pole = walker(-150, 118, 2.2, 880, 1.0, { hat: 'straw', carry: 'pole', arms: [150, 160], bend: [30, 30], acc: P.pink, stop: 11.4, bounce: Math.sin(lt * 11) * 3 });
    // 顧客
    let cust = '';
    if (lt > ms + 1) {
      const pp = dr(ms + 1, .8);
      cust += person(1250, 860, .95, { face: -1, hat: 'bun', dress: 1, acc: P.pink, p: pp, arms: [0, 70 + Math.sin(lt * 2) * 8], smile: 1 });
      cust += person(1700, 860, .95, { face: -1, hat: 'none', p: pp, carry: 'bowl', arms: [10, 70] });
    }
    return layer(.3, far) + layer(1, mid + mk + cust + pole);
  },
  cues(dur, L) {
    const c = [[0, 'amb_birds', .5, -.4, dur]];
    for (let n = 0; n < 12; n++) { const t = (1.5 * Math.PI + 2 * Math.PI * n) / 3.2; if (t > 1.0 && t < dur - .5) c.push([t, 'hoe', .55, -.6]); }
    if (L[1]) c.push([L[1].s - 1.3, 'crowd', .9, .4, dur - L[1].s + 1.3]);
    return c;
  },
};

// 7. 米干製程（四格分鏡，鏡頭橫移）
SC.migan = {
  mode: 'day',
  camFn(lt, dur, L) {
    const a = L[1].s - .5, b = L[1].s + (L[1].e - L[1].s) * .52, c = L[2].s - .5;
    const k1 = ease(dr(a, .9)), k2 = ease(dr(b, .9)), k3 = ease(dr(c, .9));
    return { z: 1 + .03 * Math.sin(lt * .4), x: -(k1 + k2 + k3) * 1700, y: 0 };
  },
  draw(lt, dur, L) {
    const a = L[1].s - .5, b = L[1].s + (L[1].e - L[1].s) * .52, c = L[2].s - .5;
    let s = '';
    // ① 磨米漿
    const X1 = 180;
    s += panelFrame(X1, 110, 1560, 740, dr(0, 1), '① 磨米漿');
    {
      const p = dr(.6, 1.4), th = lt * 2.2;
      s += sk(poly([[X1 + 520, 720], [X1 + 1040, 720], [X1 + 1000, 780], [X1 + 560, 780]], true), { fill: true, w: 2.6, p });
      s += sk(rect(X1 + 600, 520, 360, 200), { fill: true, w: 3, p, hatch: P.soft, hg: 14, hw: 1 }) + sk(ell(X1 + 780, 520, 180, 40, 16), { fill: true, w: 3, p });
      s += sk(rect(X1 + 630, 420, 300, 100), { fill: true, w: 3, p }) + sk(ell(X1 + 780, 420, 150, 34, 16), { fill: true, w: 3, p });
      s += sk(ell(X1 + 780, 420, 26, 8, 8), { w: 2, p });
      const hx = X1 + 780 + Math.cos(th) * 120, hy = 430 + Math.sin(th) * 22;
      if (p > .8) s += sk(line(hx, hy, hx, hy - 90), { w: 6, dbl: false }) + sk(ell(hx, hy - 90, 12, 8, 8), { fill: true, w: 2.4 });
      // 流下的米漿
      const sx = X1 + 960, sy = 640;
      s += sk(poly([[sx, sy - 10], [sx + 80, sy + 10], [sx + 80, sy + 24], [sx, sy + 10]], true), { fill: true, w: 2.4, p });
      if (p >= 1) {
        s += sm(curve([[sx + 80, sy + 18], [sx + 96, sy + 40], [sx + 100, sy + 120], [sx + 100, 760]]), P.ink, 6, .75) + sm(curve([[sx + 80, sy + 18], [sx + 96, sy + 40], [sx + 100, sy + 120], [sx + 100, 760]]), P.fill, 2.5, 1);
        for (let i = 0; i < 3; i++) { const u = (lt * 1.4 + i / 3) % 1; s += `<circle cx="${sx + 100}" cy="${f1(sy + 60 + u * 140)}" r="4" fill="${P.fill}" stroke="${P.ink}" stroke-width="1.6" opacity="${f1((1 - u) * 100) / 100}"/>`; }
      }
      s += sk(poly([[sx + 30, 740], [sx + 170, 740], [sx + 155, 830], [sx + 45, 830]], true), { fill: true, w: 2.8, p: dr(1, 1) }) + sk(ell(sx + 100, 740, 70, 14, 12), { fill: P.fill, w: 2.2, p: dr(1, 1) });
      // 泡米的木盆
      s += sk(curve([[X1 + 170, 700], [X1 + 190, 800], [X1 + 390, 800], [X1 + 410, 700]]) + 'Z', { fill: true, w: 2.8, p: dr(.4, 1), wash: P.gold, wo: .4 });
      for (let i = 0; i < 14; i++) s += `<ellipse cx="${f1(X1 + 200 + hash(i) * 180)}" cy="${f1(706 + hash(i * 3) * 10)}" rx="6" ry="3" fill="${P.fill}" stroke="${P.ink}" stroke-width="1.4" opacity="${f1(dr(1, .8) * 100) / 100}"/>`;
      s += txt(X1 + 290, 660, '在來米', { size: 34, tw: 110, p: dr(1.6, .6), c: P.soft });
    }
    // ② 蒸
    const X2 = X1 + 1700;
    s += panelFrame(X2, 110, 1560, 740, dr(a - .4, 1), '② 淋漿蒸片');
    {
      const t0 = a + .3, p = dr(t0, 1.2);
      // 爐火
      for (let i = 0; i < 4; i++) if (p > .5) s += flame(X2 + 620 + i * 70, 770, .9, i * 2);
      s += sk(rect(X2 + 540, 770, 480, 60), { fill: true, w: 3, p });
      s += sk(curve([[X2 + 520, 620], [X2 + 560, 760], [X2 + 1000, 760], [X2 + 1040, 620]]) + 'Z', { fill: true, w: 3, p, hatch: P.soft, hg: 16, hw: 1 });
      // 圓盤
      s += sk(ell(X2 + 780, 610, 250, 40, 18), { fill: true, w: 3, p: sub(p, .3, 1) });
      // 淋漿
      const pour = dr(t0 + 1.0, 1.4);
      if (pour > 0 && pour < 1) {
        const ax = X2 + 640 + pour * 280;
        s += sk(curve([[ax - 60, 420], [ax - 10, 440], [ax + 10, 470]]), { w: 4 }) + sm(line(ax + 10, 470, ax + 14, 590), P.ink, 5, .7) + sm(line(ax + 10, 470, ax + 14, 590), P.fill, 2, 1);
        s += sk(ell(ax - 90, 420, 44, 24, 10), { fill: true, w: 2.6 });
      }
      if (pour > 0) s += sm(ell(X2 + 780, 608, 230 * Math.min(1, pour * 1.1), 32 * Math.min(1, pour * 1.1), 18), P.soft, 2, .7);
      // 蓋子掀起與蒸氣爆發
      const lid = dr(t0 + 2.6, .8), lidDown = dr(t0 + 1.8 + .0, .6);
      const lidY = 590 - (lidDown < 1 ? (1 - lidDown) * 180 : 0) - easeOut(lid) * 220;
      if (lt > t0 + 1.4) s += grp(`rotate(${f1(-lid * 14)} ${X2 + 780} ${f1(lidY)})`, sk(curve([[X2 + 520, lidY], [X2 + 560, lidY - 120], [X2 + 1000, lidY - 120], [X2 + 1040, lidY]]) + 'Z', { fill: true, w: 3, hatch: P.soft, hg: 14, hw: 1 }) + sk(ell(X2 + 780, lidY - 130, 30, 14, 8), { fill: true, w: 2.6 }));
      if (lid > 0) s += steam(X2 + 780, 560, 380 * easeOut(lid), { n: 5, sp_x: 60, amp: 22, w: 3.4, op: .9, sp: .6 });
      s += txt(X2 + 1240, 380, '一盤一盤', { size: 44, tw: 180, p: dr(t0 + 1.2, .8), c: P.red });
      s += txt(X2 + 1240, 440, '蒸成薄片', { size: 44, tw: 180, p: dr(t0 + 1.6, .8), c: P.red });
    }
    // ③ 切
    const X3 = X2 + 1700;
    s += panelFrame(X3, 110, 1560, 740, dr(b - .4, 1), '③ 切成寬條');
    {
      const t0 = b + .3, p = dr(t0, 1);
      // 竹竿晾米片
      s += sk(line(X3 + 120, 260, X3 + 700, 250), { w: 5, p });
      for (let i = 0; i < 3; i++) { const x = X3 + 170 + i * 180, sw = Math.sin(lt * 1.5 + i) * 4; s += sk(curve([[x, 256], [x - 30 + sw, 330], [x - 20 + sw, 470], [x + 110 + sw, 470], [x + 120 + sw, 330], [x + 90, 256]]) , { fill: true, w: 2.6, p: sub(p, .2 + i * .1, .8 + i * .05) }); }
      // 砧板
      s += sk(poly([[X3 + 760, 700], [X3 + 1400, 700], [X3 + 1420, 760], [X3 + 740, 760]], true), { fill: true, w: 3, p, wash: P.gold, wo: .45 });
      const cutsDone = Math.floor(Math.max(0, lt - t0 - .8) * 2.6);
      const nStrip = Math.min(12, cutsDone);
      s += sk(rect(X3 + 820, 640, 520, 60), { fill: true, w: 2.8, p });
      for (let i = 0; i < nStrip; i++) s += sk(line(X3 + 820 + 40 * (i + 1), 642, X3 + 820 + 40 * (i + 1), 698), { w: 2, dbl: false });
      const kx = X3 + 820 + 40 * (nStrip + 1), ky = 640 - Math.abs(Math.sin((lt - t0 - .8) * 2.6 * Math.PI)) * 110;
      if (lt > t0 + .6) s += grp(`translate(${f1(kx)} ${f1(ky)})`, sk(poly([[-6, 0], [-6, -150], [90, -150], [70, 0]], true), { fill: true, w: 3, hatch: P.soft, hg: 10, hw: 1 }) + sk(rect(-2, -200, 24, 52), { fill: P.ink, w: 2.6 }));
    }
    // ④ 上桌
    const X4 = X3 + 1700;
    s += panelFrame(X4, 110, 1560, 740, dr(c - .4, 1), '④ 澆湯上桌');
    {
      const t0 = c + .3;
      s += bowl(X4 + 780, 600, 1.9, { p: dr(t0, 1.4) });
      const pk = dr(t0 + 1.2, 1.6);
      if (pk > 0 && pk < 1) {
        const tilt = Math.sin(pk * Math.PI) * 30;
        s += grp(`translate(${X4 + 1060} 360) rotate(${f1(-tilt)})`, sk(line(0, 0, 220, -120), { w: 6 }) + sk(curve([[-60, -10], [-50, 40], [30, 40], [40, -10]]) + 'Z', { fill: true, w: 3 }));
        s += sm(curve([[X4 + 1010, 370], [X4 + 960, 420], [X4 + 930, 560]]), P.ink, 6, .6 * Math.sin(pk * Math.PI)) + sm(curve([[X4 + 1010, 370], [X4 + 960, 420], [X4 + 930, 560]]), P.gold, 3, .8 * Math.sin(pk * Math.PI));
      }
      s += txt(X4 + 230, 300, '家鄉味', { size: 64, tw: 200, p: dr(t0 + 2, 1), c: P.red });
      s += txt(X4 + 230, 360, 'a taste of home', { size: 30, fam: "'Bitstream Charter'", wt: 400, it: 1, tw: 220, p: dr(t0 + 2.4, 1), c: P.soft });
    }
    return layer(1, s);
  },
  cues(dur, L) {
    const a = L[1].s - .5, b = L[1].s + (L[1].e - L[1].s) * .52, c = L[2].s - .5;
    const cs = [[0.6, 'grind', .8, -.2, a - .2], [a + .3, 'fire', .4, 0, b - a], [a + 1.0, 'pour', .6, .1, 1.4], [a + .3 + 2.6, 'steam', .9, 0, 2.2], [c + 1.3, 'pour', .7, .3, 1.4], [c + .3, 'bowl', .5, 0]];
    for (let k = 1; k <= 12; k++) { const t = b + .3 + .8 + k / 2.6; if (t < c + .3) cs.push([t, 'chop', .7, .2]); }
    return cs;
  },
};

// 8. 2011 米干節開幕
SC.festival = {
  mode: 'day', cam: { z0: 1, z1: 1.1, x0: 0, x1: 0, y0: 0, y1: 20 },
  draw(lt, dur, L) {
    let bg = '';
    const xs = [-60, 330, 1300, 1680];
    xs.forEach((x, i) => bg += house(x, 760, 320, 220, { p: dr(i * .15, 1.2), rh: 90, chimney: 0 }));
    let top = bunting(-50, 120, 980, 150, 12, { p: dr(.3, 1.2), sag: 60 }) + bunting(940, 150, 1980, 110, 12, { p: dr(.5, 1.2), sag: 60 });
    for (let i = 0; i < 5; i++) top += lantern(180 + i * 390, 300 + (i % 2) * 30, .9, { p: dr(.6 + i * .1, .8) });
    // 捲軸橫幅垂下
    const k = easeOut(dr(.8, 1.4));
    let ban = '';
    if (k > 0) {
      const hgt = 470 * k;
      ban += sk(rect(820, 190, 280, hgt), { fill: true, w: 3, wash: P.red, wo: .25 }) + sk(rect(836, 204, 248, Math.max(0, hgt - 28)), { w: 1.6, c: P.red, dbl: false });
      const id = 'bc' + (++SID);
      ban += `<clipPath id="${id}"><rect x="820" y="190" width="280" height="${f1(hgt)}"/></clipPath><g clip-path="url(#${id})">` +
        [...'龍岡米干節'].map((c, i) => `<text x="960" y="${282 + i * 84}" text-anchor="middle" fill="${P.ink}" style="font-family:'Noto Serif CJK TC';font-weight:900;font-size:72px">${c}</text>`).join('') + '</g>';
      ban += sk(line(800, 190, 1120, 190), { w: 8 }) + sk(line(800, 190 + hgt, 1120, 190 + hgt), { w: 8 });
    }
    // 鞭炮串
    let fc = '';
    const f0 = 1.2, fn = 14;
    const burnt = Math.floor(clamp((lt - f0) / 3.4) * fn);
    fc += sk(line(1500, 330, 1500, 360), { w: 2, p: dr(.5, .5) });
    for (let i = 0; i < fn - burnt; i++) fc += sk(rect(1488 + (i % 2) * 6, 360 + i * 26, 18, 22), { fill: P.red, fo: .85, w: 1.6, c: P.ink, p: dr(.5 + i * .03, .4), dbl: false });
    if (lt > f0 && burnt < fn) {
      const by = 360 + (fn - burnt) * 26;
      fc += halo(1500, by, 90 + 20 * Math.sin(lt * 40), 'hG', .9);
      for (let j = 0; j < 10; j++) { const a = hash(j + Math.floor(lt * 12)) * Math.PI * 2, r = 20 + hash(j * 3 + Math.floor(lt * 12)) * 60; fc += sm(line(1500 + Math.cos(a) * r * .4, by + Math.sin(a) * r * .4, 1500 + Math.cos(a) * r, by + Math.sin(a) * r), j % 2 ? P.red : P.gold, 3, .9); }
    }
    for (let j = 0; j < 14; j++) { // 煙與紙屑：從當時燃燒的位置冒出
      const tj = f0 + j * .25, tt = lt - tj; if (tt <= 0 || tt > 2.6) continue;
      const by0 = 360 + (fn - Math.floor(clamp(j * .25 / 3.4) * fn)) * 26;
      const sx = 1500 + (hash(j) - .5) * 60 + tt * 26, sy = by0 - tt * 60;
      fc += sk(ell(sx, sy, 24 + tt * 18, 16 + tt * 10, 10), { w: 1.6, c: P.soft, op: (1 - tt / 2.6) * .7, dbl: false });
      const cx = 1470 + hash(j * 7) * 60 + (hash(j * 5) - .5) * tt * 80, cy = by0 + tt * tt * 60;
      fc += `<rect x="${f1(cx)}" y="${f1(cy)}" width="8" height="5" fill="${P.red}" opacity="${f1((1 - tt / 2.6) * 100) / 100}" transform="rotate(${f1(tt * 200 + j * 40)} ${f1(cx)} ${f1(cy)})"/>`;
    }
    // 人群
    let crowd = '';
    const back = [[-100, 70, .82, 'bun', P.pink], [2000, -80, .8, 'none', null], [300, 80, .84, 'straw', P.gold]];
    back.forEach(([x0, sp, sc, hat, acc], i) => crowd += walker(x0, sp, 0, 790, sc, { hat, acc, dress: hat === 'bun', ph0: i }));
    let front = '';
    const fr = [[-200, 110, 1.15, 'none', P.red], [2100, -100, 1.12, 'bun', P.pink], [-500, 105, 1.1, 'kid', P.gold], [2400, -115, 1.18, 'straw', null]];
    fr.forEach(([x0, sp, sc, hat, acc], i) => front += walker(x0, sp, .3, 900, sc, { hat: hat === 'kid' ? 'kid' : hat, kid: hat === 'kid', acc, dress: hat === 'bun', ph0: i * 1.7, smile: 1 }));
    const lab = label(110, 150, '2011', '首屆米干節', L[0].s + .2, { w: 420 });
    return layer(.5, bg) + layer(.7, top + ban) + layer(.85, fc + crowd) + layer(1, front) + layer(0, lab);
  },
  cues(dur) {
    const c = [[0, 'crowd', 1, 0, dur], [1.0, 'gong', .7, 0]];
    for (let i = 0; i < 44; i++) c.push([1.2 + i * 3.4 / 44 + hash(i) * .05, 'pop', .6 + hash(i * 3) * .4, .15]);
    return c;
  },
};

// 9. 潑水節
SC.water = {
  mode: 'day', cam: { z0: 1.02, z1: 1.09, x0: 0, x1: -20, y0: 0, y1: 10 },
  draw(lt, dur, L) {
    let bg = '';
    // 傣式高腳亭
    const pp = dr(0, 1.4);
    bg += sk(poly([[700, 420], [960, 250], [1220, 420]], true), { fill: true, w: 3, p: pp, wash: P.gold, wo: .35, hatch: P.soft, hg: 12, hw: 1 }) + sk(poly([[640, 470], [960, 360], [1280, 470]], true), { fill: true, w: 3, p: pp }) +
      sk(rect(760, 470, 400, 140), { fill: true, w: 2.8, p: pp }) + sk(line(780, 610, 780, 770) + line(1140, 610, 1140, 770), { w: 3, p: pp });
    bg += bunting(-20, 150, 700, 190, 9, { p: dr(.3, 1), sag: 40 }) + bunting(1220, 190, 1940, 150, 9, { p: dr(.4, 1), sag: 40 });
    bg += tree(200, 770, 1.1, { type: 'palm', p: dr(.3, 1) }) + tree(1720, 770, 1.1, { type: 'palm', p: dr(.5, 1) });
    bg += ground(770, dr(0, 1));
    // 水窪漣漪
    for (let i = 0; i < 3; i++) { const u = (lt * .6 + i / 3) % 1; bg += sm(ell(960, 900, 60 + u * 140, 12 + u * 26, 16), P.soft, 2, (1 - u) * .7); }
    // 潑水者
    const throwsL = [1.6, 3.4, 5.2, 7.0], throwsR = [2.5, 4.3, 6.1, 7.9];
    const armOf = (ts) => { let a = 30; ts.forEach(t => { const u = (lt - t + .4) / .8; if (u > 0 && u < 1) a = 30 + Math.sin(u * Math.PI) * 120; }); return a; };
    let ppl = '';
    const aL = armOf(throwsL), aR = armOf(throwsR);
    ppl += person(560, 880, 1.25, { face: 1, hat: 'bun', dress: 1, acc: P.pink, arms: [aL, aL + 10], bend: [-20, -20], carry: 'basin', p: dr(.4, .8), smile: 1 });
    ppl += person(1380, 880, 1.25, { face: -1, hat: 'straw', acc: P.gold, arms: [aR, aR + 10], bend: [-20, -20], carry: 'basin', p: dr(.6, .8), smile: 1 });
    const hop = Math.abs(Math.sin(lt * 4)) * 30;
    ppl += person(960, 900 - hop, 1.05, { kid: 1, hat: 'kid', arms: [160, 170], bend: [0, 0], acc: P.red, p: dr(.8, .8), smile: 1 });
    // 水花拋物線
    let wat = '';
    const splash = (t, x0, dir) => {
      const u = (lt - t) / 1.1; if (u < 0 || u > 1.2) return '';
      let s = '';
      for (let i = 0; i < 16; i++) {
        const v = .75 + hash(i + t) * .5, a = hash(i * 3 + t) * .4;
        const k = clamp(u * v);
        const x = x0 + dir * k * 560, y = 680 - Math.sin(k * Math.PI) * (150 + a * 160) + k * 90;
        const op = u > 1 ? 1 - (u - 1) * 5 : 1;
        s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(6 + hash(i) * 5)}" ry="${f1(8 + hash(i) * 5)}" fill="${P.fill}" stroke="${P.ink}" stroke-width="2" opacity="${f1(clamp(op) * 100) / 100}"/>`;
      }
      const k = clamp(u * 1.05);
      const pts = []; for (let j = 0; j <= 8; j++) { const kk = k * j / 8; pts.push([x0 + dir * kk * 560, 680 - Math.sin(kk * Math.PI) * 200 + kk * 90]); }
      s += sm(curve(pts), P.ink, 3, clamp(1 - u) * .6);
      return s;
    };
    throwsL.forEach(t => wat += splash(t, 640, 1)); throwsR.forEach(t => wat += splash(t, 1300, -1));
    return layer(.6, bg) + layer(1, ppl + wat);
  },
  cues() { const c = [[0, 'crowd', .7, 0, 9]]; [1.6, 3.4, 5.2, 7.0].forEach(t => c.push([t, 'splash', .9, -.4])); [2.5, 4.3, 6.1, 7.9].forEach(t => c.push([t, 'splash', .9, .4])); return c; },
};

// 10. 長街宴
SC.banquet = {
  mode: 'day', cam: { z0: 1.0, z1: 1.08, x0: 60, x1: -60, y0: 0, y1: 0 },
  draw(lt, dur, L) {
    let bg = '';
    [-80, 330, 740, 1150, 1560].forEach((x, i) => bg += house(x, 640, 330, 200, { p: dr(i * .12, 1), rh: 80, noCouplet: i % 2 }));
    let top = '';
    top += sk(curve([[-40, 170], [480, 230], [960, 200], [1440, 230], [1960, 170]]), { w: 2, p: dr(.2, 1) });
    for (let i = 0; i < 7; i++) top += lantern(60 + i * 300, 250 + Math.sin(i * 1.3) * 16, .8, { p: dr(.4 + i * .08, .6) });
    // 桌後坐客
    let sit = '';
    for (let i = 0; i < 6; i++) {
      const cheer = dr(5.2 + i * .15, .5) * (1 - dr(7.2, .6));
      sit += person(250 + i * 280, 800, 1.0, { face: i % 2 ? -1 : 1, sit: 1, hat: ['bun', 'none', 'straw', 'old', 'bun', 'kid'][i], dress: i % 4 === 0, acc: [P.pink, null, P.gold, null, P.red, P.gold][i], arms: [20, 70 + cheer * 80], bend: [-30, -40 + cheer * 30], carry: cheer > .1 ? 'bowl' : undefined, p: dr(.5 + i * .12, .8), smile: 1 });
    }
    // 長桌
    let tb = sk(poly([[60, 740], [1860, 740], [1900, 790], [20, 790]], true), { fill: true, w: 3.2, p: dr(.3, 1.2), wash: P.red, wo: .25 }) +
      sk(rect(40, 790, 1840, 26) + line(80, 816, 80, 900) + line(1840, 816, 1840, 900) + line(960, 816, 960, 900), { fill: true, w: 2.8, p: dr(.4, 1.2) });
    // 菜一道道上桌
    for (let i = 0; i < 12; i++) {
      const t0 = 1.0 + i * .32, k = dr(t0, .35);
      if (k <= 0) continue;
      const x = 140 + i * 145, y = 750 - (1 - easeBack(k)) * 60;
      tb += sk(ell(x, y, 50, 12, 12), { fill: true, w: 2.4 }) + sk(curve([[x - 36, y - 4], [x - 26, y - 24], [x + 26, y - 24], [x + 36, y - 4]]), { fill: i % 3 === 0 ? P.red : i % 3 === 1 ? P.gold : P.pink, fo: .45, w: 2 });
      if (k >= 1 && i % 2 === 0) tb += steam(x, y - 26, 110, { n: 2, amp: 7, sp_x: 14, w: 2, op: .55 });
    }
    // 前方送菜者（遮住桌子）
    const srv = walker(-160, 150, 1.0, 1010, 1.25, { hat: 'bun', dress: 1, acc: P.pink, arms: [30, 95], bend: [-10, -60], carry: 'bowl', smile: 1 });
    return layer(.5, bg) + layer(.8, top) + layer(1, sit + tb) + layer(1.1, srv);
  },
  cues(dur) { const c = [[0, 'crowd', .9, 0, dur]]; for (let i = 0; i < 12; i++) c.push([1.0 + i * .32 + .3, 'clink', .5, -.8 + i * .14]); c.push([5.4, 'cheer', .8, 0]); return c; },
};

// 11. 火把節（夜景）
SC.torch = {
  mode: 'night', cam: { z0: 1.0, z1: 1.1, x0: 0, x1: 0, y0: 20, y1: 30 },
  draw(lt, dur, L) {
    let sky = stars(70, lt, 560) + moon(1640, 170, 60, { p: dr(0, 1) });
    let fw = '';
    const f0 = L[1] ? L[1].s - .6 : 7;
    [[520, 230, 0, 'gold'], [1250, 180, .8, 'pink'], [880, 290, 1.6, 'red'], [1500, 300, 2.5, 'gold'], [360, 330, 3.3, 'pink']].forEach(([x, y, d, c]) => fw += firework(x, y, f0 + d, c, x + 80));
    let bg = '';
    [-40, 380, 1260, 1640].forEach((x, i) => bg += house(x, 700, 320, 200, { p: dr(.2 + i * .1, 1.2), rh: 80, night: 1, light: .8 + .2 * Math.sin(lt * 3 + i), noCouplet: 1 }));
    bg += ground(700, dr(0, 1));
    // 火把遊行（後排）
    let proc = '';
    for (let i = 0; i < 4; i++) proc += walker(2000 + i * 190, -90, 0, 760, .78, { hat: i % 2 ? 'bun' : 'straw', dress: i % 2, carry: 'torch', arms: [10, 120], bend: [0, -70], ph0: i });
    // 營火
    let fire = halo(960, 760, 420, 'hG', .55 + .1 * Math.sin(lt * 9)) + halo(960, 740, 200, 'hR', .6);
    fire += sk(line(860, 830, 1060, 780) + line(860, 780, 1060, 830), { w: 7, c: P.ink });
    fire += flame(960, 740, 3.2, 1) + flame(910, 770, 1.8, 4) + flame(1015, 770, 1.9, 7);
    fire += sparks(960, 640, 26, lt, 120, 420);
    // 火舞者
    const dx = 520, dy = 940, th = lt * 5.2;
    const hx = dx + 10, hy = dy - 200;
    let dance = '';
    for (let k = 0; k < 2; k++) {
      const ang = th + k * Math.PI;
      for (let j = 0; j < 8; j++) { const a2 = ang - j * .12; dance += `<circle cx="${f1(hx + Math.cos(a2) * 140)}" cy="${f1(hy + Math.sin(a2) * 140)}" r="${f1(9 - j)}" fill="${P.glow}" opacity="${f1((1 - j / 8) * .8 * 100) / 100}"/>`; }
      dance += halo(hx + Math.cos(ang) * 140, hy + Math.sin(ang) * 140, 70, 'hG', .9);
    }
    const armA = 90 + Math.sin(th) * 60;
    dance += person(dx, dy, 1.15, { face: 1, hat: 'none', arms: [armA - 30, armA + 20], bend: [0, 0], acc: P.red, smile: 1 });
        dance += person(1420, 950, 1.1, { face: -1, hat: 'bun', dress: 1, carry: 'torch', arms: [10, 125], bend: [0, -70], acc: P.pink, smile: 1 });
    return layer(.2, sky + fw) + layer(.6, bg + proc) + layer(1, fire + dance);
  },
  cues(dur, L) {
    const f0 = L[1] ? L[1].s - .6 : 7;
    const c = [[0, 'fire', 1, 0, dur], [0, 'crowd', .5, 0, dur], [0, 'whoosh', .5, -.4, dur]];
    [[0, -.5], [.8, .3], [1.6, 0], [2.5, .5], [3.3, -.6]].forEach(([d, pan]) => { c.push([f0 + d - 1.1, 'launch', .5, pan]); c.push([f0 + d, 'boom', .9, pan]); });
    return c;
  },
};

// 12. 文化園區與異域故事館
SC.museum = {
  mode: 'day', cam: { z0: 1.0, z1: 1.08, x0: -30, x1: 40, y0: 0, y1: 10 },
  draw(lt, dur, L) {
    let bg = cloud(380 + lt * 10, 150, .9, { p: dr(0, 1) }) + cloud(1500 + lt * 7, 120, .7, { p: dr(.3, 1) }) + birds(lt, 180, 3, 1, 75);
    let bd = ground(800, dr(0, 1));
    // 館舍
    const pb = dr(.2, 1.6);
    bd += sk(rect(900, 460, 820, 340), { fill: true, w: 3.2, p: pb });
    bd += sk(poly([[860, 470], [1060, 300], [1560, 300], [1760, 470]], true), { fill: true, w: 3.2, p: sub(pb, .2, .7), hatch: P.soft, hg: 12, hw: 1.2, ha: 80 });
    bd += sk(rect(1110, 380, 400, 70), { fill: true, w: 2.6, p: sub(pb, .5, .9), wash: P.gold, wo: .45 }) + txt(1310, 430, '異域故事館', { size: 44, tw: 240, p: sub(pb, .7, 1) });
    for (let i = 0; i < 2; i++) { const wx = 960 + i * 580; bd += sk(rect(wx, 540, 150, 120), { fill: true, w: 2.4, p: sub(pb, .6, .9) }) + sk(line(wx + 75, 540, wx + 75, 660) + line(wx, 600, wx + 150, 600), { w: 1.4, p: sub(pb, .7, 1) }); }
    // 門打開
    const od = easeOut(dr(1.8, 1.4));
    bd += sk(rect(1210, 560, 200, 240), { fill: P.gold, fo: .25 + od * .5, w: 2.8, p: sub(pb, .6, .9) });
    if (od > 0) bd += halo(1310, 690, 200 * od, 'hG', od * .7);
    const lw = 100 * (1 - od * .82);
    bd += sk(rect(1210, 560, lw, 240), { fill: true, w: 2.4, p: sub(pb, .6, .9), wash: P.red, wo: .3 }) + sk(rect(1410 - lw, 560, lw, 240), { fill: true, w: 2.4, p: sub(pb, .6, .9), wash: P.red, wo: .3 });
    bd += tree(760, 800, 1.2, { p: dr(.6, 1.2) });
    // 落葉
    for (let i = 0; i < 6; i++) { const u = (lt * .18 + i / 6) % 1; const x = 700 + i * 30 + Math.sin(u * 8 + i) * 40, y = 640 + u * 180; bd += sk(ell(x, y, 8, 4, 6), { fill: P.gold, fo: .6, w: 1.4, op: 1 - u, dbl: false }); }
    // 照片牆
    const pw0 = L[1] ? L[1].s - .6 : 5;
    let wall = sk(rect(80, 400, 560, 400), { fill: true, w: 3, p: dr(.4, 1.2), hatch: P.soft, hg: 18, hw: 1 });
    const mini = [
      (x, y) => sk(poly([[x + 10, y + 120], [x + 60, y + 50], [x + 95, y + 90], [x + 140, y + 30], [x + 190, y + 120]]), { w: 2 }) + sk(line(x + 10, y + 120, x + 190, y + 120), { w: 1.6, dbl: false }),
      (x, y) => plane(x + 90, y + 50, .32),
      (x, y) => house(x + 40, y + 100, 100, 50, { rh: 26, noCouplet: 1 }),
      (x, y) => bowl(x + 90, y + 70, .42, { steam: false }),
    ];
    for (let i = 0; i < 4; i++) {
      const x = 120 + (i % 2) * 260, y = 430 + Math.floor(i / 2) * 180, k = dr(pw0 + i * .45, .7);
      if (k <= 0) continue;
      wall += grp('', sk(rect(x, y, 220, 150), { fill: true, w: 2.8, p: k, wash: P.gold, wo: .25 }) + (k >= 1 ? mini[i](x + 10, y + 5) : ''));
    }
    // 祖孫來參觀
    const ppl = walker(-150, 120, .5, 930, 1.1, { hat: 'old', stop: 5.4, arms: undefined }) +
      walker(-280, 120, .5, 930, 1.1, { kid: 1, hat: 'kid', stop: 5.4, ph0: 1.5, acc: P.gold, smile: 1 }) +
      (lt > 5.6 ? '' : '');
    let point = '';
    if (lt > 5.6) point = person(-280 + 120 * 4.9, 930, 1.1, { kid: 1, hat: 'kid', acc: P.gold, face: 1, arms: [0, lerp(0, 140, dr(5.6, .5))], bend: [0, 0], smile: 1 });
    return layer(.4, bg) + layer(1, bd + wall) + layer(1.05, lt > 5.6 ? walker(-150, 120, .5, 930, 1.1, { hat: 'old', stop: 5.4 }) + point : ppl);
  },
  cues(dur) { return [[0, 'amb_birds', .7, 0, dur], [1.8, 'creak', .7, .4]]; },
};

// 13. 收尾：祖孫共食一碗米干（夜）
SC.ending = {
  mode: 'night', cam: { z0: 1.4, z1: 1.02, x0: 0, x1: 0, y0: -300, y1: -20 },
  draw(lt, dur, L) {
    let sky = stars(60, lt, 480) + moon(960, 400 - lt * 3, 70, { p: dr(0, 1.2) });
    let bg = '';
    [-100, 310, 1250, 1660].forEach((x, i) => bg += house(x, 720, 330, 210, { p: dr(.1 + i * .1, 1.2), rh: 80, night: 1, light: .9, noCouplet: 1, chimney: i === 1 }));
    bg += ground(720, dr(0, 1));
    let top = sk(curve([[-40, 120], [480, 200], [960, 170], [1440, 200], [1960, 120]]), { w: 2, p: dr(.2, 1) });
    for (let i = 0; i < 6; i++) top += lantern(120 + i * 340, 215 + Math.sin(i * 1.3) * 16, .85, { p: dr(.3 + i * .08, .6), glow: .8 });
    // 螢火
    let ff = '';
    for (let i = 0; i < 14; i++) { const x = hash(i) * W + Math.sin(lt * .6 + i) * 40, y = 420 + hash(i * 3) * 400 + Math.cos(lt * .5 + i * 2) * 30, a = .4 + .6 * Math.abs(Math.sin(lt * 1.5 + i)); ff += halo(x, y, 22, 'hG', a) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.6" fill="${P.glow}" opacity="${f1(a * 100) / 100}"/>`; }
    // 桌與人物
    let tb = '';
    tb += halo(960, 760, 360, 'hG', .45);
    tb += stool(712, 930, 1.9) + stool(1208, 930, 1.5);
    const push = easeOut(dr(1.0, 1.2));
    const eatPh = Math.max(0, lt - 3.2) * 2 * Math.PI / 1.8;
    const eatArm = lt > 3.2 ? 60 + (1 - Math.cos(eatPh)) * .5 * 70 : 60;
    tb += person(720, 930, 1.5, { face: 1, sit: 1, hat: 'old', arms: [30, 40 + push * 40], bend: [-40, -40 + push * 30], smile: 1 });
    tb += person(1200, 930, 1.45, { face: -1, sit: 1, kid: 1, hat: 'kid', acc: P.gold, arms: [40, eatArm], bend: [-40, -80], carry: 'chop', smile: 1 });
    tb += sk(poly([[820, 790], [1100, 790], [1120, 818], [800, 818]], true), { fill: true, w: 3, wash: P.red, wo: .25 }) + sk(line(835, 818, 835, 930) + line(1085, 818, 1085, 930), { w: 3.2 });
    tb += bowl(lerp(900, 1010, push), 756, .4) + bowl(860, 764, .3, { steam: false });
    return layer(.15, sky) + layer(.55, bg) + layer(.8, top) + layer(1, tb + ff);
  },
  cues(dur) { const c = [[0, 'amb_night', 1, 0, dur], [1.0, 'bowl', .4, 0]]; for (let t = 3.2 + 1.8 / 2; t < dur - 2; t += 1.8) c.push([t, 'clink', .25, .3]); return c; },
};

// 14. 片尾字卡
SC.credits = {
  mode: 'day', cam: { z0: 1, z1: 1.03, x0: 0, x1: 0, y0: 0, y1: 0 },
  draw(lt, dur) {
    let s = '';
    s += bowl(360, 470, .9, { p: dr(.1, 1.4) });
    s += txt(360, 700, '龍岡米干節', { size: 60, tw: 320, p: dr(.5, 1) });
    s += txt(360, 752, 'Longgang Rice Noodle Festival', { size: 26, fam: "'Bitstream Charter'", wt: 400, it: 1, tw: 380, p: dr(.9, 1), c: P.soft });
    s += sk(line(640, 180, 640, 880), { w: 2, c: P.soft, p: dr(.3, 1) });
    const rows = [
      ['資料來源 Sources', 1, 40],
      ['交通部觀光署〈桃園龍岡米干節〉活動介紹', 0, 30],
      ['桃園市政府觀光旅遊局 Taoyuan Dept. of Tourism', 0, 30],
      ['忠貞新村文化園區・異域故事館', 0, 30],
      ['維基百科「忠貞新村」「泰緬孤軍」條目', 0, 30],
      ['今周刊、台灣光華雜誌、中時新聞網相關報導', 0, 30],
      ['', 0, 20],
      ['製作 Production', 1, 40],
      ['畫面：SVG 程式手繪動畫（無 AI 生圖）', 0, 30],
      ['旁白：開源語音合成（Kokoro TTS）', 0, 30],
      ['配樂與音效：程式原創合成（古箏・笛・鑼鼓）', 0, 30],
    ];
    let y = 240;
    rows.forEach(([t, h, sz], i) => { if (t) s += txt(720, y, t, { size: sz, wt: h ? 700 : 500, anc: 'start', tw: t.length * sz * .8, p: dr(.6 + i * .22, .8), c: h ? P.red : P.ink }); y += sz * 1.75; });
    const fade = 1 - dr(dur - 1.4, 1.2);
    return grp('', layer(1, s), fade);
  },
  cues(dur) { return [[0.2, 'gongS', .6, 0]]; },
};
