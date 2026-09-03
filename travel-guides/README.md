# 東南亞三城一頁式旅遊導覽

旅遊書風格、高資訊密度的一頁式城市導覽，共三張：

| 檔案 | 城市 | 主色 |
| --- | --- | --- |
| `01-bangkok.html` / `.png` | 曼谷 Bangkok | 朱紅 × 廟宇金 |
| `02-chiangmai.html` / `.png` | 清邁 Chiang Mai | 森林綠 × 柚木棕 |
| `03-hanoi.html` / `.png` | 河內 Hanoi | 湖水藍 × 芥末黃 |

每張含：基本資訊列（航程／時差／貨幣／季節／電壓／機場進城）、9 個精選景點（分三區）、
6 項在地美食、交通移動、行前必知、預算表、四天行程建議。

內容量由 `build.py` 的 `LIMITS` 控制（`spots` 每區幾個、`food`／`transport`／`tips`／`budget` 各幾項），
`cities.py` 保留完整資料，改數字即可加回更多內容。

## 重新產生

```bash
python3 cities.py   # 由 cities.py 的資料 + build.py 的版型產出 HTML
python3 shot.py     # 用 Playwright/Chromium 輸出 2800px 寬的 PNG
```

- 版型與樣式：`build.py`
- 文字內容：`cities.py`（改資料就能換城市或更新資訊）
- 字型：Noto Serif TC + Noto Sans TC（HTML 已內含 Google Fonts 連結）
