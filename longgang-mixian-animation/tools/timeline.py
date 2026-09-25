# 依旁白實測秒數排出場景長度，輸出 build/timeline.json 與 output/*.srt
import json
d = json.load(open("script.json")); durs = json.load(open("build/voice/durations.json"))
PRE, GAP, TAIL = 1.6, 1.0, 1.8          # 場景開頭留白、句間停頓、場景結尾留白
FIXED = {"title": 6.0, "credits": 10.0}
PRE_OVR = {"open": 3.2, "plane": 2.2, "water": 2.0, "banquet": 2.0}
TAIL_OVR = {"ending": 3.2, "water": 2.4, "banquet": 2.4}
XF = 0.6                                 # 場景交疊（轉場）秒數
t = 0.0; scenes = []; subs = []
for s in d["scenes"]:
    start = t
    if s["id"] in FIXED:
        dur = FIXED[s["id"]]
    else:
        lt = PRE_OVR.get(s["id"], PRE)
        for i, l in enumerate(s["lines"]):
            k = f"{s['id']}_{i}"
            subs.append({"key": k, "zh": l["zh"], "en": l["en"], "start": round(start + lt, 3), "end": round(start + lt + durs[k], 3)})
            lt += durs[k] + (GAP if i < len(s["lines"]) - 1 else 0)
        dur = lt + TAIL_OVR.get(s["id"], TAIL)
    scenes.append({"id": s["id"], "start": round(start, 3), "dur": round(dur, 3)})
    t = start + dur - XF
total = round(scenes[-1]["start"] + scenes[-1]["dur"], 3)
json.dump({"fps": 30, "total": total, "xf": XF, "scenes": scenes, "subs": subs}, open("build/timeline.json", "w"), ensure_ascii=False, indent=1)
def ts(x):
    ms = int(round(x * 1000)); return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}"
with open("output/longgang_migan_festival.srt", "w", encoding="utf-8") as f:
    for i, s in enumerate(subs, 1):
        f.write(f"{i}\n{ts(s['start'])} --> {ts(s['end'] + 0.35)}\n{s['zh']}\n{s['en']}\n\n")
for s in scenes: print(s)
print("total", total)
