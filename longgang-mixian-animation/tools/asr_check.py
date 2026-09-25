# 以離線語音辨識回聽旁白，檢查發音與文字是否一致
import json, sys, numpy as np, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
M = sys.argv[1]
rec = sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=f"{M}/model.int8.onnx", tokens=f"{M}/tokens.txt", num_threads=4)
d = json.load(open("script.json"))
for s in d["scenes"]:
    for i, l in enumerate(s["lines"]):
        x, sr = sf.read(f"build/voice/{s['id']}_{i}.wav", dtype="float32")
        x = resample_poly(x, 16000, sr).astype(np.float32)
        st = rec.create_stream(); st.accept_waveform(16000, x); rec.decode_stream(st)
        print(f"{s['id']}_{i}\n  TXT {l['tts']}\n  ASR {st.result.text}")
