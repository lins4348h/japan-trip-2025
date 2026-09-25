// 逐格渲染：每格等待 DOM 與字型完成繪製（雙 rAF）後才截圖，串流給 ffmpeg
// 用法：node tools/render.mjs still <秒數,...> <輸出資料夾>
//       node tools/render.mjs video <起始格> <結束格> <輸出檔.mp4>
//       node tools/render.mjs cues <輸出.json>
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs'; import path from 'path'; import url from 'url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/timeline.json')));
const [mode, a1, a2, a3] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exitCode = 2; });
await page.goto('file://' + path.join(ROOT, 'web/index.html'));
await page.evaluate(t => window.setTimeline(t), tl);
await page.evaluate(async () => { await document.fonts.ready; const im = document.getElementById('grain'); if (!im.complete) await new Promise(r => im.onload = r); });
await page.evaluate(() => Promise.all(["700 40px 'Noto Serif CJK TC'", "900 40px 'Noto Serif CJK TC'", "500 40px 'Noto Sans CJK TC'", "italic 30px 'Bitstream Charter'", "500 40px 'Noto Serif CJK TC'"].map(f => document.fonts.load(f, '龍岡米干節abc'))));
const stage = await page.$('#stage');
async function frame(fi) {
  const n = await page.evaluate(fi => new Promise(res => { const n = window.renderFrame(fi); requestAnimationFrame(() => requestAnimationFrame(() => res(n))); }), fi);
  if (!n) throw new Error('empty frame ' + fi);
  return stage.screenshot({ type: 'png' });
}
if (mode === 'cues') {
  fs.writeFileSync(a1, JSON.stringify(await page.evaluate(() => window.getCues()), null, 1));
} else if (mode === 'still') {
  fs.mkdirSync(a2, { recursive: true });
  for (const s of a1.split(',')) { const fi = Math.round(parseFloat(s) * tl.fps); fs.writeFileSync(path.join(a2, `f_${String(fi).padStart(5, '0')}.png`), await frame(fi)); }
} else if (mode === 'video') {
  const f0 = parseInt(a1), f1 = parseInt(a2);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(tl.fps), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(tl.fps), a3], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let fi = f0; fi < f1; fi++) {
    const buf = await frame(fi);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((fi - f0) % 150 === 0) console.log(`[${a3}] ${fi - f0}/${f1 - f0} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
