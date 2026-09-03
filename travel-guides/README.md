# 東南亞三城一頁式旅遊導覽（手機閱讀版）

旅遊書風格、直式單欄、為手機螢幕設計的城市導覽，共三張：

| 檔案 | 城市 | 主色 |
| --- | --- | --- |
| `01-bangkok.html` / `.png` | 曼谷 Bangkok | 朱紅 × 廟宇金 |
| `02-chiangmai.html` / `.png` | 清邁 Chiang Mai | 森林綠 × 柚木棕 |
| `03-hanoi.html` / `.png` | 河內 Hanoi | 湖水藍 × 芥末黃 |

- 版面寬 1080 px（輸出 2160 px，2 倍解析度），手機全寬檢視時內文約 10 pt，不用放大就看得到
- 每張含：6 格基本資訊、6 個景點（分三區）、5 項美食、3 條交通、4 則行前提醒、4 天行程、預算表

## 重新產生

```bash
python3 cities.py   # 由 cities.py 的資料 + build.py 的版型產出 HTML
python3 shot.py     # 用 Playwright/Chromium 輸出 PNG
```

- 版型與樣式：`build.py`
- 文字內容：`cities.py`（完整資料都在，未印出的只是被 LIMITS 篩掉）
- 內容量：`build.py` 的 `LIMITS`（`spots` 每區幾個、`food`／`transport`／`tips`／`budget`／`steps` 各幾項）
- 字型：Noto Serif TC + Noto Sans TC
