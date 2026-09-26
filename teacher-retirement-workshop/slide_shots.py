"""學習單範例版 → 簡報實作頁用的截圖（第二步：裁切＋產生「在第幾頁哪個位置」縮圖）。

用法：node slide_shots.cjs && python3 slide_shots.py
輸出：../open-slide-workspace/slides/teacher-retirement-cashflow/assets/ws-*.png
"""
import json
import pathlib
import tempfile

from PIL import Image, ImageDraw

SRC = pathlib.Path(tempfile.gettempdir()) / 'ws-slide-shots'
OUT = pathlib.Path(__file__).parent.parent / 'open-slide-workspace/slides/teacher-retirement-cashflow/assets'
SCALE = 2      # slide_shots.cjs 的 deviceScaleFactor
MAP_W = 260    # 縮圖寬（簡報上顯示 130px）

for rid, r in json.loads((SRC / 'regions.json').read_text()).items():
    page = Image.open(SRC / f'page{r["page"]}.png').convert('RGB')
    w, h = page.size
    padx = 10
    box = (max(0, int((r['x0'] - padx) * SCALE)), max(0, int((r['y0'] - r['padTop']) * SCALE)),
           min(w, int((r['x1'] + padx) * SCALE)), min(h, int((r['y1'] + r['padBottom']) * SCALE)))
    crop = page.crop(box).quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    crop.save(OUT / f'ws-{rid}.png', optimize=True)

    sc = MAP_W / w
    thumb = page.resize((MAP_W, int(h * sc)), Image.LANCZOS).convert('RGBA')
    shade = Image.new('RGBA', thumb.size, (15, 59, 48, 150))
    mbox = tuple(int(v * sc) for v in box)
    ImageDraw.Draw(shade).rectangle(mbox, fill=(0, 0, 0, 0))
    thumb = Image.alpha_composite(thumb, shade)
    ImageDraw.Draw(thumb).rectangle(mbox, outline=(180, 67, 46, 255), width=5)
    thumb.convert('RGB').quantize(colors=128, dither=Image.Dither.NONE).save(OUT / f'ws-{rid}-map.png', optimize=True)
    print('ws-' + rid)
