# 音訊客觀檢查：各場景旁白/背景比、有無削波或靜音斷層
import json, numpy as np, soundfile as sf
TL = json.load(open("build/timeline.json"))
x, sr = sf.read("build/mix.wav"); m, _ = sf.read("build/music_only.wav")
print("NaN:", np.isnan(x).any(), " max:", round(np.abs(x).max(), 3), " len:", round(len(x) / sr, 2))
db = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-9)
for s in TL["scenes"]:
    a, b = int(s["start"] * sr), int((s["start"] + s["dur"]) * sr)
    print(f'{s["id"]:9s} mix {db(x[a:b]):6.1f} dB   music(raw) {db(m[a:b]):6.1f} dB')
# 旁白段 vs 非旁白段的背景
on = np.zeros(len(x), bool)
for u in TL["subs"]: on[int(u["start"] * sr):int(u["end"] * sr)] = True
print("mix during narration", round(db(x[on]), 1), " without narration", round(db(x[~on]), 1))
# 靜音偵測（>0.8s 低於 -55 dB）
w = int(.1 * sr); r = np.array([db(x[i:i + w]) for i in range(0, len(x) - w, w)])
q = np.where(r < -55)[0]; print("quiet 100ms blocks:", len(q), (q[:20] * .1).round(1))
