# -*- coding: utf-8 -*-
"""產生曼谷 / 清邁 / 河內 三張旅遊書風格一頁式導覽 HTML"""
import html, os, pathlib

OUT = pathlib.Path(__file__).parent

CSS = """
:root{
  --paper:#FBF6EA; --ink:#2C241C; --sub:#6B6053; --line:#D9CEBB;
  --accent:@ACCENT@; --accent2:@ACCENT2@; --accent3:@ACCENT3@;
  --tint:@TINT@;
}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1400px;background:var(--paper);color:var(--ink);
  font-family:'Noto Sans TC','Noto Sans CJK TC','WenQuanYi Zen Hei',sans-serif;
  -webkit-font-smoothing:antialiased;}
.page{position:relative;padding:34px 40px 30px;overflow:hidden}
.page::before{content:'';position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle at 1px 1px, rgba(120,100,70,.14) 1px, transparent 0);
  background-size:22px 22px;opacity:.5}
.frame{position:absolute;inset:14px;border:2px solid var(--line);border-radius:4px;pointer-events:none}
.frame::after{content:'';position:absolute;inset:5px;border:1px solid var(--line);opacity:.6;border-radius:2px}
.blob{position:absolute;border-radius:48% 52% 60% 40%/55% 45% 55% 45%;filter:blur(2px);opacity:.5;pointer-events:none}

/* ---------- header ---------- */
header{position:relative;display:flex;align-items:flex-end;gap:26px;
  padding:6px 0 16px;border-bottom:3px double var(--line);margin-bottom:14px}
.htxt{flex:1}
.kicker{font-size:12px;letter-spacing:.42em;color:var(--accent2);font-weight:700}
h1{font-family:'Noto Serif TC',serif;font-weight:900;font-size:62px;line-height:1;
  letter-spacing:.04em;margin:6px 0 2px;color:var(--ink)}
h1 small{font-family:'Noto Sans TC',sans-serif;font-size:19px;font-weight:500;letter-spacing:.16em;
  color:var(--accent);margin-left:14px;vertical-align:6px}
.tagline{font-size:15.5px;color:var(--sub);letter-spacing:.06em;margin-top:7px}
.tagline b{color:var(--accent);font-weight:700}
.seal{position:absolute;right:262px;top:2px;width:86px;height:86px;border:2.5px solid var(--accent3);
  border-radius:50%;color:var(--accent3);display:flex;flex-direction:column;align-items:center;
  justify-content:center;transform:rotate(-11deg);opacity:.85}
.seal b{font-family:'Noto Serif TC',serif;font-size:21px;line-height:1.15;letter-spacing:.06em}
.seal span{font-size:9px;letter-spacing:.14em;margin-top:3px}
.illus{width:236px;flex:none;margin-left:80px}

/* ---------- facts ---------- */
.facts{display:grid;grid-template-columns:repeat(7,1fr);gap:0;border:1.5px solid var(--line);
  border-radius:6px;background:#fff;margin-bottom:16px;overflow:hidden}
.fact{padding:8px 10px;border-right:1px dashed var(--line)}
.fact:last-child{border-right:0}
.fact .k{font-size:10px;letter-spacing:.16em;color:var(--accent2);font-weight:700}
.fact .v{font-size:13px;font-weight:700;margin-top:3px;line-height:1.35}
.fact .v em{font-style:normal;font-size:11px;font-weight:400;color:var(--sub);display:block}

/* ---------- grid ---------- */
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
.card{background:#fff;border:1.5px solid var(--line);border-radius:7px;padding:12px 14px 13px;
  position:relative;box-shadow:2px 3px 0 rgba(180,165,135,.22)}
.card.tint{background:var(--tint)}
h2{font-family:'Noto Serif TC',serif;font-size:20px;letter-spacing:.06em;display:flex;
  align-items:center;gap:9px;margin-bottom:9px;color:var(--ink)}
h2 i{display:inline-flex;width:25px;height:25px;border-radius:50%;background:var(--accent);
  color:#fff;font-style:normal;font-size:13px;align-items:center;justify-content:center;flex:none;
  font-family:'Noto Sans TC',sans-serif;font-weight:700}
h2 span{font-size:10.5px;letter-spacing:.2em;color:var(--sub);font-weight:400;
  font-family:'Noto Sans TC',sans-serif}
h2::after{content:'';flex:1;height:0;border-top:2px dotted var(--line)}
h3{font-size:12px;letter-spacing:.1em;color:#fff;background:var(--accent2);display:inline-block;
  padding:2.5px 10px;border-radius:3px;margin:9px 0 7px}
h3:first-of-type{margin-top:2px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:5px 16px}
.spot{display:flex;gap:8px;padding:4px 0;border-bottom:1px dotted #E7DECD}
.spot:last-child{border-bottom:0}
.no{flex:none;width:19px;height:19px;border-radius:50%;border:1.5px solid var(--accent);
  color:var(--accent);font-size:10.5px;font-weight:700;display:flex;align-items:center;
  justify-content:center;margin-top:2px}
.nm{font-size:13.5px;font-weight:700;line-height:1.3}
.nm em{font-style:normal;font-size:9.5px;color:#A0947F;letter-spacing:.04em;font-weight:400;
  margin-left:5px}
.ds{font-size:11.8px;color:#4C4438;line-height:1.5;margin-top:1px}
.pill{display:inline-block;font-size:10px;padding:.5px 6px;border:1px solid var(--accent);
  color:var(--accent);border-radius:9px;margin-left:5px;vertical-align:1px;white-space:nowrap}
.pill.g{border-color:#9AA88F;color:#5F7052}

/* food */
.food{display:flex;gap:8px;padding:4.5px 0;border-bottom:1px dotted #E7DECD}
.food:last-child{border-bottom:0}
.food .ic{flex:none;width:20px;height:20px;margin-top:2px}
.pricetag{font-size:10.5px;color:#fff;background:var(--accent3);border-radius:3px;padding:0 5px;
  margin-left:5px;vertical-align:1.5px;white-space:nowrap}

/* list */
ul.dots{list-style:none}
ul.dots li{font-size:11.8px;line-height:1.55;padding-left:14px;position:relative;margin-bottom:4.5px;
  color:#463E33}
ul.dots li::before{content:'';position:absolute;left:2px;top:7px;width:5px;height:5px;
  background:var(--accent);border-radius:50%}
ul.dots li b{color:var(--ink)}

/* itinerary */
.days{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.day{border:1.5px dashed var(--line);border-radius:6px;padding:8px 10px 9px;background:#fff}
.day .dh{font-family:'Noto Serif TC',serif;font-size:15px;color:var(--accent);font-weight:700;
  border-bottom:1px solid var(--line);padding-bottom:4px;margin-bottom:5px}
.day .dh em{font-style:normal;font-size:10.5px;color:var(--sub);margin-left:6px;font-family:'Noto Sans TC'}
.step{font-size:11.5px;line-height:1.5;color:#463E33;padding-left:12px;position:relative;margin-bottom:2px}
.step::before{content:'▸';position:absolute;left:0;color:var(--accent2);font-size:10px}
.note{font-size:10.5px;color:var(--sub);margin-top:4px;border-top:1px dotted var(--line);padding-top:4px}

/* budget */
.bud{display:flex;justify-content:space-between;font-size:12px;padding:4px 0;
  border-bottom:1px dotted #E7DECD}
.bud:last-child{border-bottom:0}
.bud b{font-weight:700}
.bud span{color:var(--accent);font-weight:700}
.tape{position:absolute;width:74px;height:20px;background:rgba(210,180,120,.35);
  border-left:1px dashed rgba(255,255,255,.7);border-right:1px dashed rgba(255,255,255,.7);
  top:-9px;left:50%;margin-left:-37px;transform:rotate(-1.6deg)}
footer{margin-top:14px;display:flex;justify-content:space-between;align-items:center;
  border-top:3px double var(--line);padding-top:9px;font-size:10.5px;color:var(--sub);
  letter-spacing:.14em}
footer b{color:var(--accent);letter-spacing:.2em}
"""

ICON_FOOD = """<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="1.8"
 stroke-linecap="round"><path d="M6 3v8a2 2 0 002 2h0a2 2 0 002-2V3M8 13v8M18 3c-1.6 1.4-2.2 3.2-2.2 5.2 0 1.6.7 2.6 2.2 2.8V21"/></svg>"""


def esc(s):
    return html.escape(str(s), quote=False)


def spots_html(groups, accent):
    out = []
    n = 1
    for title, items in groups:
        out.append('<h3>%s</h3><div class="two">' % esc(title))
        for it in items:
            en = '<em>%s</em>' % esc(it[1]) if it[1] else ''
            pill = '<span class="pill">%s</span>' % esc(it[3]) if len(it) > 3 and it[3] else ''
            out.append(
                '<div class="spot"><div class="no">%d</div><div>'
                '<div class="nm">%s%s%s</div><div class="ds">%s</div></div></div>'
                % (n, esc(it[0]), en, pill, esc(it[2])))
            n += 1
        out.append('</div>')
    return ''.join(out)


def food_html(items, accent):
    out = []
    for nm, en, ds, price in items:
        en = '<em>%s</em>' % esc(en) if en else ''
        pr = '<span class="pricetag">%s</span>' % esc(price) if price else ''
        out.append('<div class="food">%s<div><div class="nm">%s%s%s</div>'
                   '<div class="ds">%s</div></div></div>'
                   % (ICON_FOOD % accent, esc(nm), en, pr, esc(ds)))
    return ''.join(out)


def build(c):
    facts = ''.join(
        '<div class="fact"><div class="k">%s</div><div class="v">%s<em>%s</em></div></div>'
        % (esc(k), esc(v), esc(s)) for k, v, s in c['facts'])
    days = ''.join(
        '<div class="day"><div class="dh">%s<em>%s</em></div>%s%s</div>'
        % (esc(d[0]), esc(d[1]),
           ''.join('<div class="step">%s</div>' % esc(s) for s in d[2]),
           '<div class="note">%s</div>' % esc(d[3]) if d[3] else '')
        for d in c['days'])
    budget = ''.join('<div class="bud"><b>%s</b><span>%s</span></div>' % (esc(a), esc(b))
                     for a, b in c['budget'])
    li = lambda xs: ''.join('<li>%s</li>' % x for x in xs)

    body = f"""<div class="page">
<div class="frame"></div>
{c['blobs']}
<header>
  <div class="htxt">
    <div class="kicker">{esc(c['kicker'])}</div>
    <h1>{esc(c['zh'])}<small>{esc(c['en'])}</small></h1>
    <div class="tagline">{c['tagline']}</div>
  </div>
  <div class="seal"><b>{esc(c['seal'])}</b><span>TRAVEL NOTE</span></div>
  <div class="illus">{c['illus']}</div>
</header>

<div class="facts">{facts}</div>

<div class="grid">
  <div class="card" style="grid-column:span 8">
    <div class="tape"></div>
    <h2><i>01</i>必訪景點 <span>SIGHTS &amp; PLACES</span></h2>
    {spots_html(c['spots'], c['accent'])}
  </div>
  <div class="card tint" style="grid-column:span 4">
    <h2><i>02</i>非吃不可 <span>EAT LIKE A LOCAL</span></h2>
    {food_html(c['food'], c['accent'])}
  </div>

  <div class="card" style="grid-column:span 4">
    <h2><i>03</i>交通移動 <span>GETTING AROUND</span></h2>
    <ul class="dots">{li(c['transport'])}</ul>
  </div>
  <div class="card" style="grid-column:span 4">
    <h2><i>04</i>行前必知 <span>KNOW BEFORE YOU GO</span></h2>
    <ul class="dots">{li(c['tips'])}</ul>
  </div>
  <div class="card tint" style="grid-column:span 4">
    <h2><i>05</i>花費抓預算 <span>BUDGET</span></h2>
    {budget}
    <div class="note" style="border-top:1px dotted var(--line);margin-top:6px">{c['budget_note']}</div>
  </div>

  <div class="card" style="grid-column:span 12">
    <h2><i>06</i>行程這樣排 <span>SUGGESTED ITINERARY</span></h2>
    <div class="days">{days}</div>
  </div>
</div>

<footer><span>{esc(c['zh'])}．{esc(c['en'])}</span>
<b>{esc(c['footer'])}</b>
<span>ONE-PAGE TRAVEL GUIDE</span></footer>
</div>"""

    css = (CSS.replace('@ACCENT@', c['accent']).replace('@ACCENT2@', c['accent2'])
              .replace('@ACCENT3@', c['accent3']).replace('@TINT@', c['tint']))
    doc = f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<title>{esc(c['zh'])}一頁式旅遊導覽</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&family=Noto+Sans+TC:wght@400;500;700;900&display=swap">
<link rel="stylesheet" href="file:///root/fonts/fonts.css">
<style>{css}</style></head><body>{body}</body></html>"""
    p = OUT / c['file']
    p.write_text(doc, encoding='utf-8')
    print('wrote', p)
