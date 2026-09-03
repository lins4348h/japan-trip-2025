# -*- coding: utf-8 -*-
"""手機閱讀版：1080px 寬、單欄、大字級的一頁式城市導覽"""
import html, pathlib

OUT = pathlib.Path(__file__).parent

# 每個區塊要印幾項（手機版刻意留少）
LIMITS = dict(spots=2, food=5, transport=3, tips=4, budget=4, steps=3)

CSS = """
:root{
  --paper:#FBF6EA; --ink:#2C241C; --sub:#6B6053; --line:#DCD1BE;
  --accent:@ACCENT@; --accent2:@ACCENT2@; --accent3:@ACCENT3@; --tint:@TINT@;
}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;background:var(--paper);color:var(--ink);
  font-family:'Noto Sans TC','WenQuanYi Zen Hei',sans-serif;-webkit-font-smoothing:antialiased}
.page{position:relative;padding:44px 36px 38px}
.page::before{content:'';position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle at 1px 1px, rgba(120,100,70,.13) 1px, transparent 0);
  background-size:26px 26px}
.frame{position:absolute;inset:18px;border:3px solid var(--line);border-radius:6px;pointer-events:none}

/* header */
header{position:relative;text-align:center;padding-bottom:24px;margin-bottom:26px;
  border-bottom:4px double var(--line)}
.kicker{font-size:22px;letter-spacing:.5em;color:var(--accent2);font-weight:700;margin-left:.5em}
h1{font-family:'Noto Serif TC',serif;font-weight:900;font-size:92px;line-height:1.05;
  letter-spacing:.08em;margin:10px 0 4px}
.en{font-size:30px;letter-spacing:.36em;color:var(--accent);font-weight:700;margin-left:.36em}
.tagline{font-size:27px;color:var(--sub);line-height:1.7;margin-top:14px}
.tagline b{color:var(--accent);font-weight:700}
.illus{width:420px;margin:10px auto 0;display:block}
.seal{position:absolute;right:6px;top:0;width:132px;height:132px;border:4px solid var(--accent3);
  border-radius:50%;color:var(--accent3);display:flex;flex-direction:column;align-items:center;
  justify-content:center;transform:rotate(-10deg);opacity:.9}
.seal b{font-family:'Noto Serif TC',serif;font-size:34px;letter-spacing:.06em}
.seal span{font-size:14px;letter-spacing:.16em;margin-top:5px}

/* facts */
.facts{display:grid;grid-template-columns:repeat(3,1fr);border:2px solid var(--line);
  border-radius:10px;background:#fff;overflow:hidden;margin-bottom:32px}
.fact{padding:14px 18px;border-right:2px dashed var(--line);border-bottom:2px dashed var(--line)}
.fact:nth-child(3n){border-right:0}
.fact:nth-child(n+4){border-bottom:0}
.fact .k{font-size:19px;letter-spacing:.2em;color:var(--accent2);font-weight:700}
.fact .v{font-size:28px;font-weight:700;margin-top:6px;line-height:1.3}
.fact .v em{font-style:normal;font-size:21px;font-weight:400;color:var(--sub);display:block;
  margin-top:4px;line-height:1.5}

/* sections */
section{margin-bottom:30px}
h2{font-family:'Noto Serif TC',serif;font-size:40px;letter-spacing:.06em;display:flex;
  align-items:center;gap:14px;margin-bottom:18px}
h2 i{display:inline-flex;width:48px;height:48px;border-radius:50%;background:var(--accent);
  color:#fff;font-style:normal;font-size:23px;font-weight:700;align-items:center;
  justify-content:center;flex:none;font-family:'Noto Sans TC',sans-serif;letter-spacing:0}
h2 span{font-size:20px;letter-spacing:.22em;color:var(--sub);font-weight:400;
  font-family:'Noto Sans TC',sans-serif}
h2::after{content:'';flex:1;height:0;border-top:3px dotted var(--line)}
h3{font-size:23px;letter-spacing:.12em;color:#fff;background:var(--accent2);display:inline-block;
  padding:6px 18px;border-radius:5px;margin:18px 0 12px}
h3:first-of-type{margin-top:0}

.item{display:flex;gap:16px;background:#fff;border:2px solid var(--line);border-radius:10px;
  padding:16px 20px;margin-bottom:11px;box-shadow:3px 4px 0 rgba(180,165,135,.2)}
.item:last-child{margin-bottom:0}
.no{flex:none;width:41px;height:41px;border-radius:50%;border:3px solid var(--accent);
  color:var(--accent);font-size:22px;font-weight:700;display:flex;align-items:center;
  justify-content:center}
.ic{flex:none;width:40px;height:40px}
.nm{font-size:32px;font-weight:700;line-height:1.3}
.nm em{font-style:normal;font-size:20px;color:#A0947F;letter-spacing:.04em;font-weight:400;
  margin-left:10px}
.ds{font-size:25px;color:#4C4438;line-height:1.7;margin-top:6px}
.meta{display:inline-block;font-size:21px;color:#fff;background:var(--accent);border-radius:6px;
  padding:3px 13px;margin-top:9px;letter-spacing:.02em}
.meta.g{background:var(--accent3)}

ul.dots{list-style:none;background:#fff;border:2px solid var(--line);border-radius:10px;
  padding:18px 24px;box-shadow:3px 4px 0 rgba(180,165,135,.2)}
ul.dots li{font-size:26px;line-height:1.7;padding-left:28px;position:relative;margin-bottom:14px}
ul.dots li:last-child{margin-bottom:0}
ul.dots li::before{content:'';position:absolute;left:4px;top:16px;width:12px;height:12px;
  background:var(--accent);border-radius:50%}
ul.dots li b{color:var(--accent)}

.days{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.day{background:#fff;border:2px dashed var(--line);border-radius:10px;padding:16px 18px}
.day .dh{font-family:'Noto Serif TC',serif;font-size:29px;color:var(--accent);font-weight:700;
  border-bottom:2px solid var(--line);padding-bottom:10px;margin-bottom:12px}
.day .dh em{font-style:normal;font-size:22px;color:var(--sub);margin-left:10px;
  font-family:'Noto Sans TC',sans-serif}
.step{font-size:24px;line-height:1.65;padding-left:22px;position:relative;margin-bottom:6px;
  color:#463E33}
.step:last-child{margin-bottom:0}
.step::before{content:'▸';position:absolute;left:0;color:var(--accent2)}

.bud{display:flex;justify-content:space-between;font-size:26px;padding:11px 0;
  border-bottom:2px dotted var(--line)}
.budbox{background:var(--tint);border:2px solid var(--line);border-radius:10px;padding:14px 26px 20px}
.bud:last-of-type{border-bottom:0}
.bud span{color:var(--accent);font-weight:700}
.budnote{font-size:23px;color:var(--sub);line-height:1.7;border-top:3px dotted var(--line);
  padding-top:14px;margin-top:6px}
.budnote b{color:var(--accent)}

footer{border-top:4px double var(--line);padding-top:20px;display:flex;
  justify-content:space-between;font-size:20px;letter-spacing:.16em;color:var(--sub)}
footer b{color:var(--accent);letter-spacing:.22em}
"""

ICON_FOOD = ("""<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="1.8"
 stroke-linecap="round"><path d="M6 3v8a2 2 0 002 2h0a2 2 0 002-2V3M8 13v8M18 3c-1.6 1.4-2.2 3.2"""
             """-2.2 5.2 0 1.6.7 2.6 2.2 2.8V21"/></svg>""")


def esc(s):
    return html.escape(str(s), quote=False)


def trim(c):
    c = dict(c)
    c['spots'] = [(t, items[:LIMITS['spots']]) for t, items in c['spots']]
    for k in ('food', 'transport', 'tips', 'budget'):
        c[k] = c[k][:LIMITS[k]]
    c['days'] = [(a, b, steps[:LIMITS['steps']], note) for a, b, steps, note in c['days']]
    return c


def build(c):
    c = trim(c)
    li = lambda xs: ''.join('<li>%s</li>' % x for x in xs)

    spots, n = [], 1
    for title, items in c['spots']:
        spots.append('<h3>%s</h3>' % esc(title))
        for it in items:
            en = '<em>%s</em>' % esc(it[1]) if it[1] else ''
            meta = '<div class="meta">%s</div>' % esc(it[3]) if len(it) > 3 and it[3] else ''
            spots.append('<div class="item"><div class="no">%d</div><div>'
                         '<div class="nm">%s%s</div><div class="ds">%s</div>%s</div></div>'
                         % (n, esc(it[0]), en, esc(it[2]), meta))
            n += 1
    spots = ''.join(spots)

    food = ''.join(
        '<div class="item">%s<div><div class="nm">%s%s</div><div class="ds">%s</div>%s</div></div>'
        % (ICON_FOOD % c['accent'], esc(nm), '<em>%s</em>' % esc(en) if en else '', esc(ds),
           '<div class="meta g">%s</div>' % esc(pr) if pr else '')
        for nm, en, ds, pr in c['food'])

    facts = ''.join('<div class="fact"><div class="k">%s</div><div class="v">%s<em>%s</em></div></div>'
                    % (esc(k), esc(v), esc(s)) for k, v, s in c['facts'][:6])

    days = ''.join('<div class="day"><div class="dh">%s<em>%s</em></div>%s</div>'
                   % (esc(d[0]), esc(d[1]),
                      ''.join('<div class="step">%s</div>' % esc(s) for s in d[2]))
                   for d in c['days'])

    budget = ''.join('<div class="bud"><b>%s</b><span>%s</span></div>' % (esc(a), esc(b))
                     for a, b in c['budget'])

    body = f"""<div class="page"><div class="frame"></div>
<header>
  <div class="seal"><b>{esc(c['seal'])}</b><span>TRAVEL NOTE</span></div>
  <div class="kicker">{esc(c['kicker'])}</div>
  <h1>{esc(c['zh'])}</h1><div class="en">{esc(c['en'])}</div>
  <div class="tagline">{c['tagline']}</div>
  <div class="illus">{c['illus']}</div>
</header>

<div class="facts">{facts}</div>

<section><h2><i>01</i>必訪景點 <span>SIGHTS</span></h2>{spots}</section>
<section><h2><i>02</i>非吃不可 <span>EAT</span></h2>{food}</section>
<section><h2><i>03</i>交通移動 <span>GETTING AROUND</span></h2>
  <ul class="dots">{li(c['transport'])}</ul></section>
<section><h2><i>04</i>行前必知 <span>BEFORE YOU GO</span></h2>
  <ul class="dots">{li(c['tips'])}</ul></section>
<section><h2><i>05</i>行程這樣排 <span>ITINERARY</span></h2><div class="days">{days}</div></section>
<section><h2><i>06</i>花費抓預算 <span>BUDGET</span></h2>
  <div class="budbox">{budget}<div class="budnote">{c['budget_note']}</div></div></section>

<footer><span>{esc(c['zh'])}．{esc(c['en'])}</span><b>{esc(c['footer'])}</b></footer>
</div>"""

    css = (CSS.replace('@ACCENT@', c['accent']).replace('@ACCENT2@', c['accent2'])
              .replace('@ACCENT3@', c['accent3']).replace('@TINT@', c['tint']))
    doc = f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=1080">
<title>{esc(c['zh'])}一頁式旅遊導覽（手機版）</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&family=Noto+Sans+TC:wght@400;500;700;900&display=swap">
<link rel="stylesheet" href="file:///root/fonts/fonts.css">
<style>{css}</style></head><body>{body}</body></html>"""
    p = OUT / c['file']
    p.write_text(doc, encoding='utf-8')
    print('wrote', p)
