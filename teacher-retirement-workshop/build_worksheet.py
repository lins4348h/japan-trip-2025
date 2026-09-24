"""產生學習單 worksheet.html（QR Code 以 data URI 內嵌）。

用法：python3 build_worksheet.py
QR 圖檔來源：../open-slide-workspace/slides/teacher-retirement-cashflow/assets/qr-*.svg
"""
import base64
import pathlib

HERE = pathlib.Path(__file__).parent
QR_DIR = HERE.parent / 'open-slide-workspace/slides/teacher-retirement-cashflow/assets'


def qr(key):
    data = (QR_DIR / f'qr-{key}.svg').read_bytes()
    return 'data:image/svg+xml;base64,' + base64.b64encode(data).decode()


TOOLS = [
    ('salary', '01', '薪資試算', 'teacher-salary-calculator.netlify.app', '→ A 年薪'),
    ('pension', '02', '退休金試算', 'pension-calculation.netlify.app', '→ B 月退'),
    ('budget', '03', '每月收支體檢', 'grand-clafoutis-b1948b.netlify.app', '→ C 收支・儲蓄率'),
    ('assets', '04', '資產總覽', 'celadon-starship-b44b3c.netlify.app', '→ E 目前本金'),
    ('finance', '05', '理財試算器', 'toolfinance.netlify.app', '→ F 目標・G 複利'),
]


def ref(c):
    return f'<i class="ref">{c}</i>'


def mini(*codes):
    return '本頁要填 ' + ''.join(f'<i class="mini">{c}</i>' for c in codes)


def key(code, label, hint='', unit='元', cap='', cls='', vcls=''):
    hint_html = f'<small>{hint}</small>' if hint else ''
    cap_html = f'<em>{cap}</em>' if cap else ''
    return (f'<div class="key {cls}"><span class="b">{code}</span>'
            f'<span class="l">{label}{hint_html}</span>'
            f'<span class="v {vcls}">{cap_html}{unit}</span></div>')


def qrs(*items):
    figs = ''.join(f'<figure><img src="{qr(k)}" alt="">{label}</figure>' for k, label in items)
    return f'<div class="qrs">{figs}</div>'


def hands(no, url, title):
    return f'<h3><span class="tag">HANDS-ON {no}</span><span class="url">{url}</span>　{title}</h3>'


def draft(head, rows, cls='tight draft', style=''):
    th = ''.join(f'<th>{h}</th>' for h in head)
    trs = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table class="{cls}" style="{style}"><tr>{th}</tr>{trs}</table>'


EXTRA_CSS = """
  .key .v{position:relative}
  .key .v em{position:absolute;top:1mm;left:2.5mm;font-style:normal;font-size:7pt;color:var(--muted)}
  .key .l .sub{display:block;font-weight:400;font-size:9pt;margin-top:1mm;letter-spacing:.02em}
  .key.tall{min-height:15mm}
  .key .v.xs{width:21mm}
  .note{font-size:8.5pt;color:var(--ink);margin:1mm 0}
  .note b{color:var(--red)}
  .variant{font-size:7.5pt;color:var(--muted);margin:2.5mm 0 0}
  .or{text-align:center;font-size:8pt;color:var(--muted);margin:.5mm 0}
  .flow{display:flex;gap:2mm;align-items:stretch;margin:1.5mm 0}
  .flow > div{flex:1;border:1px solid var(--rule);background:#fff;padding:2mm 3mm;font-size:8.5pt}
  .flow > div b{display:block;font-family:"Noto Serif TC",serif;font-size:10pt;margin-bottom:.5mm}
  .flow .arrow{flex:none;border:none;background:none;align-self:center;padding:0;color:var(--gold);font-size:12pt}
  .yr{display:inline-block;font-size:7pt;color:#8A6A1F;background:#F6ECD2;border:1px solid #E3CF9E;border-radius:1mm;padding:0 1.2mm;margin-left:1mm;vertical-align:1px}
  .grp td{background:var(--tint);font-weight:700;color:var(--ink)!important;font-size:8.5pt}
  .sumrow td{font-weight:700;color:var(--ink)!important;border-top:1.5px solid var(--ink)}
"""

head = (HERE / '_worksheet_head.html').read_text(encoding='utf-8').replace('</style>', EXTRA_CSS + '</style>')

# ═══════════ 封面 ═══════════
cover_rows = ''.join(
    f'<tr><td style="border-color:rgba(216,193,151,.3);width:17mm;padding:1.2mm 0"><img class="cqr" src="{qr(k)}" alt=""></td>'
    f'<td class="code" style="color:var(--goldSoft);border-color:rgba(216,193,151,.3)">{n}</td>'
    f'<td style="border-color:rgba(216,193,151,.3)">{name}</td>'
    f'<td style="border-color:rgba(216,193,151,.3);font-family:\'IBM Plex Mono\';font-size:8.5pt">{url}</td>'
    f'<td style="border-color:rgba(216,193,151,.3)">{out}</td></tr>'
    for k, n, name, url, out in TOOLS)

cover = f"""
<section class="page" style="background:var(--green);color:var(--tint)">
  <div class="top" style="border-color:rgba(216,193,151,.35)"><span class="mono" style="color:var(--goldSoft)">THE TEACHER'S RETIREMENT LEDGER</span><span class="sec" style="color:var(--goldSoft)">學習單 · 3 小時工作坊</span></div>
  <div class="mono" style="color:var(--goldSoft);margin-top:8mm">WORKSHEET · A → G</div>
  <h1 style="font-size:40pt;line-height:1.2;margin-top:5mm">我的<span style="color:var(--goldSoft)">退休帳本</span></h1>
  <p style="font-size:12pt;opacity:.8;margin-top:4mm">退休不是一個日期，是一條現金流。<br>今天把字母換成你自己的數字，這份只屬於你，不必給任何人看。</p>

  <div style="background:var(--tint);color:var(--ink);padding:5mm 7mm;margin-top:7mm">
    <div class="mono">QUESTION 00 · 開場先寫，結束再看</div>
    <div class="grid2" style="margin-top:3mm">
      <div><div class="small">憑感覺：退休後每月需要</div><div style="font-size:15pt;margin-top:2mm"><span class="blank" style="min-width:45mm"></span> 元</div></div>
      <div><div class="small">有根據：第二關算出的 {ref('C1')} 月均支出</div><div style="font-size:15pt;margin-top:2mm"><span class="blank" style="min-width:45mm"></span> 元</div></div>
    </div>
  </div>

  <div style="background:var(--tint);color:var(--ink);padding:4mm 6mm;margin-top:5mm">
    <div class="mono">怎麼用這份學習單</div>
    <div style="display:flex;gap:5mm;align-items:center;margin-top:2mm;font-size:9.5pt">
      <div class="key" style="margin:0;width:62mm;min-height:9mm"><span class="b" style="width:10mm;font-size:12pt">A1</span><span class="l" style="font-size:8.5pt">紅框 ＝ 要寫數字的地方</span></div>
      <div>{ref('A1')} 空心小框 ＝ 引用前面寫過的數字</div>
    </div>
    <div class="small" style="margin-top:1.5mm">灰色草稿表隨手記即可，只有紅框要工整。全份共 16 個紅框，每頁右上角標出本頁要填哪幾格。</div>
  </div>

  <h3 style="color:var(--goldSoft);margin-top:6mm">五個工具 · 手機掃描並加入書籤（依使用順序）</h3>
  <table style="color:var(--tint)">{cover_rows}</table>

  <div class="eq" style="color:var(--tint);border-color:var(--goldSoft);margin-top:6mm">
    目標本金 <span class="num" style="color:var(--goldSoft)">F1</span> ＝ 現在月支出 <span class="num" style="color:var(--goldSoft)">C1</span> × 12 × 25　｜　月退 <span class="num" style="color:var(--goldSoft)">B1</span> 是備案
  </div>
  <div class="small" style="color:rgba(242,236,225,.6);margin-top:3mm">三個約定：① 數字只寫在自己的學習單　② 估算比精算重要，不確定就填保守值　③ 本課程為觀念與工具分享，非投資建議</div>
  <div class="foot" style="color:rgba(242,236,225,.55)"><span>姓名／代號 ＿＿＿＿＿＿　日期 ＿＿＿＿＿＿</span><span class="num">01</span></div>
</section>
"""

# ═══════════ 第一關 制度 ═══════════
p1 = f"""
<section class="page hasqr">
  {qrs(('salary', '01 薪資試算'), ('pension', '02 退休金試算'))}
  <div class="top"><span class="mono">PART I · 制度</span><span class="need">{mini('A1', 'A2', 'A3', 'B1')}</span></div>
  <h2>第一關｜制度會給我多少？</h2>
  <p class="lead first">舊制月退上限 ＝ 本俸 × 2 × 所得替代率<br>手機掃右上 QR Code 開啟工具</p>

  {hands('01', 'teacher-salary-calculator.netlify.app', '薪資試算')}
  <div class="note">新制教師：自願提繳一律先設 <b>0%</b></div>
  {key('A1', '現在的我', '<span class="sub">薪級 ＿＿＿＿　每月實領 ＿＿＿＿＿＿ 元　今年 ＿＿ 歲</span>', '元', '目前年薪', 'tall', '')}
  {key('A2', '年功薪到頂的我', '<span class="sub">薪級 ＿＿＿＿　每月實領 ＿＿＿＿＿＿ 元　那時 ＿＿ 歲</span><small>年功薪上限：學士 625／碩士 650（以工具最新俸額為準）</small>', '元', '到頂時年薪', 'tall')}
  {key('A3', '年薪成長空間', f'＝ {ref("A2")} − {ref("A1")}', '元', '成長空間')}

  {hands('02', 'pension-calculation.netlify.app', '退休金試算')}
  <div class="note">① 月退起支年齡逐年提高，<b>121 年過渡期後為 58 歲</b>（提前退休 1 年少 4%，最多提早 5 年、少 20%）</div>
  <div class="note">② 依照試算器上的數字填入；<b>舊制、新制擇一填寫</b></div>

  <div class="variant">舊制（112/6/30 以前任職）</div>
  {key('B1', '預估月退（退撫＋公保）', '<span class="sub">我預計 ＿＿ 歲退休　　公保一次給付（退休時一次領）＿＿＿＿＿＿ 元</span><small>退撫月退上限 ＝ 本俸 × 2 × 所得替代率（現行 35 年為 69%）</small>', '元／月', '每月可領', 'tall')}
  <div class="or">— 或 —</div>
  <div class="variant" style="margin-top:0">新制（112/7/1 以後初任）</div>
  {key('B1', '預估月退（專戶＋公保年金）', '<span class="sub">我預計 ＿＿ 歲退休　　個人專戶（預設領 30 年）＿＿＿＿ 元／月 ＋ 公保年金 ＿＿＿＿ 元／月</span><small>自願提繳預設 0%，實質年報酬率預設 3%</small>', '元／月', '每月可領', 'tall')}

  <div class="box" style="margin-top:4mm;padding:3mm 5mm;font-size:9pt">
    <b>想一想：</b>B1 是「制度保證給你的」，但它是備案，不是全部。第四關我們會假設<b>沒有退休金</b>，自己準備一份目標本金。
  </div>
  <div class="foot"><span>我的退休帳本 · 第一關</span><span class="num">02</span></div>
</section>
"""

# ═══════════ 第二關 現在花多少 ═══════════
YR = '<span class="yr">整年</span>'


def rows_html(rows):
    out = ''
    for r in rows:
        if r[0] == 'grp':
            out += f'<tr class="grp"><td colspan="2">{r[1]}</td></tr>'
        elif r[0] == 'sum':
            out += f'<tr class="sumrow"><td>{r[1]}</td><td></td></tr>'
        else:
            out += f'<tr><td>{r[0]}</td><td></td></tr>'
    return out


income = rows_html([
    ('grp', 'ⓐ 每月固定收入　<span style="font-weight:400;color:var(--muted)">本俸、月薪，每月穩定入帳</span>'),
    ('薪資實領（看薪資單）',), ('sum', 'ⓐ 合計 ＿＿＿＿ 元／月'),
    ('grp', 'ⓑ 穩定的額外收入　<span style="font-weight:400;color:var(--muted)">兼職、接案、鐘點，抓月平均</span>'),
    ('兼職、接案、鐘點費',), ('sum', 'ⓑ 合計 ＿＿＿＿ 元／月'),
    ('grp', f'ⓒ 獎金與配息 {YR}　<span style="font-weight:400;color:var(--muted)">填一整年總額</span>'),
    ('年終、考績獎金',), ('股息、配息',), ('sum', 'ⓒ 合計 ＿＿＿＿ 元／年'),
])
expense = rows_html([
    ('grp', 'ⓓ 固定月支出　<span style="font-weight:400;color:var(--muted)">每月幾乎一樣</span>'),
    ('房租房貸、車貸',), ('孝親費',), ('訂閱、電信、月繳保費',), ('sum', 'ⓓ 合計 ＿＿＿＿ 元／月'),
    ('grp', 'ⓔ 半固定月支出　<span style="font-weight:400;color:var(--muted)">每月都有但會浮動</span>'),
    ('吃飯、交通',), ('日用品、小確幸',), ('sum', 'ⓔ 合計 ＿＿＿＿ 元／月'),
    ('grp', f'ⓕ 一次性支出 {YR}　<span style="font-weight:400;color:var(--muted)">偶爾才花，填整年</span>'),
    ('所得稅、年繳保費',), ('旅遊、紅包、大額採購',), ('sum', 'ⓕ 合計 ＿＿＿＿ 元／年'),
])

p2 = f"""
<section class="page hasqr">
  {qrs(('budget', '03 收支體檢'))}
  <div class="top"><span class="mono">PART II · 現況</span><span class="need">{mini('C1', 'C2', 'C3', 'D')}</span></div>
  <h2>第二關｜我現在每個月花多少？</h2>
  <p class="lead first">不猜退休後，先把「現在」算清楚。<br>跟著三步走：紙上算 → 輸入工具 → 抄回紅框。</p>

  {hands('03', 'grand-clafoutis-b1948b.netlify.app', '每月收支體檢')}
  <div class="small">① 紙上草稿：順序和工具一模一樣。沒記帳？看薪資單、信用卡帳單、網銀明細，估不準就取整數。標 {YR} 的填一整年總額，工具會自動分攤到每月。</div>
  <div class="grid2" style="margin-top:1mm;align-items:start">
    <div>
      <div class="mono" style="margin:0 0 .5mm">1 · 你的收入</div>
      <table class="tight draft"><tr><th>項目</th><th style="width:26mm">金額</th></tr>{income}</table>
    </div>
    <div>
      <div class="mono" style="margin:0 0 .5mm">2 · 你的支出，分三層</div>
      <table class="tight draft"><tr><th>項目</th><th style="width:26mm">金額</th></tr>{expense}</table>
    </div>
  </div>

  <div class="small" style="margin-top:2mm">② 把 ⓐ～ⓕ 六個合計依序輸入工具，看第 3 區「你的收支體檢」</div>
  <div class="small" style="margin-top:1mm">③ 把工具算出的結果抄進紅框</div>
  <div class="grid3" style="gap:0 3mm">
    {key('C1', '月均支出', '', '元', '', '', 'xs')}
    {key('C2', '月均收入', '', '元', '', '', 'xs')}
    {key('C3', '儲蓄率', '', '%', '', '', 'xs')}
  </div>

  <div class="box" style="margin-top:2mm;padding:2.5mm 4mm;font-size:8.8pt">
    <b>退休後要花多少？用現在的 {ref('C1')} 粗估：</b>房貸、車貸、子女教育可能沒了，但醫療、旅遊會增加，一來一往。
    （參考：所得替代法 ＝ 月收入 × 70–80%，{ref('C2')} × 0.7 ≈ ＿＿＿＿ 元）
  </div>

  <div class="dark" style="margin-top:2.5mm">
    <div class="mono">④ 今天最重要的一個數字</div>
    <div class="key big" style="margin-top:2mm;border-color:var(--goldSoft)"><span class="b">D</span><span class="l" style="color:var(--ink)">退休後每月餘裕 ＝ {ref('B1')} − {ref('C1')}<small>大於 0：月退就夠生活，有餘裕　｜　小於 0：差額要靠自己準備</small></span><span class="v">元</span></div>
  </div>
  <div class="foot"><span>我的退休帳本 · 第二關</span><span class="num">03</span></div>
</section>
"""

# ═══════════ 第三關 資產盤點 ═══════════
assets_rows = rows_html([
    ('grp', '1 · 你的資產　<span style="font-weight:400;color:var(--muted)">能換成錢的東西</span>'),
    ('現金與存款（活存、定存）　✓',), ('股票・ETF・基金（投資市值）　✓',),
    ('其他投資（黃金、債券、儲蓄險解約金）　✓',), ('房屋現值（現在市價，查實價登錄）',),
    ('sum', '資產合計 ＿＿＿＿＿ 元'),
])
debt_rows = rows_html([
    ('grp', '2 · 你的負債　<span style="font-weight:400;color:var(--muted)">還沒還完的錢</span>'),
    ('房貸餘額（未還本金，不是月付）',), ('一般貸款（信貸、車貸、學貸）',), ('信用卡卡債／高利借款',),
    ('sum', '負債合計 ＿＿＿＿＿ 元'),
])
p3 = f"""
<section class="page hasqr">
  {qrs(('assets', '04 資產總覽'))}
  <div class="top"><span class="mono">PART III · 盤點</span><span class="need">{mini('E1', 'E2')}</span></div>
  <h2>第三關｜我已經有多少本金？</h2>
  <p class="lead first">理財之前，先知道自己站在哪裡。<br>跟著三步走：紙上列 → 輸入工具 → 抄回紅框。</p>

  {hands('04', 'celadon-starship-b44b3c.netlify.app', '資產總覽')}
  <div class="small">① 紙上草稿：順序和工具一模一樣。寫「現在的市值／餘額」，不確定就取整數。</div>
  <div class="grid2" style="margin-top:1mm;align-items:start">
    <table class="tight draft"><tr><th>資產</th><th style="width:26mm">金額</th></tr>{assets_rows}</table>
    <table class="tight draft"><tr><th>負債</th><th style="width:26mm">金額</th></tr>{debt_rows}</table>
  </div>

  <div class="small" style="margin-top:2.5mm">② 把 7 個數字依序輸入工具，看第 3 區「你的資產總覽」：淨值與資產結構</div>
  <div class="small" style="margin-top:1mm">③ 把結果抄進紅框</div>
  {key('E1', '淨值', '＝ 資產合計 − 負債合計（工具結果）', '元')}

  <div class="box" style="margin-top:2mm;padding:3mm 5mm;font-size:9pt">
    <b>淨值 ≠ 可以拿去理財的錢。</b>房子不會生出現金流；存款要先留 6 個月生活費當<b>緊急預備金</b>；卡債、高利借款要先還清。
    <table class="tight" style="margin-top:1.5mm;font-size:9pt">
      <tr><td>打 ✓ 的三項資產合計（現金＋股票 ETF 基金＋其他投資）</td><td style="width:34mm;text-align:right">＿＿＿＿＿ 元</td></tr>
      <tr><td>− 緊急預備金 ＝ {ref('C1')} × 6</td><td style="text-align:right">＿＿＿＿＿ 元</td></tr>
      <tr><td>− 信用卡卡債／高利借款</td><td style="text-align:right">＿＿＿＿＿ 元</td></tr>
    </table>
  </div>
  {key('E2', '目前可投入理財的本金', '＝ 上面三行計算結果（這是第四關的起點）', '元', '', 'tall')}

  <div class="box" style="margin-top:2.5mm;padding:3mm 5mm">
    <div class="mono">看一眼工具的資產結構</div>
    <div style="font-size:9pt;margin-top:1.5mm">我的觀察：□ 現金放太多　□ 太集中在房子　□ 負債比例偏高　□ 投資比例太低　□ 其他＿＿＿＿＿＿</div>
  </div>
  <div class="foot"><span>我的退休帳本 · 第三關</span><span class="num">04</span></div>
</section>
"""

# ═══════════ 第四關（上）目標本金 ═══════════
p4 = f"""
<section class="page hasqr">
  {qrs(('finance', '05 理財試算器'))}
  <div class="top"><span class="mono">PART IV · 理財（上）</span><span class="need">{mini('F1', 'F2', 'F3')}</span></div>
  <h2>第四關｜假設沒有退休金，我要存多少？</h2>
  <p class="lead first">把月退當成備案，靠自己存出一份退休本金。<br>通膨已從報酬率扣掉：實質報酬用 4%。</p>

  {hands('05', 'toolfinance.netlify.app', '理財試算器')}
  {key('F1', f'目標本金 ＝ {ref("C1")} × 12 × 25', '4% 法則：每年提領本金的 4%，約可支應 30 年；保守者用 × 30', '元')}
  {key('F2', f'還差多少 ＝ {ref("F1")} − {ref("E2")}', '', '元')}

  <div class="small" style="margin-top:2mm">① 草稿表：試算每月要投入多少（距離退休 ＿＿ 年 ＝ 預計退休年齡 − 今年年齡）</div>
  {draft(['情境', '報酬率', '投入年數', '每月需投入', '付得起？'], [
      ['主算（實質）', '4%', '', '', '□'], ['樂觀', '6%', '', '', '□'], ['延後退休 3 年', '4%', '', '', '□'],
  ])}
  <div class="box" style="margin-top:1.5mm;padding:2mm 4mm">
    <div class="mono">參考 · 速查表　試算器沒有反推功能時：每月需投入 ≈ {ref('F2')} ÷ 100 萬 × 表中數字</div>
    <table style="font-size:8.6pt;margin-top:.5mm" class="tight">
      <tr><th>每存到 100 萬</th><th>10 年</th><th>15 年</th><th>20 年</th><th>25 年</th><th>30 年</th></tr>
      <tr><td>報酬 4%</td><td class="num">6,791</td><td class="num">4,064</td><td class="num">2,726</td><td class="num">1,945</td><td class="num">1,441</td></tr>
      <tr><td>報酬 6%</td><td class="num">6,102</td><td class="num">3,439</td><td class="num">2,164</td><td class="num">1,443</td><td class="num">996</td></tr>
    </table>
    <div class="small">已有的本金 {ref('E2')} 也會一起成長，所以實際需要的金額會比速查表少一些。</div>
  </div>
  <div class="small" style="margin-top:2mm">② 圈一個付得起的版本，抄進紅框</div>
  {key('F3', '我決定的每月投入金額', f'對照第二關：月均收入 {ref("C2")} − 月均支出 {ref("C1")} ＝ 每月能存下的錢，F3 不要超過它', '元', '', 'tall')}

  <div class="box" style="margin-top:3mm;padding:3mm 5mm;font-size:9pt">
    <b>如果有月退呢？</b>第二關的 {ref('D')} 大於 0，代表月退就能支應生活，自己存的本金就是「多出來的自由」；
    D 小於 0，F3 就是補上缺口的關鍵。
  </div>
  <div class="foot"><span>我的退休帳本 · 第四關（上）　｜　本頁內容為觀念與工具練習，非投資建議</span><span class="num">05</span></div>
</section>
"""

# ═══════════ 第四關（下）定期定額 × 複利 ═══════════
p5 = f"""
<section class="page hasqr">
  {qrs(('finance', '05 理財試算器'))}
  <div class="top"><span class="mono">PART IV · 理財（下）</span><span class="need">{mini('G1', 'G2', 'G3')}</span></div>
  <h2>第四關｜定期定額 × 買大盤 × 看見複利</h2>
  <p class="lead first">講者分享的是觀念與自己的做法，非投資建議；標的請自行研究。</p>

  <div class="grid2" style="margin-top:3mm;align-items:start">
    <div>
      <div class="mono">練習 · 定期定額心算（每月投入 3,000 元）</div>
      {draft(['月份', '價格', '買到單位 ＝ 3,000 ÷ 價格'], [['1 月', '100', ''], ['2 月', '80', ''], ['3 月', '60', ''], ['4 月', '100', '']], style='font-size:9.5pt;margin-top:1mm')}
      <p style="margin:1.5mm 0 0;font-size:9pt">共＿＿單位 × 100 ＝ ＿＿＿＿ 元（投入 12,000）<br>價格回到原點，我 □ 賺 □ 賠 □ 打平</p>
    </div>
    <div class="box">
      <div class="mono">參考 · 買大盤三個理由</div>
      <div class="step"><b>1</b>不用選股：指數自動汰弱留強</div>
      <div class="step"><b>2</b>費用率低：省下的都是自己的</div>
      <div class="step"><b>3</b>夠分散：一次買下一籃子大公司</div>
      <div class="small" style="margin-top:1.5mm">72 法則：72 ÷ 報酬率 ≈ 翻倍年數<br>6% → ＿＿ 年翻倍；4% → ＿＿ 年翻倍</div>
    </div>
  </div>

  {hands('06', 'toolfinance.netlify.app', '看見複利的力量')}
  {key('G1', '我的每月定期定額', f'先用 {ref("F3")}；也可以把已有本金 {ref("E2")} 當作起始金額輸入', '元')}
  <div class="small" style="margin:2mm 0 1mm">① 草稿表：用試算器「定期定額」、報酬 6% 算終值（這裡是未來的錢，不必跟 F1 比）</div>
  {draft(['投入年數', '累積本金 ＝ G1 × 12 × 年數', '終值（報酬 6%）'], [['10 年', '', ''], ['20 年', '', ''], ['25 年（＝晚 5 年開始）', '', ''], ['30 年', '', '']])}
  <div class="small" style="margin:2mm 0 0">② 算出兩個答案，抄進紅框</div>
  <div class="keys2">
    {key('G2', '30 年終值是本金幾倍', '30 年終值 ÷ 30 年本金', '倍', '', '', 's')}
    {key('G3', '晚 5 年少了多少', '30 年終值 − 25 年終值', '元', '', '', 's')}
  </div>

  <div class="dark" style="margin-top:3mm">
    <div class="mono">我的定期定額計畫 · 離開前三個行動承諾</div>
    <div class="grid3" style="margin-top:2mm;font-size:9.5pt">
      <div>今晚：<br>□ 把這份學習單拍照存檔<br>□ 確認緊急預備金 ＿＿ 個月</div>
      <div>這個月：<br>□ 開證券戶／設定扣款<br>每月 ＿＿＿＿ 元，每月 ＿＿ 日</div>
      <div>今年：<br>□ 查一次自己的年資與專戶<br>□ 年底檢視一次，不停扣</div>
    </div>
    <div style="margin-top:2.5mm;font-size:9pt;color:var(--goldSoft)">簽名 ＿＿＿＿＿＿　日期 ＿＿＿＿＿＿　→ 很早開始、很久不停。明年今天，再打開一次。</div>
  </div>
  <div class="foot"><span>我的退休帳本 · 第四關（下）　｜　本頁內容為觀念與工具練習，非投資建議</span><span class="num">06</span></div>
</section>
"""

html = head + '<body>\n' + cover + p1 + p2 + p3 + p4 + p5 + '\n</body>\n</html>\n'
(HERE / 'worksheet.html').write_text(html, encoding='utf-8')
print('worksheet.html written')
