# 行政訊息轉譯台

給導師用的單頁工具：貼上行政群組的碎片訊息，一次撈出「我要做的事」，並產出三份可直接送出的布達文字。

## 產出

| 區塊 | 用途 |
|---|---|
| 給學生 | 直接貼班級群組 |
| 白話簡化版 | 每句 25 字內、一句一件事，給閱讀理解較弱或特教學生 |
| 給家長 | 聚焦簽名、繳費、回條、健康狀況 |
| 我要做的事 | 導師本人動作＋截止日，急件標紅 |
| 被後面改掉的訊息 | 自動取最終版，並列出被覆蓋的舊版 |
| 附件與連結 | 抽出檔名與網址，附上「要誰做什麼」 |
| 已略過 | 閒聊與已被回答的提問 |

## 檔案

- `admin-relay.full.html` — 完整 standalone 頁面，可直接用瀏覽器開啟或自行部署。
- `admin-relay.artifact.html` — 由上者剝去 `<html>/<head>/<body>` 外殼後的版本，供 Claude Artifact 發布使用。

兩份同步方式：

```sh
sed -e '/^<!doctype html>$/d' -e '/^<html lang="zh-Hant">$/d' -e '/^<\/html>$/d' \
    -e '/^<head>$/d' -e '/^<\/head>$/d' -e '/^<body>$/d' -e '/^<\/body>$/d' \
    -e '/^<meta charset="utf-8">$/d' -e '/^<meta name="viewport"/d' \
    admin-relay.full.html > admin-relay.artifact.html
```

## 執行方式

發布為 Claude Artifact 時宣告 `capabilities: {sample: {}}`，頁面即可直接呼叫 Claude，不需要 API key、不需要伺服器。

在沒有該能力的環境（例如直接用瀏覽器開啟 `admin-relay.full.html`）會自動退回「複製指令」模式：按鈕會把完整指令連同貼上的訊息複製到剪貼簿，貼進 Claude／Gemini／ChatGPT 也能得到同樣結果。

## 隱私

訊息只在瀏覽器與單次呼叫中處理，不寫入任何伺服器。輸入框草稿以 `localStorage` 留在本機。

---

## 兩個版本

| | `admin-relay.*`（內建 Claude） | `relay-public.*`（公開版） |
|---|---|---|
| 分享 | 只能逐一加人 —— 頁面會呼叫 Claude，Artifact 不允許公開連結 | 可設為 Anyone with the link |
| 對方需要 Claude 帳號 | 需要 | 不需要 |
| 流程 | 貼上 → 按一下，結果直接出現 | 貼上 → 複製指令 → 貼到任何 AI |
| 適用 | 自己日常使用 | 發給全處室、全校導師 |

公開版是一台指令產生器：把判斷原則（版本覆蓋、不編造、分流、白話簡化規則）連同貼上的訊息組成一份完整指令，複製後貼到 Claude／ChatGPT／Gemini 皆可，輸出七個純文字區塊。頁面本身不呼叫任何 AI，因此可以公開分享。

同步剝殼指令與前述相同，把檔名換成 `relay-public.full.html` 即可。
