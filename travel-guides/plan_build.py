# -*- coding: utf-8 -*-
"""曼谷 5 天行程表（手機版，每個風格拆成兩張）"""
import html, pathlib

OUT = pathlib.Path(__file__).parent

CSS = """
:root{--paper:#FBF6EA;--ink:#2C241C;--sub:#6B6053;--line:#DCD1BE;
  --accent:@ACCENT@;--accent2:@ACCENT2@;--accent3:@ACCENT3@;--tint:@TINT@}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;background:var(--paper);color:var(--ink);
  font-family:'Noto Sans TC','WenQuanYi Zen Hei',sans-serif;-webkit-font-smoothing:antialiased}
.page{position:relative;padding:44px 36px 38px}
.page::before{content:'';position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle at 1px 1px,rgba(120,100,70,.13) 1px,transparent 0);
  background-size:26px 26px}
.frame{position:absolute;inset:18px;border:3px solid var(--line);border-radius:6px;pointer-events:none}

header{position:relative;text-align:center;padding-bottom:22px;margin-bottom:26px;
  border-bottom:4px double var(--line)}
.kicker{font-size:21px;letter-spacing:.42em;color:var(--accent2);font-weight:700;margin-left:.42em}
h1{font-family:'Noto Serif TC',serif;font-weight:900;font-size:74px;line-height:1.1;
  letter-spacing:.06em;margin:12px 0 6px}
.en{font-size:23px;letter-spacing:.3em;color:var(--accent);font-weight:700;margin-left:.3em}
.lead{font-size:26px;color:var(--sub);line-height:1.7;margin-top:14px}
.badge{display:inline-block;font-size:21px;letter-spacing:.16em;color:#fff;background:var(--accent);
  padding:7px 22px;border-radius:30px;margin-top:16px;font-weight:700}
.who{display:inline-block;font-size:22px;color:var(--accent2);border:2px dashed var(--accent2);
  border-radius:8px;padding:8px 20px;margin-top:16px;line-height:1.5}
header.mini{padding-bottom:18px;margin-bottom:24px}
header.mini h1{font-size:54px;margin:8px 0 4px}
header.mini .en{font-size:20px}

.day{background:#fff;border:2px solid var(--line);border-radius:12px;padding:0 0 8px;
  margin-bottom:20px;box-shadow:3px 4px 0 rgba(180,165,135,.2);overflow:hidden}
.dh{background:var(--accent);color:#fff;padding:14px 24px;display:flex;align-items:baseline;gap:14px}
.dh b{font-family:'Noto Serif TC',serif;font-size:36px;letter-spacing:.04em}
.dh span{font-size:25px;font-weight:500}
.dh i{margin-left:auto;font-style:normal;font-size:20px;opacity:.85;letter-spacing:.08em}
.stops{padding:6px 24px 4px}
.stop{display:flex;gap:16px;padding:14px 0;border-bottom:2px dotted var(--line)}
.stop:last-child{border-bottom:0}
.t{flex:none;width:106px;font-size:25px;font-weight:700;color:var(--accent);padding-top:4px;
  letter-spacing:.02em}
.pl{font-size:30px;font-weight:700;line-height:1.35}
.pl em{font-style:normal;font-size:20px;color:#A0947F;margin-left:8px;font-weight:400}
.nt{font-size:24px;color:#4C4438;line-height:1.6;margin-top:5px}
.mv{color:var(--accent3);font-weight:700}
.tagline-eat{color:var(--accent);font-weight:700}

.notes{background:var(--tint);border:2px solid var(--line);border-radius:12px;padding:22px 26px}
.notes h2{font-family:'Noto Serif TC',serif;font-size:36px;margin-bottom:16px;display:flex;
  align-items:center;gap:12px}
.notes h2::after{content:'';flex:1;height:0;border-top:3px dotted var(--line)}
.notes li{list-style:none;font-size:25px;line-height:1.7;padding-left:28px;position:relative;
  margin-bottom:14px}
.notes li:last-child{margin-bottom:0}
.notes li::before{content:'';position:absolute;left:4px;top:14px;width:11px;height:11px;
  background:var(--accent);border-radius:50%}
.notes li b{color:var(--accent)}

footer{border-top:4px double var(--line);padding-top:18px;margin-top:8px;display:flex;
  justify-content:space-between;font-size:20px;letter-spacing:.14em;color:var(--sub)}
footer b{color:var(--accent);letter-spacing:.2em}
"""


def esc(s):
    return html.escape(str(s), quote=False)


def day_html(d):
    title, theme, area, stops = d
    rows = []
    for t, place, en, note in stops:
        en = '<em>%s</em>' % esc(en) if en else ''
        rows.append('<div class="stop"><div class="t">%s</div><div>'
                    '<div class="pl">%s%s</div><div class="nt">%s</div></div></div>'
                    % (esc(t), place, en, note))
    return ('<div class="day"><div class="dh"><b>%s</b><span>%s</span><i>%s</i></div>'
            '<div class="stops">%s</div></div>'
            % (esc(title), esc(theme), esc(area), ''.join(rows)))


def build(p):
    days = [day_html(d) for d in p['days']]
    notes = ''.join('<li>%s</li>' % n for n in p['notes'])

    head = f"""<header>
  <div class="kicker">BANGKOK 5 DAYS ・ 曼谷五天</div>
  <h1>{esc(p['zh'])}</h1><div class="en">{esc(p['en'])}</div>
  <div class="lead">{p['lead']}</div>
  <div class="who">{p['who']}</div>
  <div class="badge">DAY 1 – 3</div>
</header>"""
    head2 = f"""<header class="mini">
  <div class="kicker">BANGKOK 5 DAYS ・ 曼谷五天</div>
  <h1>{esc(p['zh'])}</h1><div class="en">{esc(p['en'])}</div>
  <div class="badge">DAY 4 – 5 ＋ 路線筆記</div>
</header>"""
    foot = lambda t: ('<footer><span>曼谷 5 天・%s</span><b>%s</b></footer>'
                      % (esc(p['zh']), esc(t)))

    pages = [
        ('-1', head + ''.join(days[:3]) + foot('PLAN %s ・ 1 / 2' % p['tag'])),
        ('-2', head2 + ''.join(days[3:])
         + '<div class="notes"><h2>路線筆記</h2><ul>%s</ul></div>' % notes
         + foot('PLAN %s ・ 2 / 2' % p['tag'])),
    ]
    css = (CSS.replace('@ACCENT@', p['accent']).replace('@ACCENT2@', p['accent2'])
              .replace('@ACCENT3@', p['accent3']).replace('@TINT@', p['tint']))
    for suffix, body in pages:
        doc = f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=1080">
<title>曼谷 5 天・{esc(p['zh'])}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&family=Noto+Sans+TC:wght@400;500;700;900&display=swap">
<link rel="stylesheet" href="file:///root/fonts/fonts.css">
<style>{css}</style></head><body><div class="page"><div class="frame"></div>{body}</div></body></html>"""
        f = OUT / (p['file'] + suffix + '.html')
        f.write_text(doc, encoding='utf-8')
        print('wrote', f)
