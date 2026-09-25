# 逐格品質檢查：空白格、純黑/純白破圖區塊、非轉場處的劇烈跳動、字幕與旁白同步、影音長度
import json, subprocess, sys, numpy as np
VID = sys.argv[1]
TL = json.load(open("build/timeline.json")); FPS = TL["fps"]
W, H = 960, 540
p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-i", VID, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
bounds = [s["start"] for s in TL["scenes"][1:]]
def near_boundary(t): return any(b - .1 <= t <= b + TL["xf"] + .1 for b in bounds)
def sub_on(t): return any(u["start"] + .1 <= t <= u["end"] for u in TL["subs"])
def sub_off(t): return all(not (u["start"] - .4 <= t <= u["end"] + .8) for u in TL["subs"])
issues = []; prev = None; n = 0; diffs = []; subs_ok = [0, 0]; nosub_ok = [0, 0]
while True:
    buf = p.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.int16); t = n / FPS
    g = f.mean(2)
    if g.std() < 3 and t < TL["total"] - 1.5: issues.append((n, "近乎空白"))
    # 破圖：32x32 區塊為純黑或純白
    tiles = g[: H // 32 * 32, : W // 32 * 32].reshape(H // 32, 32, W // 32, 32)
    tmax, tmin = tiles.max((1, 3)), tiles.min((1, 3))
    if ((tmax <= 2) | (tmin >= 253)).any(): issues.append((n, "純黑/純白區塊"))
    if prev is not None:
        d = np.abs(g - prev).mean(); diffs.append(d)
        if d > 12 and not near_boundary(t): issues.append((n, f"畫面突變 {d:.1f}"))
    # 字幕框：底部中央區域變暗
    box = g[H - 70:H - 30, W // 2 - 150:W // 2 + 150].mean(); ref = g[H - 70:H - 30, 20:120].mean()
    dark = box < ref - 25
    if sub_on(t): subs_ok[0] += dark; subs_ok[1] += 1
    if sub_off(t): nosub_ok[0] += (not dark); nosub_ok[1] += 1
    prev = g; n += 1
p.wait()
dur_v = n / FPS
dur_a = float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=duration", "-of", "csv=p=0", VID], capture_output=True, text=True).stdout.strip() or 0)
print(f"總格數 {n}（{dur_v:.2f}s），音訊 {dur_a:.2f}s，時間軸 {TL['total']:.2f}s")
print(f"相鄰格平均差異 {np.mean(diffs):.2f}，最大 {np.max(diffs):.2f}")
print(f"字幕應出現且有字幕框：{subs_ok[0]}/{subs_ok[1]}；應無字幕且無字幕框：{nosub_ok[0]}/{nosub_ok[1]}")
print("異常：", len(issues)); [print("  ", i, f"{i[0]/FPS:.2f}s") for i in issues[:40]]
