# 龍岡米干節由來與相關介紹：手繪線稿動畫

1920×1080、30fps、約 2 分 36 秒。畫面全部用 SVG 程式繪製（rough.js 手繪抖動線條），沒有使用 AI 生圖。

## 成品
- `output/longgang_migan_festival.mp4`：成片，中英雙語字幕已燒進畫面
- `output/longgang_migan_festival.srt`：字幕檔（中文一行、英文一行）
- `output/stills/`：各場景抽幀截圖
- `SOURCES.md`：旁白稿與資料來源

## 製作流程（可重跑）
```bash
pip install numpy scipy soundfile pyloudnorm sherpa-onnx pillow
npm i                                  # roughjs；Playwright 使用系統已安裝的版本
python3 tools/tts.py <kokoro模型資料夾> build/voice 49   # 1. 逐句合成旁白並量秒數
python3 tools/timeline.py              # 2. 依秒數排場景長度，輸出時間軸與 .srt
python3 tools/paper.py                 # 3. 紙張紋理
node tools/render.mjs cues build/cues.json   # 4. 從場景匯出音效提示點（畫面與音效同一份時間）
python3 tools/audio.py                 # 5. 配樂＋音效＋旁白、自動壓低音樂、-15 LUFS
node tools/render.mjs video 0 4690 build/seg/s0.mp4   # 6. 逐格渲染（可分段平行）
python3 tools/qa.py output/longgang_migan_festival.mp4 # 7. 逐格品質檢查
```

## 旁白聲音
原本指定使用 VoAI「子墨」，但這個雲端環境的網路政策擋住 voai.ai，也沒有 API 金鑰，所以這版先用開源 Kokoro TTS 的男聲 `zm_yunjian`（語速 0.86）。
要換成子墨：把 23 句的 wav 放到 `build/voice/<場景>_<句序>.wav`（檔名見 `build/voice/durations.json`），再從步驟 2 重跑即可。場景長度、字幕和音效會自動依新秒數重新對齊。

## 檔案結構
- `web/lib.js`：手繪引擎與可重用元件（人物、房屋、樹、雲、水波、蒸氣、火焰、燈籠、飛機、碗、旗幟、標籤卡）
- `web/scenes.js`：14 個場景（每場各有一個會動的事件，以及鏡頭推移和持續動態）
- `web/main.js`：時間軸、鏡頭視差、轉場、字幕
- `tools/`：TTS、時間軸、音訊、渲染、QA 腳本
