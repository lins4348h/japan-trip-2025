"""產生學習單 worksheet.html（QR Code 以 data URI 內嵌）。

用法：python3 build_worksheet.py            → worksheet.html（空白版）
      python3 build_worksheet.py --example  → worksheet_example.html（示範用範例版，藍色手寫字填好）
QR 圖檔來源：../open-slide-workspace/slides/teacher-retirement-cashflow/assets/qr-*.svg
"""
import base64
import pathlib
import sys

EXAMPLE = '--example' in sys.argv

# 範例版的紅框數字：32 歲舊制老師，數字與簡報範例一致（月支出 4 萬、淨值 470 萬、每月投入 2 萬）
EXV = {
    'A1': '930,000', 'A2': '1,300,000', 'A3': '370,000', 'B1': '73,244',
    'C1': '40,000', 'C2': '74,000', 'C3': '45.9', 'D': '33,244',
    'E1': '4,700,000', 'F1': '12,000,000', 'F2': '20,000', 'F3': '14,608,000',
    'G1': '7,888,000', 'G2': '7,624,000',
}


def w(val, blank='＿＿＿＿'):
    """空白處：範例版填入手寫字。"""
    return f'<b class="ink">{val}</b>' if EXAMPLE else blank


def hv(val):
    """紅框、小格裡的數字（空白版不顯示）。"""
    return f'<b class="ink">{val}</b> ' if EXAMPLE and val else ''


def ck(on=False):
    return '<b class="ink">☑</b>' if EXAMPLE and on else '□'

HERE = pathlib.Path(__file__).parent
QR_DIR = HERE.parent / 'open-slide-workspace/slides/teacher-retirement-cashflow/assets'


def qr(key):
    data = (QR_DIR / f'qr-{key}.svg').read_bytes()
    return 'data:image/svg+xml;base64,' + base64.b64encode(data).decode()


TOOLS = [
    ('salary', '01', '薪資試算', 'teacher-salary-calculator.netlify.app', '→ A 年薪'),
    ('pension', '02', '退休金試算', 'pension-calculation.netlify.app', '→ B 月退'),
    ('budget', '03', '每月收支體檢', 'grand-clafoutis-b1948b.netlify.app', '→ C 收支・儲蓄率'),
    ('assets', '04', '資產總覽', 'celadon-starship-b44b3c.netlify.app', '→ E 淨值・負債比'),
    ('finance', '05', '理財試算器', 'toolfinance.netlify.app', '→ F 目標・G 複利'),
]


def ref(c):
    return f'<i class="ref">{c}</i>'


def mini(*codes):
    return '本頁要填 ' + ''.join(f'<i class="mini">{c}</i>' for c in codes)


def key(code, label, hint='', unit='元', cap='', cls='', vcls='', val=None):
    hint_html = f'<small>{hint}</small>' if hint else ''
    cap_html = f'<em>{cap}</em>' if cap else ''
    val = EXV.get(code, '') if val is None else val
    return (f'<div class="key {cls}"><span class="b">{code}</span>'
            f'<span class="l">{label}{hint_html}</span>'
            f'<span class="v {vcls}">{cap_html}{hv(val)}{unit}</span></div>')


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

  @media screen and (max-width: 860px){
    body{background:var(--paper);font-size:15px}
    .page{width:auto;height:auto;margin:0;padding:22px 16px 26px;overflow:visible;border-bottom:10px solid #E5DCCB}
    .page[style*="--green"]{border-bottom-color:#0A2A22}
    .qrs{position:static;margin:0 0 10px;justify-content:flex-start;flex-wrap:wrap}
    .page.hasqr{display:flex;flex-direction:column}
    .page.hasqr > *{order:3}
    .page.hasqr > .top,.page.hasqr > h2,.page.hasqr > .lead.first{order:1}
    .page.hasqr > .qrs{order:2;margin:10px 0 0}
    .page[style*="--green"] table td:nth-child(4){display:none}
    .qrs img{width:84px;height:84px}
    .page.hasqr h2,.page.hasqr .lead.first{max-width:none}
    h1{font-size:34px!important} h2{font-size:22px} h3{font-size:16px;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center}
    .url{margin-left:0;word-break:break-all}
    .foot{position:static;margin-top:18px;gap:8px;flex-wrap:wrap}
    .top{flex-wrap:wrap;gap:6px}
    .grid2,.grid3,.keys2,.tiles{grid-template-columns:1fr!important;gap:8px!important}
    .inrow{grid-template-columns:1fr 1fr}
    .inrow div{height:auto;min-height:52px}
    .fc{grid-template-columns:1fr 38%;gap:6px 10px}
    .fc .parts{grid-column:1 / -1;order:3}
    .fc .tot{height:40px}
    .key{min-height:52px}
    .key .l{font-size:15px}
    .key .l small{font-size:12px}
    .key .l .sub{font-size:13px;line-height:1.8}
    .key .v,.key .v.s,.key .v.xs,.key.big .v{width:30%}
    .small,.note,.need{font-size:12.5px}
    .mono{font-size:11px}
    .tile{height:auto;min-height:60px}
    table.draft,table.etf{font-size:12px}
    table.draft th,table.etf th{font-size:11px}
    .dark .grid3{font-size:14px!important}
    .eq{font-size:15px}
    .cqr{width:48px;height:48px}
    .panel svg{max-width:100%}
  }
  .sumrow td{font-weight:700;color:var(--ink)!important;border-top:1.5px solid var(--ink)}
  .ink{font-family:"LXGW WenKai TC","Noto Sans TC",cursive;font-weight:700;color:#1F4E9A;font-size:1.15em;letter-spacing:.01em}
  .key .v .ink{font-size:12.5pt;margin-right:1mm}
  .key.big .v .ink{font-size:15pt}
  .fc .parts u .ink{display:block;font-size:9.5pt;line-height:3.4mm;padding:0 1mm;text-align:center}
  .fc .tot .ink{font-size:11.5pt;margin-right:1mm}
  .tile em .ink,.inrow div em .ink,.sum td.val .ink{font-size:11.5pt;margin-right:1mm}
  .sum td.val .ink{font-size:12pt}
  .draft td .ink{font-size:9.5pt}
  .dark .ink{color:#F6E7B4}
  .dark .key .ink{color:#1F4E9A}
  .note .ink{color:#1F4E9A}
  .panel div[style*="border-bottom"] .ink{font-size:10pt;line-height:6mm}
  .exbadge{position:absolute;top:5mm;left:15mm;background:#1F4E9A;color:#fff;font-size:7.5pt;letter-spacing:.08em;padding:.6mm 2.5mm;border-radius:1mm}
  @media screen and (max-width: 860px){ .exbadge{position:static;display:inline-block;margin-bottom:8px} }
  .tile .c,.sum .c{display:inline-block;background:var(--red);color:#fff;font-family:"DM Serif Display",serif;font-weight:400;font-size:10pt;line-height:1.35;padding:0 1.4mm;border-radius:.8mm;margin-right:1.5mm}
  .tile.k{border:1.6px solid var(--red)}
  .tiles3{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm;margin-top:2mm}
  .chk{font-size:8.5pt;line-height:1.9}
  .quote{border-left:3px solid var(--gold);background:#FBF6EC;padding:1.8mm 3mm;font-size:8.3pt;line-height:1.6;margin-top:1.5mm}
  .badge{display:inline-block;background:#F6ECD2;color:#8A6A1F;border:1px solid #E3CF9E;border-radius:4mm;padding:0 2mm;font-size:7.5pt;font-weight:700;margin:0 1mm}
  .key .b.w{width:19mm;font-size:10.5pt;line-height:1.1;text-align:center}
  .res{border:1.2px solid var(--ink);background:#fff;border-radius:1.5mm;padding:2.5mm 4mm;margin-top:2mm}
  .ex td{font-style:italic;color:#9A968A!important;font-size:8pt}
  .sum td{padding:0 1.5mm;height:9.3mm;font-size:8.8pt}
  .sum th{font-size:8pt}
  .sum td.g{background:var(--tint);width:24mm;vertical-align:top;padding-top:2mm;border-bottom:1.5px solid var(--ink)}
  .sum td.g b{display:block;font-family:"Noto Serif TC",serif;font-weight:900;font-size:10.5pt;line-height:1.25}
  .sum td.g small{display:block;font-size:7pt;color:var(--muted);margin-top:.8mm}
  .sum td.g i{font-style:normal;font-family:"DM Serif Display",serif;color:#C0703F;font-size:14pt;display:block;line-height:1}
  .sum tr.end td{border-bottom:1.5px solid var(--ink)}
  .sum td.cd{width:15mm;text-align:center}
  .sum td.cd span{color:var(--muted)}
  .sum td.cd span.c{color:#fff;margin:0}
  .sum td.it{width:44mm;font-weight:700}
  .sum td.it small{display:block;font-weight:400;font-size:7pt;color:var(--muted)}
  .sum td.val{width:36mm;border-left:1px dashed var(--rule);border-right:1px dashed var(--rule);background:#FFFDF8;text-align:right;vertical-align:bottom;padding-bottom:1mm;font-size:7.5pt;color:var(--muted)}
  .sum td.hw{font-size:8pt;color:var(--muted)}
  .why{border-top:2px solid var(--gold);background:#fff;padding:2.2mm 3mm;font-size:8.3pt;line-height:1.55}
  .why b{display:block;font-family:"Noto Serif TC",serif;font-size:10.5pt;color:var(--ink);margin-bottom:.8mm}
  .why .n{font-family:"DM Serif Display",serif;color:var(--gold);font-size:14pt;float:right;line-height:1}
  .r72{background:var(--green);color:var(--tint);padding:3mm 4mm;font-size:8.5pt;line-height:1.6}
  .r72 .f{font-family:"Noto Serif TC",serif;font-weight:900;font-size:12.5pt;color:var(--goldSoft);margin:1mm 0}
  @media screen and (max-width: 860px){
    .tiles3{grid-template-columns:1fr!important}
    .res{padding:10px 12px}
    .sum,.sum tbody,.sum tr,.sum td{display:block;width:auto!important;height:auto}
    .sum tr:first-child{display:none}
    .sum tr{display:grid;grid-template-columns:48px 1fr 38%;border-bottom:1px solid var(--rule);padding:6px 0}
    .sum td{border:none!important;padding:2px 4px;font-size:14px}
    .sum td.g{grid-column:1 / -1;background:var(--tint);padding:8px 10px;margin:10px 0 2px}
    .sum td.g b,.sum td.g small,.sum td.g i{display:inline;margin-right:6px}
    .sum td.val{border:1px solid var(--rule)!important;min-height:40px}
    .sum td.hw{grid-column:2 / -1;font-size:12.5px}
    .sum tr.gr{border-bottom:none;padding:0}
    .why .n{float:left;margin-right:8px;font-size:20px}
    .sum td.g br{display:none}
    .etf tr > *:nth-child(2),.etf tr > *:nth-child(4){display:none}
  }
"""

head = (HERE / '_worksheet_head.html').read_text(encoding='utf-8').replace('</style>', EXTRA_CSS + '</style>')
if EXAMPLE:
    head = head.replace('family=DM+Serif+Display', 'family=LXGW+WenKai+TC:wght@400;700&family=DM+Serif+Display')
    head = head.replace('<title>我的退休帳本</title>', '<title>我的退休帳本（範例）</title>')
    head = head.replace('</style>', '  .inrow div{height:17mm}\n  .inrow div em{white-space:nowrap}\n  .inrow div em .ink{display:inline;color:#1F4E9A}\n</style>')

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
      <div><div class="small">憑感覺：退休後每月需要</div><div style="font-size:15pt;margin-top:2mm"><span class="blank" style="min-width:45mm;text-align:center">{hv('50,000')}</span> 元</div></div>
      <div><div class="small">有根據：第二關算出的 {ref('C1')} 月均支出</div><div style="font-size:15pt;margin-top:2mm"><span class="blank" style="min-width:45mm;text-align:center">{hv('40,000')}</span> 元</div></div>
    </div>
  </div>

  <div style="background:var(--tint);color:var(--ink);padding:4mm 6mm;margin-top:5mm">
    <div class="mono">怎麼用這份學習單</div>
    <div style="display:flex;gap:5mm;align-items:center;margin-top:2mm;font-size:9.5pt">
      <div class="key" style="margin:0;width:62mm;min-height:9mm"><span class="b" style="width:10mm;font-size:12pt">A1</span><span class="l" style="font-size:8.5pt">紅框 ＝ 要寫數字的地方</span></div>
      <div>{ref('A1')} 空心小框 ＝ 引用前面寫過的數字</div>
    </div>
    <div class="small" style="margin-top:1.5mm">灰色草稿表隨手記即可，只有紅框要工整。每頁右上角標出本頁要填哪幾格，最後一頁有總複習表。</div>
  </div>

  <h3 style="color:var(--goldSoft);margin-top:6mm">五個工具 · 手機掃描並加入書籤（依使用順序）</h3>
  <table style="color:var(--tint)">{cover_rows}</table>

  <div class="eq" style="color:var(--tint);border-color:var(--goldSoft);margin-top:6mm">
    目標本金 <span class="num" style="color:var(--goldSoft)">F1</span> ＝ 現在月支出 <span class="num" style="color:var(--goldSoft)">C1</span> × 12 × 25　｜　月退 <span class="num" style="color:var(--goldSoft)">B1</span> 是備案
  </div>
  <div class="small" style="color:rgba(242,236,225,.6);margin-top:3mm">三個約定：① 數字只寫在自己的學習單　② 估算比精算重要，不確定就填保守值　③ 本課程為觀念與工具分享，非投資建議</div>
  <div class="foot" style="color:rgba(242,236,225,.55)"><span>姓名／代號 {w('示範老師（虛構）', '＿＿＿＿＿＿')}　日期 {w('上課當天', '＿＿＿＿＿＿')}</span><span class="num">01</span></div>
</section>
"""

# ═══════════ 第一關 制度 ═══════════
p1 = f"""
<section class="page hasqr">
  {qrs(('salary', '01 薪資試算'), ('pension', '02 退休金試算'))}
  <div class="top"><span class="mono">PART I · 制度</span><span class="need">{mini('A1', 'A2', 'A3', 'B1')}</span></div>
  <h2>第一關｜制度會給我多少？</h2>
  <p class="lead first">舊制月退上限 ＝ 本俸 × 2 × 所得替代率<br>手機掃描 QR Code 開啟工具</p>

  {hands('01', 'teacher-salary-calculator.netlify.app', '薪資試算')}
  <div class="note">新制教師：自願提繳一律先設 <b>0%</b></div>
  {key('A1', '現在的我', f'<span class="sub">薪級 {w("330")}　每月實領 {w("60,000", "＿＿＿＿＿＿")} 元　今年 {w("32", "＿＿")} 歲</span>', '元', '目前年薪', 'tall', '')}
  {key('A2', '年功薪到頂的我', f'<span class="sub">薪級 {w("650")}　每月實領 {w("85,000", "＿＿＿＿＿＿")} 元　那時 {w("46", "＿＿")} 歲</span><small>年功薪上限：學士 625／碩士 650（以工具最新俸額為準）</small>', '元', '到頂時年薪', 'tall')}
  {key('A3', '年薪成長空間', f'＝ {ref("A2")} − {ref("A1")}', '元', '成長空間')}

  {hands('02', 'pension-calculation.netlify.app', '退休金試算')}
  <div class="note">① 月退起支年齡逐年提高，<b>121 年過渡期後為 58 歲</b>（提前退休 1 年少 4%，最多提早 5 年、少 20%）</div>
  <div class="note">② 依照試算器上的數字填入；<b>舊制、新制擇一填寫</b></div>

  <div class="variant">舊制（112/6/30 以前任職）</div>
  {key('B1', '預估月退（退撫＋公保）', f'<span class="sub">我預計 {w("60", "＿＿")} 歲退休　　公保一次給付（退休時一次領）{w("1,910,700", "＿＿＿＿＿＿")} 元</span><small>退撫月退上限 ＝ 本俸 × 2 × 所得替代率（現行 35 年為 69%）</small>', '元／月', '每月可領', 'tall')}
  <div class="or">— 或 —</div>
  <div class="variant" style="margin-top:0">新制（112/7/1 以後初任）</div>
  {key('B1', '預估月退（專戶＋公保年金）', '<span class="sub">我預計 ＿＿ 歲退休　　個人專戶（預設領 30 年）＿＿＿＿ 元／月 ＋ 公保年金 ＿＿＿＿ 元／月</span><small>自願提繳預設 0%，實質年報酬率預設 3%</small>', '元／月', '每月可領', 'tall', val='')}

  <div class="box" style="margin-top:4mm;padding:3mm 5mm;font-size:9pt">
    <b>想一想：</b>B1 是「制度保證給你的」，但它是備案，不是全部。第四關我們會假設<b>沒有退休金</b>，自己準備一份目標本金。
  </div>
  <div class="foot"><span>我的退休帳本 · 第一關</span><span class="num">02</span></div>
</section>
"""

# ═══════════ 第二關 現在花多少 ═══════════
YR = '<span class="yr">整年</span>'


def fc(label, hint, parts, unit, total_code='', yearly=False, vals=(), total=''):
    vals = list(vals) + [''] * (len(parts) - len(vals))
    parts_html = '　'.join(f'{x} <u>{w(v, "") if v else ""}</u>' for x, v in zip(parts, vals))
    code = f'<i>{total_code}</i>' if total_code else ''
    return (f'<div class="fc{" y" if yearly else ""}"><div class="lab">{label}{YR if yearly else ""}<small>{hint}</small></div>'
            f'<div class="parts">{parts_html}</div><div class="tot">{code}{hv(total)}{unit}</div></div>')


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
  {fc('每月固定收入', '本俸、月薪', ['薪資實領'], '元／月', 'ⓐ', vals=['60,000'], total='60,000')}
  {fc('穩定的額外收入', '兼職、接案、鐘點', ['兼職', '接案', '鐘點'], '元／月', 'ⓑ', vals=['0', '0', '2,000'], total='2,000')}
  {fc('獎金與配息', '填一整年總額', ['年終', '考績', '股息配息'], '元／年', 'ⓒ', True, ['95,000', '44,000', '5,000'], '144,000')}

  {sechd('2', '你的支出，分三層', '把「一次性」獨立出來')}
  {fc('固定月支出', '每月幾乎一樣，貸款也算這裡', ['房租房貸', '車貸', '孝親', '訂閱電信'], '元／月', 'ⓓ', vals=['18,000', '4,000', '2,000', '1,000'], total='25,000')}
  {fc('半固定月支出', '每月都有但會浮動', ['吃飯', '交通', '日用品', '小確幸'], '元／月', 'ⓔ', vals=['6,500', '1,500', '1,000', '1,000'], total='10,000')}
  {fc('一次性支出', '偶爾才花，填一整年', ['所得稅', '年繳保費', '旅遊紅包', '大採購'], '元／年', 'ⓕ', True, ['8,000', '24,000', '20,000', '8,000'], '60,000')}

  {sechd('3', '你的收支體檢', 'ⓐ～ⓕ 輸入工具後，抄回紅框')}
  <div class="grid3" style="gap:0 3mm">
    {key('C1', '月均支出', '', '元', '', '', 'xs')}
    {key('C2', '月均收入', '', '元', '', '', 'xs')}
    {key('C3', '儲蓄率', '', '%', '', '', 'xs')}
  </div>
  <div class="small" style="margin-top:1mm">沒記帳？看薪資單、信用卡帳單、網銀明細，估不準就取整數。退休後月支出直接用 {ref('C1')} 粗估（房貸車貸可能沒了，醫療旅遊會增加，一來一往）；參考：所得替代法 {ref('C2')} × 0.7 ≈ {w('51,800')} 元。</div>

  <div class="dark" style="margin-top:2.5mm">
    <div class="mono">今天最重要的一個數字</div>
    <div class="key big" style="margin-top:2mm;border-color:var(--goldSoft)"><span class="b">D</span><span class="l" style="color:var(--ink)">退休後每月餘裕 ＝ {ref('B1')} − {ref('C1')}<small>大於 0：月退就夠生活，有餘裕　｜　小於 0：差額要靠自己準備</small></span><span class="v">{hv(EXV['D'])}元</span></div>
  </div>
  <div class="foot"><span>我的退休帳本 · 第二關</span><span class="num">03</span></div>
</section>
"""

# ═══════════ 第三關 資產盤點 ═══════════
p3 = f"""
<section class="page hasqr">
  {qrs(('assets', '04 資產總覽'))}
  <div class="top"><span class="mono">PART III · 盤點</span><span class="need">{mini('E1')}</span></div>
  <h2>第三關｜我現在有多少家底？</h2>
  <p class="lead first">欄位和工具一模一樣：一格一個數字，照順序輸入。<br>寫「現在的市值／餘額」，不確定就取整數。</p>

  {hands('04', 'celadon-starship-b44b3c.netlify.app', '資產總覽')}
  <div class="grid2" style="gap:5mm">
    <div>
      {sechd('1', '你的資產', '能換成錢的東西')}
      {fc('現金與存款', '活存、定存', [], '元', total='600,000')}
      {fc('股票・ETF・基金', '證券帳戶投資市值', [], '元', total='1,000,000')}
      {fc('其他投資', '黃金、債券、儲蓄險', [], '元', total='100,000')}
      {fc('房屋現值', '現在市價，查實價登錄', [], '元', total='8,000,000')}
    </div>
    <div>
      {sechd('2', '你的負債', '還沒還完的錢')}
      {fc('房貸餘額', '未還本金，不是月付', [], '元', total='4,800,000')}
      {fc('一般貸款', '信貸、車貸、學貸', [], '元', total='200,000')}
      {fc('信用卡卡債', '循環利息、高利借款', [], '元', total='0')}
    </div>
  </div>

  {sechd('3', '你的資產總覽', '工具算出的結果，照抄')}
  {key('E1', '你的總淨值（資產 − 負債）', '', '元', '', 'big')}
  <div class="tiles">
    <div class="tile"><b>總資產</b><em>{hv('9,700,000')}元</em></div>
    <div class="tile"><b>總負債</b><em>{hv('5,000,000')}元</em></div>
    <div class="tile"><b>不含房子的淨資產</b><small>存款＋投資，真正動得了的錢</small><em>{hv('1,500,000')}元</em></div>
    <div class="tile"><b>房屋淨值</b><small>現值 − 房貸</small><em>{hv('3,200,000')}元</em></div>
  </div>

  {sechd('4', '負債比', '總負債 ÷ 總資產，工具會標出負債類型')}
  <div class="grid2" style="gap:4mm;align-items:start">
    <div>
      <div class="tile" style="height:13mm"><b>我的負債比</b><small>總負債 ÷ 總資產</small><em>{hv('51.5')}%</em></div>
      <div class="chk" style="margin-top:1mm">工具標示：{ck(True)} 房貸為主　□ 信貸／車貸為主<br>　　　　　□ 卡債為主　□ 沒有負債</div>
    </div>
    <div>
      <div class="small">工具畫面範例：負債比 <b style="color:var(--ink)">78%</b><span class="badge">房貸為主</span></div>
      <div class="quote">負債比偏高，但若主要來自房貸——這是有擔保的低利負債，剛買房的前幾年本來就會這樣，屬正常。確認每月現金流撐得住還款即可，不必焦慮。</div>
      <div class="small" style="margin-top:1mm">若主要是信貸、卡債：利率高，<b style="color:var(--red)">先還清，再談投資</b>。</div>
    </div>
  </div>

  <div class="box" style="margin-top:2.5mm;padding:2.5mm 4mm;font-size:9pt">
    <b>淨值 ≠ 可以拿去理財的錢。</b>房子不會生出現金流；身上要先留 <b>6 個月生活費</b>當緊急預備金。<br>
    緊急預備金 ＝ {ref('C1')} × 6 ＝ {w('240,000', '＿＿＿＿＿＿')} 元　→　我的「現金與存款」夠嗎？{ck(True)} 夠　□ 還差 ＿＿＿＿＿ 元
  </div>
  <div class="small" style="margin-top:1.5mm">對照《財富階梯》：我的淨值 {ref('E1')} 在第 {w('3', '＿＿')} 階；萬分之一法則 ＝ E1 × 0.0001 ＝ {w('470', '＿＿＿')} 元以下的消費，不必糾結。</div>
  <div class="foot"><span>我的退休帳本 · 第三關</span><span class="num">04</span></div>
</section>
"""

# ═══════════ 第四關 理財規劃 ═══════════
if EXAMPLE:
    DRAFT4 = [[n] + [w(x) for x in r] + [ok] for n, r, ok in [
        ('1', ['5,000', '28 年', '168 萬', '197.2 萬', '365.2 萬'], '□'),
        ('2', ['15,000', '28 年', '504 萬', '591.6 萬', '1,095.6 萬'], '□'),
        ('3', ['20,000', '28 年', '672 萬', '788.8 萬', '1,460.8 萬'], ck(True)),
    ]]
else:
    DRAFT4 = [
        ['範例', '20,000', '28 年', '672 萬', '788.8 萬', '1,460.8 萬', '—'],
        ['1', '', '', '', '', '', '□'], ['2', '', '', '', '', '', '□'], ['3', '', '', '', '', '', '□'],
    ]

p4 = f"""
<section class="page hasqr">
  {qrs(('finance', '05 理財試算器'))}
  <div class="top"><span class="mono">PART IV · 理財規劃</span><span class="need">{mini('F1', 'C2−C1', 'F2', 'F3', 'G1', 'G2')}</span></div>
  <h2>第四關｜時間，是老師最強的本錢</h2>
  <p class="lead first">假設沒有退休金，把月退當備案，自己存出一份本金。<br>打開理財試算器「理財規劃」分頁。</p>

  {hands('05', 'toolfinance.netlify.app', '理財試算器 · 理財規劃')}
  {key('F1', f'目標本金 ＝ {ref("C1")} × 12 × 25', '4% 法則：每年提領本金的 4%，約可支應 30 年；保守者用 × 30', '元')}
  <div class="key"><span class="b w">C2<br>− C1</span><span class="l">每月能存下的錢 ＝ {ref('C2')} {w('74,000', '＿＿＿＿＿')} − {ref('C1')} {w('40,000', '＿＿＿＿＿')}<small>再抄一次第二關的數字：這就是「每月投入」的上限</small></span><span class="v">{hv('34,000')}元／月</span></div>

  <div class="panel" style="margin-top:2mm">
    <div class="mono">① 照順序輸入工具（和工具欄位一模一樣）</div>
    <div class="inrow">
      <div><b>目前年齡</b>A1 的「今年」<em>{hv('32')}歲</em></div>
      <div><b>預計退休年齡</b>B1 的「預計」<em>{hv('60')}歲</em></div>
      <div><b>初始本金</b>可留空<em>{hv('留空')}元</em></div>
      <div><b>每月投入金額</b>先試 5,000<em>{hv('20,000')}元</em></div>
      <div><b>年報酬率（實質）</b>預設 <b style="display:inline;color:var(--red)">5</b><em>{hv('5')}%</em></div>
    </div>
  </div>

  <div class="small" style="margin:1mm 0 0">初始本金：手邊現在就想投入的錢，沒有就留空；記得先留好緊急預備金，不要把救命錢拿去投資。</div>
  <div class="small" style="margin:2mm 0 1mm">② 草稿表：只改「每月投入」，直到退休時累積接近 {ref('F1')}，但不超過 {ref('C2')} − {ref('C1')}</div>
  {draft(['試算', '每月投入', '投入年數', '本金總投入', '複利貢獻', '退休時預估累積', '達標？'], DRAFT4).replace('<tr><td>範例', '<tr class="ex"><td>範例')}

  <div class="res">
    <div class="mono">③ 圈一組付得起的版本，照工具結果畫面抄下來</div>
    <div class="keys2" style="margin-top:1mm">
      {key('F2', '我決定的每月投入', '', '元', '', '', 's')}
      {key('F3', '退休時預估累積資產', '', '元', '', '', 's')}
    </div>
    <div class="tiles3" style="margin-top:1mm">
      <div class="tile"><b>投入年數</b><small>退休年齡 − 目前年齡</small><em>{hv('28')}年</em></div>
      <div class="tile"><b>本金總投入</b><small>你自己放進去的錢</small><em>{hv('6,720,000')}元</em></div>
      <div class="tile k"><b><span class="c">G1</span>複利貢獻</b><small>時間幫你賺的錢</small><em>{hv(EXV['G1'])}元</em></div>
    </div>
    <div class="small" style="text-align:center;margin:1.2mm 0 0">{ref('F3')} 退休時預估累積 ＝ 本金總投入 ＋ {ref('G1')} 複利貢獻</div>
    {key('G2', '早開始 vs 晚 10 年：晚 10 年開始，少了', '範例：每月 2 萬、5%，晚 10 年開始（投入 18 年）約少 762 萬', '元', '', '', 's')}
  </div>

  <div class="box" style="margin-top:2mm;padding:2.2mm 4mm;font-size:8.8pt">
    <b>看圖說話：</b>本金總投入 vs 複利貢獻，哪個比較大？{w('複利比較大！', '＿＿＿＿＿＿')}　晚 10 年開始，心裡的感覺是？{w('少一半，要早點開始', '＿＿＿＿＿＿')}
  </div>
  <div class="foot"><span>我的退休帳本 · 第四關　｜　本頁內容為觀念與工具練習，非投資建議</span><span class="num">05</span></div>
</section>
"""

# ═══════════ 總複習 A～G ═══════════
def srow(code, item, hint, unit, how, val='', end=False, group=''):
    cd = f'<span class="c">{code}</span>' if code and code != '—' else '<span>—</span>'
    sm = f'<small>{hint}</small>' if hint else ''
    val = EXV.get(code, '') if not val else val
    return (f'<tr class="{"end" if end else ""}">{group}<td class="cd">{cd}</td><td class="it">{item}{sm}</td>'
            f'<td class="val">{hv(val)}{unit}</td><td class="hw">{how}</td></tr>')


def sgroup(n, title, sub, rows):
    g = f'<td class="g" rowspan="{len(rows)}"><i>{n}</i><b>{title}</b><small>{sub}</small></td>'
    out = ''
    for i, r in enumerate(rows):
        out += srow(*r, end=(i == len(rows) - 1), group=g if i == 0 else '')
    return out


sum_rows = (
    sgroup('1', '薪水', '我賺多少<br>第一關', [
        ('A1', '目前年薪', '', '元', '今年的起點'),
        ('A2', '年功薪到頂的年薪', '', '元', f"薪水的天花板，{w('46', '＿＿')} 歲到頂"),
        ('A3', '年薪成長空間', 'A2 − A1', '元', '加薪空間有限，別預支未來的薪水'),
    ]) +
    sgroup('2', '月退', '制度給多少<br>第一關', [
        ('B1', '預估月退', f'{ck(True)} 舊制　□ 新制', '元／月', f"{w('60', '＿＿')} 歲退休；這是備案，不是全部"),
    ]) +
    sgroup('3', '每月收支', '我花多少<br>第二關', [
        ('C2', '月均收入', '', '元', ''),
        ('C1', '月均支出', '', '元', '也是退休後生活費的粗估'),
        ('C3', '儲蓄率', '', '%', f'{ck(True)} 20% 以上　□ 10～20%　□ 10% 以下'),
        ('—', '每月能存下的錢', 'C2 − C1', '元', '每月投入的上限', '34,000'),
        ('D', '退休後每月餘裕', 'B1 − C1', '元', f'{ck(True)} 大於 0：月退夠用　□ 小於 0：要自己補'),
    ]) +
    sgroup('4', '資產總覽', '我有多少<br>第三關', [
        ('E1', '總淨值', '資產 − 負債', '元', f"財富階梯第 {w('3', '＿＿')} 階"),
        ('—', '負債比', '總負債 ÷ 總資產', '%', f'{ck(True)} 房貸為主　□ 信貸車貸　□ 卡債　□ 無', '51.5'),
        ('—', '緊急預備金', 'C1 × 6', '元', f'現金與存款夠嗎？{ck(True)} 夠　□ 差 ＿＿＿＿', '240,000'),
    ]) +
    sgroup('5', '理財規劃', '要多少、怎麼到<br>第四關', [
        ('F1', '目標本金', 'C1 × 12 × 25', '元', '假設沒有月退，自己要準備的錢'),
        ('F2', '每月投入', '', '元', f'有沒有超過每月能存下的錢？{ck(True)} 沒有'),
        ('F3', '退休時預估累積資產', '本金總投入 ＋ G1', '元', f'{ck(True)} 達標（F3 ≥ F1）　□ 還差 ＿＿＿＿'),
        ('G1', '複利貢獻', '', '元', f"時間幫我賺了 F3 的 {w('54', '＿＿')} %"),
        ('G2', '晚 10 年開始少了', '', '元', '等待的代價'),
    ])
)

p_sum = f"""
<section class="page">
  <div class="top"><span class="mono">REVIEW · A → G 總複習</span><span class="need">把前面的紅框抄過來</span></div>
  <h2>總複習｜一張表，看懂我的退休帳本</h2>
  <p class="lead">由上往下讀：賺多少 → 制度給多少 → 花多少 → 有多少 → 要多少、怎麼到。</p>
  <table class="sum" style="margin-top:3mm">
    <tr><th>主題</th><th style="text-align:center">代號</th><th>項目</th><th style="text-align:right">我的數字</th><th>怎麼看（自我檢核）</th></tr>
    {sum_rows}
  </table>

  <div class="dark" style="margin-top:3.5mm;font-size:9.5pt;line-height:2">
    <div class="mono">用一段話說給自己聽</div>
    我每月能存 {w('34,000', '＿＿＿＿＿')} 元，現在淨值 {w('4,700,000', '＿＿＿＿＿')} 元。每月投入 {ref('F2').replace('ref"', 'ref" style="border-color:var(--goldSoft);color:var(--goldSoft)"')} {w('20,000', '＿＿＿＿＿')} 元，到 {w('60', '＿＿')} 歲約可累積 {w('14,608,000', '＿＿＿＿＿')} 元，目標是 {w('12,000,000', '＿＿＿＿＿')} 元。<br>
    還差的部分，我選擇：□ 每月多投入一點　□ 晚幾年退休　□ 讓月退 B1 補上（看 D）{w('　→ 已達標，不用選', '')}
  </div>
  <div class="foot"><span>我的退休帳本 · 總複習　｜　本頁內容為觀念與工具練習，非投資建議</span><span class="num">06</span></div>
</section>
"""

# ═══════════ 延伸：買大盤 ETF ═══════════
import math

def curve(rate, years=20, x0=14, y0=150, w=246, h=128, ymax=180):
    pts = []
    for y in range(years + 1):
        v = 10 * (1 + rate) ** y  # 10 萬起
        pts.append(f'{x0 + w * y / years:.1f},{y0 - h * v / ymax:.1f}')
    return ' '.join(pts)

series = [('VOO', 0.151, '#B4432E'), ('0050', 0.126, '#0F3B30'), ('0056', 0.082, '#B0833A'), ('試算用 5%', 0.05, '#9A968A')]
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

p_etf = f"""
<section class="page">
  <div class="top"><span class="mono">EXTRA · 買大盤</span><span class="need">延伸閱讀 · 不需填紅框</span></div>
  <h2>延伸｜為什麼買大盤？台股、美股 ETF 長期怎麼走</h2>
  <p class="lead">不選股，買下整個市場。以下為講者整理的觀念與公開資料，非投資建議。</p>

  <div class="grid3" style="margin-top:3mm;gap:3mm">
    <div class="why"><span class="n">1</span><b>個股會消失，大盤會換血</b>曾經的股王宏達電，股價從 1,300 元跌到不到 100 元。指數會定期把變弱的公司換掉，買大盤不怕押錯一家。</div>
    <div class="why"><span class="n">2</span><b>專家也很難贏大盤</b>美國 15 年的統計，約 9 成主動型大型股基金，績效輸給 S&amp;P 500 指數（SPIVA，至 2024 年底）。</div>
    <div class="why"><span class="n">3</span><b>老師沒空盯盤</b>定期定額買大盤，不用研究財報、不用猜高低點，省下的時間留給學生和家人，剩下的交給複利。</div>
  </div>

  <table class="etf" style="margin-top:3mm">
    <tr><th>ETF</th><th>類型</th><th>追蹤</th><th>成立</th><th>成立以來年化（含息）</th><th>2008 海嘯最深跌幅</th><th>72 法則：幾年翻倍</th></tr>
    <tr><td><b>0050</b></td><td>市值型</td><td>台灣市值前 50 大</td><td>2003</td><td class="n">約 12.6%</td><td>約 −56%</td><td>72 ÷ 12.6 ≈ {w('5.7', '＿＿')} 年</td></tr>
    <tr><td><b>VOO</b></td><td>市值型</td><td>美國 S&amp;P 500</td><td>2010</td><td class="n">約 15%</td><td>約 −57%<small style="display:block;font-size:6.8pt;color:var(--muted)">S&amp;P 500 指數（VOO 當時未成立）</small></td><td>72 ÷ 15 ≈ {w('4.8', '＿＿')} 年</td></tr>
    <tr><td><b>0056</b></td><td>高股息</td><td>台灣高股息 50 檔</td><td>2007</td><td class="n">約 8.2%</td><td>約 −58%</td><td>72 ÷ 8.2 ≈ {w('8.8', '＿＿')} 年</td></tr>
  </table>
  <div class="small" style="margin-top:1mm">資料：0050 依元大投信公布成立以來含息累積報酬 1,349%（至 2025/12/31）換算；0056 成立以來含息總報酬約 327%、年化約 8.2%（至 2026/3/31）；跌幅為 2008 金融海嘯波段高點到低點；VOO 為美元計、未含匯率。上課前請以最新公告更新。</div>

  <div class="grid2" style="margin-top:3mm;gap:5mm;align-items:start">
    <div class="panel">
      <div class="mono">10 萬元，按各自長期年化報酬推算 20 年</div>
      {chart}
      <div class="small">用平均報酬畫出的平滑線，真實走勢會大起大落。</div>
    </div>
    <div>
      <div class="r72">
        <div class="mono">72 法則｜錢多久會翻一倍？</div>
        <div class="f">72 ÷ 年報酬率（%）≈ 翻倍年數</div>
        例：試算用的 5% → 72 ÷ 5 ≈ <b style="color:var(--goldSoft)">14 年</b>翻一倍<br>
        30 歲放 10 萬 → 44 歲約 20 萬 → 58 歲約 40 萬<br>
        報酬率差一點，翻倍速度差很多：8% 要 9 年，12% 只要 6 年。
      </div>
      <div class="panel" style="margin-top:2.5mm">
        <div class="mono">想一想</div>
        <div class="note" style="margin-top:1mm">① 過去平均 8～15%，為什麼試算只用 <b>5%</b>？</div>
        <div style="border-bottom:1px solid var(--rule);height:6mm">{w('扣掉通膨、留給大跌，寧可保守', '')}</div>
        <div class="note" style="margin-top:1.5mm">② 0056 配息比較多，長期總報酬為什麼反而比 0050 低？<span class="small">（提示：配息是從淨值裡拿出來的；股災時一樣跌）</span></div>
        <div style="border-bottom:1px solid var(--rule);height:6mm">{w('配息不是多賺，是把淨值換成現金', '')}</div>
        <div class="note" style="margin-top:1.5mm">③ 我比較適合：□ 台股大盤　□ 美股大盤　{ck(True)} 兩者搭配</div>
      </div>
    </div>
  </div>

  <div class="dark" style="margin-top:3mm">
    <div class="mono">我的定期定額計畫 · 離開前三個行動承諾</div>
    <div class="grid3" style="margin-top:2mm;font-size:9.5pt">
      <div>今晚：<br>{ck(True)} 把這份學習單拍照存檔<br>{ck(True)} 確認緊急預備金 {w('15', '＿＿')} 個月</div>
      <div>這個月：<br>{ck(True)} 開證券戶／設定扣款<br>每月 {ref('F2')} {w('20,000')} 元，每月 {w('6', '＿＿')} 日</div>
      <div>今年：<br>□ 查一次自己的年資與專戶<br>□ 年底檢視一次，不停扣</div>
    </div>
    <div style="margin-top:2.5mm;font-size:9pt;color:var(--goldSoft)">簽名 {w('示範老師', '＿＿＿＿＿＿')}　日期 {w('上課當天', '＿＿＿＿＿＿')}　→ 很早開始、很久不停。明年今天，再打開一次。</div>
  </div>
  <div class="foot"><span>我的退休帳本 · 延伸　｜　過去績效不代表未來，本頁非投資建議</span><span class="num">07</span></div>
</section>
"""

body = cover + p1 + p2 + p3 + p4 + p_sum + p_etf
if EXAMPLE:
    body = body.replace('\n  <div class="top"', '\n  <div class="exbadge">示範用範例 · 人物與數字皆為虛構</div>\n  <div class="top"')
html = head + '<body>\n' + body + '\n</body>\n</html>\n'
out = 'worksheet_example.html' if EXAMPLE else 'worksheet.html'
(HERE / out).write_text(html, encoding='utf-8')
print(out, 'written')
