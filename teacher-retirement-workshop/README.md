# 教師退休現金流工作坊（3 小時）

| 檔案 | 用途 |
| --- | --- |
| `../open-slide-workspace/slides/teacher-retirement-cashflow/index.tsx` | open-slide 簡報原始檔（55 頁，含講者備註與每頁時間；實作頁用學習單範例版截圖） |
| `簡報預覽_教師退休現金流工作坊.pdf` | 簡報靜態預覽 |
| `build_worksheet.py` | 學習單產生器（`python3 build_worksheet.py` → worksheet.html；加 `--example` → worksheet_example.html 範例版） |
| `worksheet.html` | 學習單（瀏覽器列印 A4） |
| `worksheet_example.html`、`學習單_我的退休帳本_範例版.pdf` | 示範用範例版（虛構 32 歲舊制老師，紅框與草稿都填好） |
| `slide_shots.cjs`、`slide_shots.py` | 學習單改版後重截簡報實作頁的圖：`node slide_shots.cjs && python3 slide_shots.py` |
| `web/` | 簡報網頁版（open-slide 匯出後執行 `python3 patch_web_deck.py`，補上滑動、滾輪、點擊與按鈕翻頁） |
| `學習單_我的退休帳本.pdf` | 學習單列印版（7 頁 A4，含 A～G 總複習表） |
| `簡報_教師退休現金流工作坊.pptx` | 可編輯 PowerPoint 版（55 頁，文字框、色塊可直接改，含講者備註；學習單截圖與 QR Code 為圖片）。由 `pptx_export/`（extract.cjs 量網頁版每頁版面 → build.cjs 用 pptxgenjs 組成 PPTX）產生 |

## 啟動簡報
```bash
cd open-slide-workspace
npm install
npm run dev   # 開 http://localhost:5173/s/teacher-retirement-cashflow ，按 F 全螢幕
```
