# 把多張截圖拼成對照表（附時間標籤）
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
files = sorted(glob.glob(os.path.join(sys.argv[1], '*.png'))); out = sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
w, h = 800, 450; rows = (len(files) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * h), 'white'); d = ImageDraw.Draw(S)
fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') else None
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS); x, y = (i % cols) * w, (i // cols) * h
    S.paste(im, (x, y)); fi = int(os.path.basename(f)[2:7]); d.rectangle([x, y, x + 120, y + 34], fill='black'); d.text((x + 6, y + 2), f"{fi/30:.1f}s", fill='yellow', font=fnt)
S.save(out); print(out, S.size)
