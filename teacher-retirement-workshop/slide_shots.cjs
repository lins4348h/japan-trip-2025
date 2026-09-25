// 學習單範例版 → 簡報實作頁用的截圖（第一步：整頁截圖＋量出各區塊位置）
// 用法：node slide_shots.cjs && python3 slide_shots.py
const path = require('path');
const fs = require('fs');
const os = require('os');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const OUT = path.join(os.tmpdir(), 'ws-slide-shots');
// [檔名, 學習單頁序（0＝封面）, 起始文字, 結束文字, 模式]
const REGIONS = [
  ['cover', 0, 'QUESTION 00', '怎麼用這份學習單', 'kids'],
  ['p2-salary', 1, 'HANDS-ON 01', '年薪成長空間', 'kids'],
  ['p2-pension', 1, 'HANDS-ON 02', '預估月退（專戶＋公保年金）', 'kids'],
  ['p3-input', 2, 'HANDS-ON 03', '一次性支出', 'kids'],
  ['p3-result', 2, '你的收支體檢', '今天最重要的一個數字', 'kids'],
  ['p4-input', 3, 'HANDS-ON 04', '你的負債', 'kids'],
  ['p4-result', 3, '你的資產總覽', '對照《財富階梯》', 'kids'],
  ['p5-setup', 4, 'HANDS-ON 05', '初始本金：手邊現在就想投入的錢', 'kids'],
  ['p5-draft', 4, '② 草稿表', '退休時預估累積', 'kids'],
  ['p5-result', 4, '③ 圈一組付得起的版本', '看圖說話', 'kids'],
  ['p6-top', 5, '目前年薪', '退休後每月餘裕', 'rows'],
  ['p6-bottom', 5, '總淨值', '用一段話說給自己聽', 'rows+'],
  ['p7-action', 6, '我的定期定額計畫', '我的定期定額計畫', 'kids'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'worksheet_example.html'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const secs = await p.$$('section.page');
  for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: path.join(OUT, `page${i}.png`) });
  const regions = await p.evaluate((REGIONS) => {
    const secs = [...document.querySelectorAll('section.page')];
    const res = {};
    for (const [id, pi, s, e, mode] of REGIONS) {
      const sec = secs[pi];
      const sr = sec.getBoundingClientRect();
      let els;
      let padTop = 10, padBottom = 10;  // 留白不超過和上下鄰居距離的一半，避免切到隔壁一行
      if (mode === 'kids') {
        const kids = [...sec.children];
        const a = kids.findIndex((k) => k.textContent.includes(s));
        const z = kids.findIndex((k, j) => j >= a && k.textContent.includes(e));
        els = kids.slice(a, z + 1);
        const prev = kids.slice(0, a).filter((k) => getComputedStyle(k).position !== 'absolute').pop();
        const next = kids.slice(z + 1).find((k) => getComputedStyle(k).position !== 'absolute');
        if (prev) padTop = Math.max(2, Math.min(10, (els[0].getBoundingClientRect().top - prev.getBoundingClientRect().bottom) / 2));
        if (next) padBottom = Math.max(2, Math.min(10, (next.getBoundingClientRect().top - els[els.length - 1].getBoundingClientRect().bottom) / 2));
      } else {
        padTop = 2; padBottom = 2;
        const rows = [...sec.querySelectorAll('table.sum tr')];
        const a = rows.findIndex((r) => r.textContent.includes(s));
        const z = rows.findIndex((r, j) => j >= a && r.textContent.includes(e));
        els = mode === 'rows'
          ? [rows[0], ...rows.slice(a, z + 1)]
          : [...rows.slice(a), [...sec.children].find((k) => k.textContent.includes(e))];
      }
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
      }
      res[id] = { page: pi, mode, padTop, padBottom, x0: x0 - sr.left, y0: y0 - sr.top, x1: x1 - sr.left, y1: y1 - sr.top };
    }
    return res;
  }, REGIONS);
  fs.writeFileSync(path.join(OUT, 'regions.json'), JSON.stringify(regions, null, 1));
  console.log('regions →', OUT);
  await b.close();
})();
