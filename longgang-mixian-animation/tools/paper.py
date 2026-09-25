# 產生紙張紋理疊層（中性灰，soft-light 疊在畫面上）：雲狀斑駁 + 細顆粒 + 紙纖維。程式生成，非 AI 圖。
import numpy as np
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageDraw
W, H = 1920, 1080; rng = np.random.default_rng(7)
def noise(sig):
    n = gaussian_filter(rng.standard_normal((H, W)), sig); return n / n.std()
g = 128 + noise(70) * 9 + noise(14) * 5 + noise(1.0) * 7 + rng.standard_normal((H, W)) * 5
im = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).convert("RGB"); d = ImageDraw.Draw(im, "RGBA")
for _ in range(1400):
    x, y = rng.uniform(0, W), rng.uniform(0, H); a = rng.uniform(0, np.pi); L = rng.uniform(8, 30)
    pts = [(x + np.cos(a + .35 * np.sin(t)) * t * L / 4, y + np.sin(a + .35 * np.sin(t)) * t * L / 4) for t in range(5)]
    v = int(rng.choice([70, 190])); d.line(pts, fill=(v, v, v, int(rng.uniform(40, 90))), width=1)
im.save("web/grain.png"); print("ok")
