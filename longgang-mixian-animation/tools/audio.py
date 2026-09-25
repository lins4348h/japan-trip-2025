# 原創配樂（古箏、笛子、鑼鼓）＋音效＋旁白混音：旁白出現時自動壓低音樂，整體響度 -15 LUFS
import json, zlib, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import lfilter, butter, sosfilt, resample_poly, fftconvolve

SR = 44100
TL = json.load(open("build/timeline.json")); CUES = json.load(open("build/cues.json"))
DUR = TL["total"] + 0.5; N = int(DUR * SR)
rng = np.random.default_rng(2011)
music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); voice = np.zeros((N, 2))

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)
def add(buf, t, x, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or len(x) == 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * gain * l * 1.414; buf[i:i + len(x), 1] += x * gain * r * 1.414
def tt(d): return np.arange(int(d * SR)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- 樂器 ----------------
def guzheng(f, d=2.5, vel=1.0, bright=0.5):
    n = int(d * SR); Nd = max(2, int(round(SR / f)))
    exc = rng.uniform(-1, 1, Nd); exc = lfilter([bright, 1 - bright], [1], exc)
    x = np.zeros(n); x[:Nd] = exc
    g = 0.9975 if f < 300 else 0.995
    a = np.zeros(Nd + 2); a[0] = 1; a[Nd] = -0.5 * g; a[Nd + 1] = -0.5 * g
    y = lfilter([1], a, x)
    y += 0.25 * np.sin(2 * np.pi * f * tt(d)[:n]) * np.exp(-tt(d)[:n] * 3)  # 琴身共鳴
    fade = np.ones(n); fade[-2000:] = np.linspace(1, 0, 2000)
    return y * fade * vel * 0.5

def dizi(notes, bpm):
    """notes: [(start_sec, dur_sec, midi)]，連貫樂句；回傳 (起點, 訊號)"""
    if not notes: return 0, np.zeros(1)
    t0 = notes[0][0]; t1 = notes[-1][0] + notes[-1][1] + 0.4
    t = tt(t1 - t0); f = np.zeros_like(t); amp = np.zeros_like(t)
    for (s, d, m) in notes:
        i0, i1 = int((s - t0) * SR), int((s - t0 + d) * SR)
        f[i0:] = mtof(m)
        k = np.arange(i1 - i0) / SR
        env = np.minimum(1, k / 0.06) * np.minimum(1, (d - k) / 0.08 + 0.15)
        amp[i0:i1] = np.maximum(amp[i0:i1], np.clip(env, 0, 1))
    # 滑音
    f = lfilter([0.004], [1, -0.996], f, zi=[f[0] * 0.996])[0]
    vib_depth = np.zeros_like(t)
    for (s, d, m) in notes:
        i0, i1 = int((s - t0) * SR), int((s - t0 + d) * SR)
        k = np.arange(i1 - i0) / SR; vib_depth[i0:i1] = np.clip((k - 0.25) / 0.4, 0, 1) * 0.012
    fv = f * (1 + vib_depth * np.sin(2 * np.pi * 5.6 * t))
    ph = 2 * np.pi * np.cumsum(fv) / SR
    y = sum(a * np.sin(h * ph) for h, a in zip(range(1, 7), [1, .55, .32, .16, .09, .05]))
    y = np.tanh(1.6 * y) * 0.7  # 笛膜亮聲
    breath = bp(rng.standard_normal(len(t)), 1800, 5200) * 0.06
    amp = lp(amp, 30)
    return t0, (y + breath) * amp * 0.32

def drum(big=True):
    d = 0.7 if big else 0.18; t = tt(d)
    if big:
        f = 55 + 70 * np.exp(-t * 18)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 30) * .5
    else:
        y = bp(rng.standard_normal(len(t)), 900, 4000) * np.exp(-t * 35) + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 40) * .5
    return y * 0.8
def woodblock(f=900):
    t = tt(0.15); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t * 45) * .5
def gong(f0=170, d=4.0, big=True):
    t = tt(d); y = np.zeros_like(t)
    glide = 1 - (0.07 * (1 - np.exp(-t * 1.5)) if big else -0.05 * (1 - np.exp(-t * 6)))
    for r, a, dec in zip([1, 1.52, 2.03, 2.61, 3.27, 4.1, 5.2, 6.4], [1, .7, .6, .45, .35, .25, .18, .12], [.9, 1.1, 1.3, 1.6, 2, 2.4, 3, 3.5]):
        y += a * np.sin(2 * np.pi * np.cumsum(f0 * r * glide * (1 + 0.002 * np.sin(2 * np.pi * 3 * t))) / SR) * np.exp(-t * dec * (1.0 if big else 2.5))
    y += hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 20) * .3
    return y * np.minimum(1, t / 0.004) * 0.35
def cymbal(d=0.6):
    t = tt(d); return hp(rng.standard_normal(len(t)), 3500) * np.exp(-t * 7) * 0.35

# ---------------- 配樂編排 ----------------
PENT = [0, 2, 4, 7, 9]  # D 宮調五聲
def deg2midi(deg, base=62):
    o, i = divmod(deg, 5); return base + 12 * o + PENT[i]
MOOD = {  # bpm, 箏型態, 笛密度, 鑼鼓強度, 基音偏移, 音量
    "open":     (72, "calm", .6, 0, 0, .8), "title": (72, "gliss", .0, 0, 0, .9),
    "jungle":   (60, "somber", .5, .35, -3, .8), "plane": (76, "rise", .7, 0, 0, .85),
    "village":  (80, "warm", .7, .1, 0, .85), "market": (100, "lively", .8, .3, 0, .85),
    "migan":    (90, "warm", .6, .15, 0, .8), "festival": (116, "lively", .9, 1.0, 0, 1),
    "water":    (116, "lively", .9, .8, 0, 1), "banquet": (108, "lively", .8, .6, 0, .95),
    "torch":    (124, "lively", .9, 1.2, 0, 1), "museum": (66, "calm", .5, 0, 0, .8),
    "ending":   (62, "tender", .9, 0, 0, .95), "credits": (66, "gliss", .4, 0, 0, .85),
}
CHORDS = [[0, 3, 5, 7], [4, 7, 9, 12], [1, 4, 6, 9], [3, 5, 8, 10]]  # 以五聲音級表示
SOMBER = [[4, 7, 9, 11], [1, 4, 6, 9], [3, 5, 8, 10], [2, 4, 7, 9]]

def scene_music(sc):
    bpm, gz, dz, lg, shift, vol = MOOD[sc["id"]]
    s0, d = sc["start"], sc["dur"] + 0.3
    beat = 60 / bpm; bars = int(d / (beat * 4)) + 1
    loc = np.random.default_rng(zlib.crc32(sc["id"].encode()))
    base = 50 + shift
    chords = SOMBER if gz == "somber" else CHORDS
    fade_in = 0.0 if sc["id"] == "open" else 0.5
    def v_at(t):  # 淡入淡出
        return min(1, (t - s0) / max(fade_in, 1e-3) if fade_in else 1) * min(1, (s0 + d - t) / 0.8)
    if gz == "gliss":
        for k in range(15):
            t = s0 + 0.05 + k * 0.045; add(music, t, guzheng(mtof(deg2midi(k, base)), 3.0, .55, .6), vol * .9, -.5 + k / 15)
        for k in range(6):
            t = s0 + 1.8 + k * .5
            if t < s0 + d - 1: add(music, t, guzheng(mtof(deg2midi([0, 3, 5, 7, 5, 3][k], base)), 3.0, .6), vol * .8, -.2)
    for b in range(bars):
        ch = chords[b % 4]; bt = s0 + b * 4 * beat
        if gz == "gliss": break
        if gz in ("calm", "somber", "tender"):
            pat = [(0, ch[0]), (1, ch[1]), (2, ch[2]), (3, ch[3])] if gz != "somber" else [(0, ch[0]), (2, ch[1]), (3, ch[2])]
        elif gz in ("warm", "rise"):
            pat = [(i * .5, ch[i % 4] + (5 if (gz == "rise" and i >= 4) else 0)) for i in range(8)]
        else:
            pat = [(i * .5, ch[[0, 2, 1, 3, 2, 1, 3, 2][i]]) for i in range(8)]
        for (off, dg) in pat:
            t = bt + off * beat
            if t > s0 + d - 0.6: continue
            add(music, t, guzheng(mtof(deg2midi(dg, base)), 2.6, .45 + .15 * loc.random(), .55), vol * v_at(t) * (.9 if gz == "lively" else 1), loc.uniform(-.4, .2))
        if gz in ("calm", "tender", "somber") and b % 2 == 0:  # 低音
            t = bt; add(music, t, guzheng(mtof(deg2midi(ch[0], base - 12)), 3.5, .6, .4), vol * v_at(t), -.1)
    # 笛子旋律
    if dz > 0:
        t = s0 + (1.0 if sc["id"] != "open" else 2.0); deg = 7
        while t < s0 + d - 2.0:
            phrase = []; plen = loc.integers(4, 8)
            for i in range(plen):
                durs = [2, 1.5, 1, 1, .5] if bpm < 80 else [1, .5, .5, 1, 1.5]
                nd = float(loc.choice(durs)) * beat
                if i == plen - 1: nd = 2.5 * beat; deg = int(loc.choice([5, 7, 10]))
                else: deg = int(np.clip(deg + loc.choice([-2, -1, -1, 1, 1, 2]), 3, 12))
                if t + nd > s0 + d - 0.8: break
                phrase.append((t, nd * .97, deg2midi(deg, 62 + 12 + shift)))
                t += nd
            if phrase:
                st, y = dizi(phrase, bpm)
                add(music, st, y, vol * dz * .9 * v_at(st), .25)
            t += beat * float(loc.choice([2, 3, 4])) / max(dz, .5)
    # 鑼鼓
    if lg > 0:
        e = beat / 2
        for b in range(bars):
            bt = s0 + b * 4 * beat
            for i in range(8):
                t = bt + i * e
                if t > s0 + d - .5 or t < s0 + .3: continue
                g = lg * v_at(t) * .6
                if [1, 0, 1, 0, 1, 1, 0, 1][i] and (lg >= .6 or i in (0, 4)): add(music, t, drum(True), .55 * g, 0)
                if lg >= .6 and i in (2, 6): add(music, t, cymbal(), .6 * g, .3)
                if lg >= .6 and i in (3, 7): add(music, t, gong(620, 1.0, False), .35 * g, -.3)
                if lg < .6 and i in (2, 6): add(music, t, woodblock(), .45 * g, .4)
            if lg >= .9 and b % 2 == 0 and bt > s0 + .3: add(music, bt, gong(150, 3.5), .28 * lg * v_at(bt), 0)

for sc in TL["scenes"]: scene_music(sc)
# 結尾長音
end_t = TL["scenes"][-1]["start"] + 0.2
add(music, end_t + 4.0, guzheng(mtof(50), 5.0, .7, .4), .9, -.2); add(music, end_t + 4.05, guzheng(mtof(57), 5.0, .6, .4), .8, 0); add(music, end_t + 4.1, guzheng(mtof(62), 5.0, .6, .4), .8, .2)

# 殘響
ir_t = tt(1.8); ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2) for _ in range(2)], 1); ir[:, 0] = lp(ir[:, 0], 5000); ir[:, 1] = lp(ir[:, 1], 5000)
ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(music[:, c], ir[:, c])[:N] for c in range(2)], 1)
music = music + 0.28 * wet

# ---------------- 音效 ----------------
def noise(d): return rng.standard_normal(int(d * SR))
def env_ad(n, a, r):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
def swell(n, a=1.0):
    e = np.ones(n); k = min(n // 2, int(a * SR)); e[:k] = np.linspace(0, 1, k); e[-k:] = np.linspace(1, 0, k); return e
def chirp(f0, f1, d):
    t = tt(d); f = np.linspace(f0, f1, len(t)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
def S_amb_sea(d):
    t = tt(d); return lp(noise(d), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t) ** 2) * swell(len(t)) * .25
def S_birds(d):
    y = np.zeros(int(d * SR)); t = 0.3
    while t < d - .5:
        for k in range(rng.integers(2, 5)):
            c = chirp(rng.uniform(2800, 4200), rng.uniform(3800, 6000), rng.uniform(.05, .12)); i = int((t + k * .13) * SR); y[i:i + len(c)] += c[: len(y) - i] * .12
        t += rng.uniform(1.0, 2.6)
    return y
def S_amb_birds(d): return S_birds(d) + lp(noise(d), 500) * .05 * swell(int(d * SR))
def S_amb_jungle(d):
    t = tt(d); ins = bp(noise(d), 4200, 6200) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t)) * (0.6 + .4 * np.sin(2 * np.pi * .3 * t)) * .05
    return (ins + lp(noise(d), 400) * .12 * (0.6 + .4 * np.sin(2 * np.pi * .1 * t))) * swell(len(t)) + S_birds(d) * .5
def S_amb_night(d):
    t = tt(d); cr = np.sin(2 * np.pi * 4600 * t) * ((np.sin(2 * np.pi * 28 * t) > .3) * (np.sin(2 * np.pi * .9 * t) > 0)) * .03
    return (lp(cr, 7000) + lp(noise(d), 300) * .04) * swell(len(t))
def S_amb_wind(d): t = tt(d); return bp(noise(d), 200, 1200) * (0.4 + .6 * np.sin(2 * np.pi * .17 * t) ** 2) * .12 * swell(len(t))
def S_pin(d=0): return woodblock(1400) * 1.2 + chirp(1800, 2400, .15) * .3
def S_gong(d=0): return gong(150, 4.5)
def S_gongS(d=0): return gong(210, 3.5) * .6
def S_thud(d=0): return drum(True)
def S_drumroll(d=0):
    y = np.zeros(int(2.4 * SR))
    for k in range(34):
        x = drum(False) * (0.2 + .8 * k / 34); i = int(k * .065 * SR); y[i:i + len(x)] += x[: len(y) - i]
    return y
def S_steps(d):
    y = np.zeros(int(d * SR))
    for s in range(5):
        t = rng.uniform(0, .6)
        while t < d:
            x = lp(noise(.09), 1200) * env_ad(int(.09 * SR), .004, .03) * .25; i = int(t * SR); y[i:i + len(x)] += x[: len(y) - i]; t += 0.6 + rng.uniform(-.02, .02)
    return y
def S_plane(d):
    t = tt(d); f = 88 * (1 + .03 * np.tanh((t - d * .5) / 2) * -1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(h * ph) / h for h in range(1, 9)) * (0.7 + .3 * np.sin(2 * np.pi * 11 * t)) + lp(noise(d), 600) * .6
    return lp(y, 1400) * .12 * swell(len(t), 1.5)
def S_knock(d=0): t = tt(.12); return (np.sin(2 * np.pi * 320 * t) * np.exp(-t * 40) + bp(noise(.12), 1500, 4000) * np.exp(-t * 90)) * .6
def S_hoe(d=0): t = tt(.2); return (lp(noise(.2), 700) * np.exp(-t * 25) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 30)) * .6
def S_crowd(d):
    t = tt(d); y = np.zeros(len(t))
    for k in range(10):
        am = np.clip(np.sin(2 * np.pi * rng.uniform(3, 6) * t + rng.uniform(0, 6)), 0, 1) * (0.5 + .5 * np.sin(2 * np.pi * rng.uniform(.1, .3) * t + k))
        y += bp(noise(d), rng.uniform(300, 500), rng.uniform(900, 1600)) * am
    return y * .045 * swell(len(t))
def S_cheer(d=0): d = 2.5; t = tt(d); return S_crowd(d) * 2.5 * np.sin(np.pi * t / d)
def S_grind(d):
    t = tt(d); return (lp(noise(d), 300) * (0.6 + .4 * np.sin(2 * .5 * np.pi * .35 * t * 2)) * .3 + bp(noise(d), 2000, 5000) * (rng.random(len(t)) > .995) * .6) * swell(len(t), .4)
def S_fire(d):
    t = tt(d); y = lp(noise(d), 250) * .25
    cl = np.zeros(len(t)); idx = rng.integers(0, len(t), int(d * 14)); cl[idx] = rng.uniform(.3, 1, len(idx)) * rng.choice([-1, 1], len(idx))
    y += lfilter([1], [1, -0.6], hp(cl, 1500)) * .5
    return y * swell(len(t), .5)
def S_pour(d):
    t = tt(d); y = bp(noise(d), 500, 2200) * .2 * (0.6 + .4 * rng.random(len(t)))
    for k in range(int(d * 18)):
        c = chirp(rng.uniform(400, 900), rng.uniform(900, 1500), .03) * .15; i = int(rng.uniform(0, d - .05) * SR); y[i:i + len(c)] += c
    return y * swell(len(t), .15)
def S_steam(d): t = tt(d); return hp(noise(d), 3000) * np.minimum(1, t / .05) * np.exp(-t * 1.2) * .35
def S_bowl(d=0): t = tt(.5); return (np.sin(2 * np.pi * 1250 * t) + .6 * np.sin(2 * np.pi * 2950 * t)) * np.exp(-t * 12) * .35
def S_chop(d=0): t = tt(.12); return (bp(noise(.12), 1500, 6000) * np.exp(-t * 80) + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 40)) * .7
def S_pop(d=0): t = tt(.25); return (hp(noise(.25), 800) * np.exp(-t * 60) * 1.4 + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 30) * .4) * .8
def S_splash(d=0):
    t = tt(.8); y = bp(noise(.8), 800, 6000) * np.minimum(1, t / .02) * np.exp(-t * 6) * .6
    for k in range(10):
        c = chirp(rng.uniform(800, 1500), rng.uniform(1500, 2500), .025) * .15; i = int(rng.uniform(.3, .75) * SR); y[i:i + len(c)] += c
    return y
def S_clink(d=0): t = tt(.6); f = rng.uniform(2200, 2800); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.52 * t)) * np.exp(-t * 9) * .25
def S_whoosh(d):
    t = tt(d); return bp(noise(d), 300, 1800) * (np.sin(np.pi * 1.655 * t) ** 8) * .35 * swell(len(t))
def S_launch(d=0): t = tt(1.1); return (chirp(700, 2200, 1.1) * .25 + hp(noise(1.1), 2000) * .05) * np.minimum(1, t / .1)
def S_boom(d=0):
    t = tt(2.4); y = (np.sin(2 * np.pi * np.cumsum(40 + 50 * np.exp(-t * 8)) / SR) * np.exp(-t * 3) + lp(noise(2.4), 500) * np.exp(-t * 5)) * .9
    cl = np.zeros(len(t)); idx = rng.integers(int(.3 * SR), len(t), 160); cl[idx] = rng.uniform(.2, .8, 160)
    return y + hp(cl, 2500) * np.exp(-t * 1.2) * .7
def S_creak(d=0):
    t = tt(1.3); f = 110 + 40 * np.sin(2 * np.pi * .8 * t) + rng.standard_normal(len(t)).cumsum() * .02
    x = (np.mod(np.cumsum(f) / SR, 1) - .5); return bp(x, 300, 2500) * np.sin(np.pi * t / 1.3) * .35
SFX = {k[2:]: v for k, v in globals().items() if k.startswith("S_")}
for c in CUES:
    fn = SFX.get(c["type"])
    if fn is None: print("missing sfx", c["type"]); continue
    x = fn(c["dur"]) if c["dur"] else fn(0)
    add(sfx, c["t"], x, c["gain"], c["pan"])

# ---------------- 旁白 ----------------
for s in TL["subs"]:
    x, sr = sf.read(f"build/voice/{s['key']}.wav", dtype="float64")
    x = resample_poly(x, SR, sr); x = hp(x, 70)
    x = x / (np.abs(x).max() + 1e-9) * 0.5
    add(voice, s["start"], x, 1.0, 0.0)

# 旁白壓低（ducking）：依每句旁白音量自動計算背景需壓低多少，確保語音高於背景約 15 dB
rms = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-9)
bg_raw = music * 0.55 + sfx * 0.8
red = np.zeros(N)
for s_ in TL["subs"]:
    a0, a1 = int(s_["start"] * SR), int(s_["end"] * SR)
    depth = float(np.clip(rms(bg_raw[a0:a1]) - (rms(voice[a0:a1]) - 15), 6, 26))
    r0, r1 = int((s_["start"] - .3) * SR), int((s_["end"] + .35) * SR)
    red[r0:r1] = np.maximum(red[r0:r1], depth)
k = int(.25 * SR); ker = np.hanning(2 * k + 1); ker /= ker.sum()
from scipy.ndimage import maximum_filter1d
red = np.convolve(maximum_filter1d(red, k), ker, mode="same")
mg = 10 ** (-red / 20); sg = 10 ** (-np.maximum(red - 2, 0) / 20)
mix = music * 0.55 * mg[:, None] + sfx * 0.8 * sg[:, None] + voice
# 整體淡出
fo = int(1.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]

# ---------------- 響度與限幅 ----------------
meter = pyln.Meter(SR)
def limiter(x, ceil=10 ** (-2.5 / 20)):
    up = resample_poly(x, 4, 1, axis=0)  # 4 倍超取樣估計真峰值
    pk = np.abs(up).reshape(-1, 4, 2).max((1, 2))[: len(x)]; pk = np.pad(pk, (0, len(x) - len(pk)), mode='edge'); w = int(.005 * SR)
    from scipy.ndimage import maximum_filter1d
    need = np.minimum(1, ceil / np.maximum(maximum_filter1d(pk, w * 2 + 1), 1e-9))
    g = lfilter([1 - .9995], [1, -.9995], need, zi=[1.0])[0]; g = np.minimum(g, need)
    g = -maximum_filter1d(-g, w * 2 + 1)  # 前瞻
    return x * g[:, None]
for _ in range(3):
    L = meter.integrated_loudness(mix); mix *= 10 ** ((-15 - L) / 20); mix = limiter(mix)
print("LUFS", round(meter.integrated_loudness(mix), 2), "peak dBFS", round(20 * np.log10(np.abs(mix).max()), 2))
sf.write("build/mix.wav", mix.astype(np.float32), SR, subtype="PCM_24")
sf.write("build/music_only.wav", (music * .55).astype(np.float32), SR)
# 每句旁白的語音/背景比（目標 ≥ 12 dB）
bg = music * 0.55 * mg[:, None] + sfx * 0.8 * sg[:, None]
snr = [(s["key"], round(rms(voice[int(s["start"] * SR):int(s["end"] * SR)]) - rms(bg[int(s["start"] * SR):int(s["end"] * SR)]), 1)) for s in TL["subs"]]
print("voice/bg dB:", [(k_, float(v)) for k_, v in snr]); print("min", min(v for _, v in snr))
