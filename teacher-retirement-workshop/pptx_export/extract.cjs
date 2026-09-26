// 把 open-slide 每一頁的 DOM 量成「色塊／線／文字／圖片」清單，給 build.cjs 轉成可編輯 PPTX
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const N = +process.argv[2] || 55;
const OUT = '/tmp/claude-0/pptx/data';
fs.mkdirSync(OUT, { recursive: true });

function extract() {
  const root = [...document.querySelectorAll('.absolute.inset-0')].find((e) => {
    const r = e.getBoundingClientRect();
    return Math.abs(r.width - 1920) < 2 && Math.abs(r.height - 1080) < 2;
  }).firstElementChild;
  const R = root.getBoundingClientRect();
  const items = [];
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(',').map((s) => parseFloat(s));
    if (+a === 0) return null;
    return { hex: [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(), a: +a };
  };
  const box = (r) => ({ x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height });
  const fam = (f) => (/DM Serif/.test(f) ? 'num' : /Plex Mono|monospace/.test(f) ? 'mono' : /Serif/.test(f) ? 'serif' : 'sans');
  let imgId = 0;

  function runsOf(el, acc, nodes, deco0 = '') {
    for (const ch of el.childNodes) {
      if (ch.nodeType === 3) {
        if (!ch.textContent) continue;
        const cs = getComputedStyle(ch.parentElement);
        let t = cs.whiteSpace.startsWith('pre') ? ch.textContent : ch.textContent.replace(/\s+/g, ' ');
        if (cs.textTransform === 'uppercase') t = t.toUpperCase();
        const c = parse(cs.color) || { hex: '000000', a: 1 };
        const deco = (cs.textDecorationLine || '') + ' ' + deco0;
        acc.push({
          t, color: c.hex, alpha: c.a * op(ch.parentElement), size: parseFloat(cs.fontSize),
          bold: +cs.fontWeight >= 600, italic: cs.fontStyle === 'italic', fam: fam(cs.fontFamily),
          strike: deco.includes('line-through'), underline: deco.includes('underline'),
          ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
        });
        nodes.push(ch);
      } else if (ch.nodeType === 1) {
        const cs = getComputedStyle(ch);
        if (cs.display === 'none') continue;
        if (ch.tagName === 'BR') { acc.push({ br: true }); continue; }
        if (cs.display === 'inline') {
          const bg = parse(cs.backgroundColor);
          const lw = parseFloat(cs.borderTopWidth), lc = parse(cs.borderTopColor);
          if (bg || (lw > 0 && lc && cs.borderTopStyle !== 'none')) {
            for (const q of ch.getClientRects()) items.push({
              k: 'rect', ...box(q), fill: bg && { ...bg, a: bg.a * op(ch) }, rad: Math.min(parseFloat(cs.borderTopLeftRadius) || 0, q.height / 2),
              line: lw > 0 && lc ? { hex: lc.hex, a: lc.a * op(ch), w: lw, dash: cs.borderTopStyle } : null,
            });
          }
          const ml = parseFloat(cs.marginLeft) + parseFloat(cs.paddingLeft), mr = parseFloat(cs.marginRight) + parseFloat(cs.paddingRight);
          if (ml > 6 && acc.length) acc.push({ ...acc.filter((x) => !x.br).slice(-1)[0], t: ' ' });
          runsOf(ch, acc, nodes, deco0 + ' ' + (cs.textDecorationLine || ''));
          if (mr > 6) acc.push({ ...acc.filter((x) => !x.br).slice(-1)[0], t: ' ' });
        }
      }
    }
  }
  const opCache = new Map();
  function op(el) {
    if (!el || el === root.parentElement) return 1;
    if (opCache.has(el)) return opCache.get(el);
    const v = parseFloat(getComputedStyle(el).opacity) * op(el.parentElement);
    opCache.set(el, v);
    return v;
  }

  function walk(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || op(el) < 0.02) return;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) return;
    if (el.tagName === 'IMG' || el.tagName.toLowerCase() === 'svg') {
      items.push({ k: 'img', id: imgId++, ...box(r) });
      el.setAttribute('data-pimg', imgId - 1);
      return;
    }
    const o = op(el);
    if (cs.display === 'inline') { for (const ch of el.children) walk(ch); return; }
    const bg = parse(cs.backgroundColor);
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => {
      const w = parseFloat(cs[`border${s}Width`]);
      const c = parse(cs[`border${s}Color`]);
      return w > 0 && c && cs[`border${s}Style`] !== 'none' ? { w, c, style: cs[`border${s}Style`] } : null;
    });
    const all = sides.every((s) => s && s.w === sides[0].w && s.c.hex === sides[0].c.hex);
    if (bg || all) {
      items.push({
        k: 'rect', ...box(r), fill: bg && { ...bg, a: bg.a * o }, rad: Math.min(rad, r.height / 2),
        line: all ? { hex: sides[0].c.hex, a: sides[0].c.a * o, w: sides[0].w, dash: sides[0].style } : null,
      });
    }
    if (!all) {
      const b = box(r);
      sides.forEach((s, i) => {
        if (!s) return;
        const L = { hex: s.c.hex, a: s.c.a * o, w: s.w, dash: s.style };
        if (s.style === 'double' && s.w >= 3) {
          const t = s.w / 3;
          const seg = (off) =>
            i === 0 ? { x: b.x, y: b.y + off, w: b.w, h: 0 } : i === 2 ? { x: b.x, y: b.y + b.h - s.w + off, w: b.w, h: 0 }
            : i === 1 ? { x: b.x + b.w - s.w + off, y: b.y, w: 0, h: b.h } : { x: b.x + off, y: b.y, w: 0, h: b.h };
          items.push({ k: 'line', ...seg(t / 2), line: { ...L, w: t } });
          items.push({ k: 'line', ...seg(s.w - t / 2), line: { ...L, w: t } });
        } else {
          const h = s.w / 2;
          const seg = i === 0 ? { x: b.x, y: b.y + h, w: b.w, h: 0 } : i === 2 ? { x: b.x, y: b.y + b.h - h, w: b.w, h: 0 }
            : i === 1 ? { x: b.x + b.w - h, y: b.y, w: 0, h: b.h } : { x: b.x + h, y: b.y, w: 0, h: b.h };
          items.push({ k: 'line', ...seg, line: L });
        }
      });
    }
    if (cs.display !== 'inline') {
      const runs = [], nodes = [];
      let dd = '';
      for (let e = el; e && e !== root.parentElement; e = e.parentElement) dd += ' ' + (getComputedStyle(e).textDecorationLine || '');
      runsOf(el, runs, nodes, dd.replace(/none/g, ''));
      // 修掉頭尾空白
      const txt = runs.filter((x) => !x.br);
      if (txt.length) { txt[0].t = txt[0].t.replace(/^\s+/, ''); txt[txt.length - 1].t = txt[txt.length - 1].t.replace(/\s+$/, ''); }
      if (runs.some((x) => x.t && x.t.trim())) {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        const tops = new Set(); let fh = 0;
        for (const n of nodes) {
          const rg = document.createRange();
          rg.selectNodeContents(n);
          for (const q of rg.getClientRects()) {
            if (q.width < 0.5) continue;
            if (!fh) fh = q.height;
            x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom);
            tops.add([q.top, q.bottom]);
          }
        }
        if (x1 > x0) {
          const lh = cs.lineHeight === 'normal' ? parseFloat(cs.fontSize) * 1.3 : parseFloat(cs.lineHeight);
          // 內容區（扣 padding）當作可換行的寬度
          const cw = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
          const cx = r.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
          items.push({
            k: 'text', x: x0 - R.left, y: y0 - R.top, w: x1 - x0, h: y1 - y0, cx: cx - R.left, cw,
            lines: (() => { const rs = [...tops].sort((p, q) => p[0] - q[0]); let n = 0, end = -1e9;
              for (const [t, b] of rs) { if (t >= end - 2) { n++; end = b; } else end = Math.max(end, b); } return n; })(), align: cs.textAlign, lh, fh, runs,
          });
        }
      }
    }
    for (const ch of el.children) walk(ch);
  }
  walk(root);
  const bg = parse(getComputedStyle(root).backgroundColor);
  return { bg: bg ? bg.hex : 'FFFFFF', items };
}

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  await pg.goto('http://localhost:4173/s/teacher-retirement-cashflow?p=1', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(3000);
  await pg.keyboard.press('f');
  await pg.waitForTimeout(3000);
  for (let i = 1; i <= N; i++) {
    const d = await pg.evaluate(extract);
    for (const it of d.items.filter((x) => x.k === 'img')) {
      const f = `${OUT}/s${i}_img${it.id}.png`;
      await pg.locator(`[data-pimg="${it.id}"]`).first().screenshot({ path: f, omitBackground: true });
      it.file = f;
    }
    fs.writeFileSync(`${OUT}/s${i}.json`, JSON.stringify(d));
    await pg.keyboard.press('ArrowRight');
    await pg.waitForTimeout(500);
  }
  await b.close();
  console.log('extracted', N);
})();
