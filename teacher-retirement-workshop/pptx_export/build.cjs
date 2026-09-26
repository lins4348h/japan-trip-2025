const pptxgen = require('pptxgenjs');
const fs = require('fs');
const D = '/tmp/claude-0/pptx/data';
const N = +process.argv[2] || 55;
const OUTF = process.argv[3] || '/tmp/claude-0/pptx/deck.pptx';
const src = fs.readFileSync('/home/user/japan-trip-2025/open-slide-workspace/slides/teacher-retirement-cashflow/index.tsx', 'utf8');
const nb = src.slice(src.indexOf('export const notes = ['), src.indexOf('export const meta'));
const notes = [...nb.matchAll(/^  '(.*)',$/gm)].map((m) => m[1].replace(/\\'/g, "'"));
const I = (px) => px / 144;
const FONT = { sans: 'Microsoft JhengHei', serif: 'Microsoft JhengHei', num: 'Times New Roman', mono: 'Consolas' };
const CJK = /([⺀-鿿豈-﫿＀-￯　-〿]+)/;
const pres = new pptxgen();
pres.defineLayout({ name: 'HD', width: 13.333, height: 7.5 });
pres.layout = 'HD';
pres.title = '教師退休現金流工作坊';
for (let i = 1; i <= N; i++) {
  const d = JSON.parse(fs.readFileSync(`${D}/s${i}.json`, 'utf8'));
  const s = pres.addSlide();
  s.background = { color: d.bg };
  for (const it of d.items) {
    if (it.k === 'rect') {
      const o = { x: I(it.x), y: I(it.y), w: I(it.w), h: I(it.h) };
      o.fill = it.fill ? { color: it.fill.hex, transparency: Math.round((1 - it.fill.a) * 100) } : { type: 'none' };
      o.line = it.line ? { color: it.line.hex, width: it.line.w * 0.5, transparency: Math.round((1 - it.line.a) * 100), dashType: it.line.dash === 'dashed' ? 'dash' : it.line.dash === 'dotted' ? 'sysDot' : 'solid' } : { type: 'none' };
      if (it.rad > 1) o.rectRadius = I(it.rad);
      s.addShape(it.rad > 1 ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, o);
    } else if (it.k === 'line') {
      s.addShape(pres.shapes.LINE, { x: I(it.x), y: I(it.y), w: I(it.w), h: I(it.h), line: { color: it.line.hex, width: Math.max(0.25, it.line.w * 0.5), transparency: Math.round((1 - it.line.a) * 100), dashType: it.line.dash === 'dashed' ? 'dash' : it.line.dash === 'dotted' ? 'sysDot' : 'solid' } });
    } else if (it.k === 'img') {
      s.addImage({ path: it.file, x: I(it.x), y: I(it.y), w: I(it.w), h: I(it.h) });
    } else if (it.k === 'text') {
      const arr = [];
      for (const r of it.runs) {
        if (r.br) { if (arr.length) arr[arr.length - 1].options.breakLine = true; continue; }
        if (!r.t) continue;
        const segs = r.fam === 'num' || r.fam === 'mono' ? r.t.split(CJK).filter(Boolean) : [r.t];
        for (const t of segs) {
          arr.push({ text: t, options: {
            fontFace: CJK.test(t) ? FONT.sans : FONT[r.fam], fontSize: Math.round(r.size * 0.5 * 10) / 10, color: r.color,
            bold: r.bold, italic: r.italic, strike: r.strike ? 'sngStrike' : undefined, underline: r.underline ? { style: 'sng' } : undefined,
            charSpacing: r.ls ? r.ls * 0.5 : undefined, transparency: r.alpha < 1 ? Math.round((1 - r.alpha) * 100) : undefined,
          } });
        }
      }
      if (!arr.length) continue;
      let align = it.align === 'center' ? 'center' : it.align === 'right' || it.align === 'end' ? 'right' : 'left';
      if (it.lines === 1 && align === 'left') {
        const L = it.x - it.cx, Rr = it.cx + it.cw - (it.x + it.w);
        if (L > 4 && Rr < 3) align = 'right';
        else if (L > 4 && Math.abs(L - Rr) < 3) align = 'center';
      }
      const top = it.y - Math.max(0, (it.lh - it.fh) / 2);
      const h = it.lines * it.lh;
      let x, w, wrap;
      if (it.lines > 1) { x = it.cx; w = it.cw * 1.02; wrap = true; }
      else {
        wrap = false; w = it.w * 1.12 + 8;
        x = align === 'center' ? it.x + it.w / 2 - w / 2 : align === 'right' ? it.x + it.w - w : it.x;
      }
      s.addText(arr, { x: I(x), y: I(top), w: I(w), h: I(h), margin: 0, valign: 'top', align, wrap, fit: 'none', lineSpacing: it.lh * 0.5, isTextBox: true });
    }
  }
  if (notes[i - 1]) s.addNotes(notes[i - 1]);
}
pres.writeFile({ fileName: OUTF }).then(() => console.log('wrote', OUTF, notes.length, 'notes'));
