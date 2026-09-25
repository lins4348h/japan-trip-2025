# 旁白合成：逐句產生 wav，並量測秒數寫入 build/durations.json
import json, os, sys, numpy as np, soundfile as sf, sherpa_onnx
M = sys.argv[1]; OUT = sys.argv[2]; SID = int(sys.argv[3]) if len(sys.argv) > 3 else 49
os.makedirs(OUT, exist_ok=True)
cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=f"{M}/model.onnx", voices=f"{M}/voices.bin",
        tokens=f"{M}/tokens.txt", data_dir=f"{M}/espeak-ng-data", dict_dir=f"{M}/dict",
        lexicon=f"{M}/lexicon-us-en.txt,{M}/lexicon-zh.txt"), num_threads=4),
    rule_fsts=f"{M}/date-zh.fst,{M}/phone-zh.fst,{M}/number-zh.fst", max_num_sentences=1)
tts = sherpa_onnx.OfflineTts(cfg)
d = json.load(open("script.json")); durs = {}
for s in d["scenes"]:
    for i, l in enumerate(s["lines"]):
        a = tts.generate(l["tts"], sid=SID, speed=0.86)
        x = np.array(a.samples, dtype=np.float32)
        # 修剪頭尾靜音
        idx = np.where(np.abs(x) > 0.01)[0]
        x = x[max(0, idx[0]-240): idx[-1]+2400]
        key = f"{s['id']}_{i}"
        sf.write(f"{OUT}/{key}.wav", x, a.sample_rate)
        durs[key] = len(x) / a.sample_rate
        print(key, round(durs[key], 2), l["zh"])
json.dump(durs, open(f"{OUT}/durations.json", "w"), indent=1, ensure_ascii=False)
print("total", round(sum(durs.values()), 1))
