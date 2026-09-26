"""替 open-slide 匯出的網頁版簡報補上翻頁操作。

open-slide「Export as HTML」只支援鍵盤方向鍵；這支腳本在 </body> 前插入：
手機／平板左右滑動、滑鼠滾輪與觸控板、點畫面翻頁（左側三分之一上一頁），以及左右下角的翻頁按鈕。
翻頁一律轉成方向鍵事件，沿用匯出檔原本的換頁邏輯。

用法：每次重新匯出、覆蓋 web/teacher-retirement-cashflow.html 之後執行
    python3 patch_web_deck.py
"""
import pathlib

HERE = pathlib.Path(__file__).parent
TARGET = HERE / 'web/teacher-retirement-cashflow.html'
MARK = '<!-- deck-nav-patch -->'

PATCH = MARK + """
<style>
.os-stage { touch-action: pan-y pinch-zoom; cursor: pointer; }
.os-nav { position: fixed; bottom: 8px; z-index: 11; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: rgba(0,0,0,.4); color: #fff; font-size: 26px; line-height: 44px; padding: 0; cursor: pointer;
  opacity: .6; transition: opacity .2s; -webkit-tap-highlight-color: transparent; }
.os-nav:hover, .os-nav:focus-visible { opacity: 1; }
.os-prev { left: 10px; } .os-next { right: 10px; }
</style>
<button type="button" class="os-nav os-prev" aria-label="上一頁">‹</button>
<button type="button" class="os-nav os-next" aria-label="下一頁">›</button>
<style>
@keyframes os-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.os-page.os-enter { animation: os-rise 240ms cubic-bezier(0, 0, 0.2, 1); }
</style>
<script>
// 逐步呈現：匯出檔只有換頁，這裡補上 <Step> 的一步一步出現（→ 先揭露下一步，全部出現後才換頁；← 反向收回）
(function () {
  var pages = document.querySelectorAll('.os-page');
  function curIdx() { for (var i = 0; i < pages.length; i++) if (!pages[i].hidden) return i; return 0; }
  function steps(i) { return pages[i].querySelectorAll('[data-osd-step]'); }
  function show(el, on) {
    el.setAttribute('data-osd-step', on ? 'revealed' : 'pending');
    el.style.opacity = on ? '1' : '0';
    el.style.visibility = on ? 'visible' : 'hidden';
  }
  function enter(i, forward) {
    steps(i).forEach(function (el) { show(el, !forward); });
    pages[i].classList.remove('os-enter'); void pages[i].offsetWidth; pages[i].classList.add('os-enter');
  }
  window.addEventListener('keydown', function (e) {
    var fwd = ['ArrowRight','ArrowDown','PageDown',' '].indexOf(e.key) >= 0;
    var back = ['ArrowLeft','ArrowUp','PageUp'].indexOf(e.key) >= 0;
    var i = curIdx();
    if (fwd) {
      var pend = pages[i].querySelector('[data-osd-step="pending"]');
      if (pend) { e.preventDefault(); e.stopImmediatePropagation(); show(pend, true); return; }
    } else if (back) {
      var shown = pages[i].querySelectorAll('[data-osd-step="revealed"]');
      if (shown.length) { e.preventDefault(); e.stopImmediatePropagation(); show(shown[shown.length - 1], false); return; }
    }
    setTimeout(function () { var j = curIdx(); if (j !== i) enter(j, j > i && !(e.key === 'End')); }, 0);
  }, true);
})();

(function () {
  function step(d) {
    // 從 body 送出、往上冒泡，逐步呈現（window 捕獲階段）才會先接到
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: d > 0 ? 'ArrowRight' : 'ArrowLeft', cancelable: true, bubbles: true }));
  }
  document.querySelector('.os-prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  document.querySelector('.os-next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });

  // 手機、平板：左右（或上下）滑動
  var sx = 0, sy = 0, multi = false, swiped = false;
  document.addEventListener('touchstart', function (e) {
    multi = e.touches.length > 1;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (multi || e.touches.length) return;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    swiped = true; setTimeout(function () { swiped = false; }, 400);
    if (Math.abs(dx) >= Math.abs(dy)) step(dx < 0 ? 1 : -1); else step(dy < 0 ? 1 : -1);
  }, { passive: true });

  // 滑鼠滾輪、觸控板：一次手勢翻一頁，慣性捲動停下來才接受下一次
  var acc = 0, busy = false, quiet;
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;  // 保留觸控板縮放
    e.preventDefault();
    clearTimeout(quiet);
    quiet = setTimeout(function () { busy = false; acc = 0; }, 220);
    if (busy) return;
    acc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(acc) >= 40) { step(acc > 0 ? 1 : -1); busy = true; acc = 0; }
  }, { passive: false });

  // 點畫面：左側三分之一上一頁，其餘下一頁
  document.querySelector('.os-stage').addEventListener('click', function (e) {
    if (swiped) return;
    step(e.clientX < window.innerWidth / 3 ? -1 : 1);
  });
})();
</script>
"""

html = TARGET.read_text(encoding='utf-8')
if MARK in html:
    html = html[:html.index(MARK)] + html[html.index('</body>'):]
html = html.replace('</body>', PATCH + '</body>', 1)
TARGET.write_text(html, encoding='utf-8')
print('patched', TARGET.name)
