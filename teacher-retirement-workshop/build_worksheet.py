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

  .fc{display:grid;grid-template-columns:37mm 1fr 33mm;gap:3mm;align-items:center;border-bottom:1px solid var(--rule);padding:1.7mm 0}
  .fc .lab{font-weight:700;font-size:9.5pt;line-height:1.3}
  .fc .lab small{display:block;font-weight:400;font-size:7.3pt;color:var(--muted);margin-top:.3mm}
  .fc .parts{font-size:8.6pt;color:var(--muted);line-height:1.9}
  .fc .parts u{display:inline-block;min-width:13mm;border-bottom:1px solid var(--muted);text-decoration:none;height:3.6mm;vertical-align:-1mm}
  .fc .tot{border:1.2px solid var(--rule);background:#fff;border-radius:1.2mm;height:9mm;display:flex;align-items:flex-end;justify-content:flex-end;padding:0 2mm 1mm;font-size:7.5pt;color:var(--muted);position:relative}
  .fc .tot i{position:absolute;left:2mm;top:.8mm;font-style:normal;font-weight:700;color:var(--ink);font-size:8pt}
  .fc.y .tot{background:#FAF1DC;border-color:#E3CF9E}
  .sechd{display:flex;align-items:baseline;gap:2mm;margin:2.5mm 0 .5mm}
  .sechd b{font-family:"DM Serif Display",serif;color:#C0703F;font-size:13pt}
  .sechd span{font-family:"Noto Serif TC",serif;font-weight:900;font-size:11.5pt}
  .sechd small{font-size:7.5pt;color:var(--muted);margin-left:1mm}
  .tiles{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm;margin-top:2mm}
  .tile{border:1.2px solid var(--rule);background:#fff;border-radius:1.5mm;padding:2mm 3mm;height:15mm;position:relative}
  .tile b{font-size:8.8pt}
  .tile small{display:block;font-size:7pt;color:var(--muted)}
  .tile em{position:absolute;right:3mm;bottom:1.5mm;font-style:normal;font-size:8pt;color:var(--muted)}
  .panel{border:1px solid var(--rule);background:#fff;border-radius:1.5mm;padding:2.5mm 4mm}
  .inrow{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm;margin-top:1.5mm}
  .inrow div{border:1px solid var(--rule);border-radius:1mm;padding:1.2mm 2mm;font-size:7.8pt;color:var(--muted);height:13mm;position:relative;background:var(--paper)}
  .inrow div b{display:block;color:var(--ink);font-size:8.3pt}
  .inrow div em{position:absolute;right:2mm;bottom:1mm;font-style:normal}
  .etf th,.etf td{font-size:8.6pt;padding:1.8mm 1.5mm}
  .etf td.n{font-family:"DM Serif Display",serif;font-size:11pt;color:var(--ink)}
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
    <div class="small" style="margin-top:1.5mm">灰色草稿表隨手記即可，只有紅框要工整。全份共 15 個紅框，每頁右上角標出本頁要填哪幾格。</div>
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


def fc(label, hint, parts, unit, total_code='', yearly=False):
    parts_html = '　'.join(f'{x} <u></u>' for x in parts)
    code = f'<i>{total_code}</i>' if total_code else ''
    return (f'<div class="fc{" y" if yearly else ""}"><div class="lab">{label}{YR if yearly else ""}<small>{hint}</small></div>'
            f'<div class="parts">{parts_html}</div><div class="tot">{code}{unit}</div></div>')


def sechd(n, title, sub):
    return f'<div class="sechd"><b>{n}</b><span>{title}</span><small>{sub}</small></div>'


p2 = f"""
<section class="page hasqr">
  {qrs(('budget', '03 收支體檢'))}
  <div class="top"><span class="mono">PART II · 現況</span><span class="need">{mini('C1', 'C2', 'C3', 'D')}</span></div>
  <h2>第二關｜我現在每個月花多少？</h2>
  <p class="lead first">欄位和工具一模一樣：左邊小格打草稿，右邊的合計照順序輸入工具。<br>標 {YR} 的填一整年總額，工具會自動分攤到每月。</p>

  {hands('03', 'grand-clafoutis-b1948b.netlify.app', '每月收支體檢')}
  {sechd('1', '你的收入', '平均每個月進帳多少')}
  {fc('每月固定收入', '本俸、月薪', ['薪資實領'], '元／月', 'ⓐ')}
  {fc('穩定的額外收入', '兼職、接案、鐘點', ['兼職', '接案', '鐘點'], '元／月', 'ⓑ')}
  {fc('獎金與配息', '填一整年總額', ['年終', '考績', '股息配息'], '元／年', 'ⓒ', True)}

  {sechd('2', '你的支出，分三層', '把「一次性」獨立出來')}
  {fc('固定月支出', '每月幾乎一樣，貸款也算這裡', ['房租房貸', '車貸', '孝親', '訂閱電信'], '元／月', 'ⓓ')}
  {fc('半固定月支出', '每月都有但會浮動', ['吃飯', '交通', '日用品', '小確幸'], '元／月', 'ⓔ')}
  {fc('一次性支出', '偶爾才花，填一整年', ['所得稅', '年繳保費', '旅遊紅包', '大採購'], '元／年', 'ⓕ', True)}

  {sechd('3', '你的收支體檢', 'ⓐ～ⓕ 輸入工具後，抄回紅框')}
  <div class="grid3" style="gap:0 3mm">
    {key('C1', '月均支出', '', '元', '', '', 'xs')}
    {key('C2', '月均收入', '', '元', '', '', 'xs')}
    {key('C3', '儲蓄率', '', '%', '', '', 'xs')}
  </div>
  <div class="small" style="margin-top:1mm">沒記帳？看薪資單、信用卡帳單、網銀明細，估不準就取整數。退休後月支出直接用 {ref('C1')} 粗估（房貸車貸可能沒了，醫療旅遊會增加，一來一往）；參考：所得替代法 {ref('C2')} × 0.7 ≈ ＿＿＿＿ 元。</div>

  <div class="dark" style="margin-top:2.5mm">
    <div class="mono">今天最重要的一個數字</div>
    <div class="key big" style="margin-top:2mm;border-color:var(--goldSoft)"><span class="b">D</span><span class="l" style="color:var(--ink)">退休後每月餘裕 ＝ {ref('B1')} − {ref('C1')}<small>大於 0：月退就夠生活，有餘裕　｜　小於 0：差額要靠自己準備</small></span><span class="v">元</span></div>
  </div>
  <div class="foot"><span>我的退休帳本 · 第二關</span><span class="num">03</span></div>
</section>
"""

# ═══════════ 第三關 資產盤點 ═══════════
p3 = f"""
<section class="page hasqr">
  {qrs(('assets', '04 資產總覽'))}
  <div class="top"><span class="mono">PART III · 盤點</span><span class="need">{mini('E1', 'E2')}</span></div>
  <h2>第三關｜我已經有多少本金？</h2>
  <p class="lead first">欄位和工具一模一樣：一格一個數字，照順序輸入。<br>寫「現在的市值／餘額」，不確定就取整數。</p>

  {hands('04', 'celadon-starship-b44b3c.netlify.app', '資產總覽')}
  <div class="grid2" style="gap:5mm">
    <div>
      {sechd('1', '你的資產', '能換成錢的東西')}
      {fc('現金與存款', '活存、定存', [], '元')}
      {fc('股票・ETF・基金', '證券帳戶投資市值', [], '元')}
      {fc('其他投資', '黃金、債券、儲蓄險', [], '元')}
      {fc('房屋現值', '現在市價，查實價登錄', [], '元')}
    </div>
    <div>
      {sechd('2', '你的負債', '還沒還完的錢')}
      {fc('房貸餘額', '未還本金，不是月付', [], '元')}
      {fc('一般貸款', '信貸、車貸、學貸', [], '元')}
      {fc('信用卡卡債', '循環利息、高利借款', [], '元')}
    </div>
  </div>

  {sechd('3', '你的資產總覽', '工具算出的結果')}
  {key('E1', '你的總淨值（資產 − 負債）', '', '元', '', 'big')}
  <div class="tiles">
    <div class="tile"><b>總資產</b><em>元</em></div>
    <div class="tile"><b>總負債</b><em>元</em></div>
    <div class="tile" style="border-color:var(--gold)"><b>不含房子的淨資產</b><small>第四關要用這個</small><em>元</em></div>
    <div class="tile"><b>房屋淨值</b><small>現值 − 房貸</small><em>元</em></div>
  </div>

  <div class="box" style="margin-top:2.5mm;padding:2.5mm 4mm;font-size:9pt">
    <b>淨值 ≠ 可以拿去理財的錢。</b>房子不會生出現金流；存款也要先留 6 個月生活費當緊急預備金。
  </div>
  {key('E2', '可投入理財的本金', f'＝ 不含房子的淨資產 − 緊急預備金（{ref("C1")} × 6 ＝ ＿＿＿＿＿ 元）　→ 第四關的「初始本金」', '元', '', 'tall')}
  <div class="small" style="margin-top:1.5mm">看一眼工具的資產結構：□ 現金放太多　□ 太集中在房子　□ 負債比偏高　□ 投資比例太低</div>
  <div class="foot"><span>我的退休帳本 · 第三關</span><span class="num">04</span></div>
</section>
"""

# ═══════════ 第四關 理財規劃 ═══════════
p4 = f"""
<section class="page hasqr">
  {qrs(('finance', '05 理財試算器'))}
  <div class="top"><span class="mono">PART IV · 理財規劃</span><span class="need">{mini('F1', 'F2', 'F3', 'G1', 'G2')}</span></div>
  <h2>第四關｜時間，是老師最強的本錢</h2>
  <p class="lead first">假設沒有退休金，把月退當備案，自己存出一份本金。<br>打開理財試算器「理財規劃」分頁。</p>

  {hands('05', 'toolfinance.netlify.app', '理財試算器 · 理財規劃')}
  {key('F1', f'目標本金 ＝ {ref("C1")} × 12 × 25', '4% 法則：每年提領本金的 4%，約可支應 30 年；保守者用 × 30', '元')}

  <div class="panel" style="margin-top:2mm">
    <div class="mono">① 照順序輸入工具（和工具欄位一模一樣）</div>
    <div class="inrow">
      <div><b>目前年齡</b>抄 A1<em>歲</em></div>
      <div><b>預計退休年齡</b>抄 B1<em>歲</em></div>
      <div><b>初始本金</b>抄 {ref('E2')}<em>元</em></div>
      <div><b>每月投入金額</b>先試 5,000<em>元</em></div>
      <div><b>年報酬率（實質）</b>建議 4～6<em>%</em></div>
    </div>
  </div>

  <div class="small" style="margin:2mm 0 1mm">② 草稿表：改每月投入，直到「退休時累積」接近 {ref('F1')}（每月投入不要超過每月能存下的錢 {ref('C2')} − {ref('C1')}）</div>
  {draft(['試算', '每月投入', '報酬率', '投入年數', '本金總投入', '複利貢獻', '退休時累積', '達標？'], [
      ['1', '', '', '', '', '', '', '□'], ['2', '', '', '', '', '', '', '□'], ['3', '', '', '', '', '', '', '□'],
  ])}

  <div class="small" style="margin-top:2mm">③ 圈一組付得起的版本，抄進紅框</div>
  <div class="keys2">
    {key('F2', '我決定的每月投入', '', '元', '', '', 's')}
    {key('F3', '退休時累積', '本金總投入 ＋ 複利貢獻', '元', '', '', 's')}
  </div>
  <div class="keys2">
    {key('G1', '複利貢獻', '工具結果：時間幫你賺的', '元', '', '', 's')}
    {key('G2', '晚 10 年開始少了', '工具「早開始 vs 晚 10 年」', '元', '', '', 's')}
  </div>

  <div class="box" style="margin-top:2mm;padding:2.5mm 4mm;font-size:8.8pt">
    <b>沒達標也沒關係：</b>三個槓桿任選，① 每月多投入一點　② 晚幾年退休　③ 讓月退 {ref('B1')} 補上（看第二關的 {ref('D')}）。
    <br><b>看圖說話：</b>本金總投入 vs 複利貢獻，哪個比較大？＿＿＿＿＿＿　晚 10 年開始，心裡的感覺是？＿＿＿＿＿＿
  </div>
  <div class="foot"><span>我的退休帳本 · 第四關　｜　本頁內容為觀念與工具練習，非投資建議</span><span class="num">05</span></div>
</section>
"""

# ═══════════ 第四關（延伸）大盤 ETF 比較 ═══════════
import math

def curve(rate, years=20, x0=14, y0=150, w=246, h=128, ymax=180):
    pts = []
    for y in range(years + 1):
        v = 10 * (1 + rate) ** y  # 10 萬起
        pts.append(f'{x0 + w * y / years:.1f},{y0 - h * v / ymax:.1f}')
    return ' '.join(pts)

series = [('VOO', 0.151, '#B4432E'), ('0050', 0.126, '#0F3B30'), ('QQQ', 0.109, '#B0833A'), ('試算用 5%', 0.05, '#9A968A')]
lines = ''
for name, r, col in series:
    end = 10 * (1 + r) ** 20
    dash = ' stroke-dasharray="3 3"' if '試算' in name else ''
    lines += f'<polyline points="{curve(r)}" fill="none" stroke="{col}" stroke-width="2"{dash}/>'
    lines += f'<text x="263" y="{150 - 128 * end / 180 + 3:.1f}" font-size="7.5" fill="{col}" font-weight="700">{name} {end:.0f} 萬</text>'
grid = ''
for v in (0, 50, 100, 150):
    y = 150 - 128 * v / 180
    grid += f'<line x1="14" x2="260" y1="{y:.1f}" y2="{y:.1f}" stroke="#E4DBCB" stroke-width="0.6"/><text x="11" y="{y + 2.5:.1f}" font-size="6.5" fill="#6B685C" text-anchor="end">{v}</text>'
for yr in (0, 5, 10, 15, 20):
    x = 14 + 246 * yr / 20
    grid += f'<text x="{x:.1f}" y="160" font-size="6.5" fill="#6B685C" text-anchor="middle">{yr} 年</text>'
chart = f'<svg viewBox="0 0 320 165" style="width:100%;height:auto;display:block" role="img" aria-label="10 萬元依長期年化報酬推算 20 年">{grid}{lines}<text x="14" y="10" font-size="7" fill="#6B685C">萬元</text></svg>'

p5 = f"""
<section class="page">
  <div class="top"><span class="mono">PART IV · 買大盤</span><span class="need">延伸閱讀 · 不需填紅框</span></div>
  <h2>第四關｜台股、美股大盤 ETF 長期怎麼走？</h2>
  <p class="lead">不選股，買下整個市場。以下是三檔常見大盤 ETF 的長期表現（含息、原幣計），講者分享觀念，非投資建議。</p>

  <table class="etf" style="margin-top:3mm">
    <tr><th>ETF</th><th>追蹤</th><th>成立</th><th>成立以來年化（含息）</th><th>最慘的一段</th><th>72 法則：約幾年翻倍</th></tr>
    <tr><td><b>0050</b></td><td>台灣市值前 50 大</td><td>2003</td><td class="n">約 12.6%</td><td>2008 金融海嘯約 −43%</td><td>72 ÷ 12.6 ≈ ＿＿ 年</td></tr>
    <tr><td><b>VOO</b></td><td>美國 S&amp;P 500</td><td>2010</td><td class="n">約 15%</td><td>2022 約 −18%（2008 標普 −37%）</td><td>72 ÷ 15 ≈ ＿＿ 年</td></tr>
    <tr><td><b>QQQ</b></td><td>美國那斯達克 100</td><td>1999</td><td class="n">約 10.9%</td><td>2000–2002 網路泡沫約 −83%</td><td>72 ÷ 10.9 ≈ ＿＿ 年</td></tr>
  </table>
  <div class="small" style="margin-top:1mm">資料：0050 為元大投信公布成立以來含息累積報酬 1,349%（至 2025/12/31）換算；VOO、QQQ 為公開資料整理（美元計，未含匯率）。上課前請以最新公告更新。</div>

  <div class="grid2" style="margin-top:3mm;gap:5mm;align-items:start">
    <div class="panel">
      <div class="mono">10 萬元，按各自長期年化報酬推算 20 年</div>
      {chart}
      <div class="small">這是用平均報酬畫出的平滑線，真實走勢會大起大落。</div>
    </div>
    <div>
      <div class="panel">
        <div class="mono">想一想</div>
        <div class="note" style="margin-top:1.5mm">① 過去平均 12～15%，為什麼試算只用 <b>4～6%</b>？</div>
        <div style="border-bottom:1px solid var(--rule);height:7mm"></div>
        <div class="note" style="margin-top:2mm">② QQQ 若在 2000 年高點買進，要等十多年才回本。這告訴我們什麼？</div>
        <div style="border-bottom:1px solid var(--rule);height:7mm"></div>
        <div class="note" style="margin-top:2mm">③ 我比較適合：□ 台股大盤　□ 美股大盤　□ 兩者搭配</div>
      </div>
      <div class="panel" style="margin-top:2.5mm;font-size:8.8pt">
        <div class="mono">買大盤三個理由</div>
        <div class="step"><b>1</b>不用選股：指數自動汰弱留強</div>
        <div class="step"><b>2</b>費用率低：省下的都是自己的</div>
        <div class="step"><b>3</b>夠分散：一次買下一籃子大公司</div>
      </div>
    </div>
  </div>

  <div class="dark" style="margin-top:3mm">
    <div class="mono">我的定期定額計畫 · 離開前三個行動承諾</div>
    <div class="grid3" style="margin-top:2mm;font-size:9.5pt">
      <div>今晚：<br>□ 把這份學習單拍照存檔<br>□ 確認緊急預備金 ＿＿ 個月</div>
      <div>這個月：<br>□ 開證券戶／設定扣款<br>每月 {ref('F2')} ＿＿＿＿ 元，每月 ＿＿ 日</div>
      <div>今年：<br>□ 查一次自己的年資與專戶<br>□ 年底檢視一次，不停扣</div>
    </div>
    <div style="margin-top:2.5mm;font-size:9pt;color:var(--goldSoft)">簽名 ＿＿＿＿＿＿　日期 ＿＿＿＿＿＿　→ 很早開始、很久不停。明年今天，再打開一次。</div>
  </div>
  <div class="foot"><span>我的退休帳本 · 第四關（延伸）　｜　過去績效不代表未來，本頁非投資建議</span><span class="num">06</span></div>
</section>
"""

html = head + '<body>\n' + cover + p1 + p2 + p3 + p4 + p5 + '\n</body>\n</html>\n'
(HERE / 'worksheet.html').write_text(html, encoding='utf-8')
print('worksheet.html written')
