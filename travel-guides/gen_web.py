# -*- coding: utf-8 -*-
"""把 plans.py 的三套行程輸出成互動網頁（分頁 + Google Maps 連結）"""
import html, re, urllib.parse, pathlib, importlib

import plan_build
_collected = []
plan_build.build = lambda p: _collected.append(p)   # 攔截，只取資料
importlib.import_module('plans')
PLANS = _collected

OUT = pathlib.Path(__file__).parent
NO_MAP = ('出發', 'Check-in', '回飯店', '前往機場', '取行李', '課程結束', '回市區',
          '飯店早餐', '包車', '一日團', '入住', '泳池')
PREFIX = re.compile(r'^[^：]{1,6}：')


def txt(s):
    return re.sub(r'<[^>]+>', '', s).strip()


def clean(s):
    s = txt(s)
    s = re.sub(r'[（(][^）)]*[）)]', ' ', s)
    s = re.sub(r'[＋+／/]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip(' ．・')


def query(zh, en):
    name = PREFIX.sub('', clean(zh))
    en = clean(en)
    return ' '.join(x for x in (name, en, 'Bangkok') if x)


def maps_search(q):
    return 'https://www.google.com/maps/search/?api=1&query=' + urllib.parse.quote(q)


def linkable(zh):
    t = txt(zh)
    return not any(k in t for k in NO_MAP)


def day_route(stops):
    pts = [query(z, e) for _, z, e, _ in stops if linkable(z)]
    if len(pts) < 2:
        return ''
    q = urllib.parse.urlencode({'api': 1, 'origin': pts[0], 'destination': pts[-1],
                                'waypoints': '|'.join(pts[1:-1]), 'travelmode': 'transit'})
    return 'https://www.google.com/maps/dir/?' + q


def esc(s):
    return html.escape(s, quote=True)


PIN = ('<svg class="pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 '
       '5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>')

panels, tabs = [], []
for i, p in enumerate(PLANS):
    key = p['tag'].lower()
    days = []
    for title, theme, area, stops in p['days']:
        rows = []
        for t, zh, en, note in stops:
            label = zh  # 已含 <span> 標記
            if linkable(zh):
                rows.append(
                    f'<li class="stop"><span class="time">{esc(t)}</span>'
                    f'<span class="body"><a class="place" href="{esc(maps_search(query(zh, en)))}"'
                    f' target="_blank" rel="noopener">{label}'
                    f'{f"<em>{esc(txt(en))}</em>" if txt(en) else ""}{PIN}</a>'
                    f'<span class="note">{note}</span></span></li>')
            else:
                rows.append(
                    f'<li class="stop"><span class="time">{esc(t)}</span>'
                    f'<span class="body"><span class="place plain">{label}</span>'
                    f'<span class="note">{note}</span></span></li>')
        route = day_route(stops)
        btn = (f'<a class="route" href="{esc(route)}" target="_blank" rel="noopener">'
               f'路線一次開 {PIN}</a>') if route else ''
        days.append(
            f'<section class="day"><header class="day-h"><h3>{esc(title)}</h3>'
            f'<p class="day-t">{esc(theme)}</p><p class="area">{esc(area)}</p>{btn}</header>'
            f'<ol class="stops">{"".join(rows)}</ol></section>')

    notes = ''.join(f'<li>{n}</li>' for n in p['notes'])
    panels.append(
        f'<div class="plan theme-{key}" id="panel-{key}" role="tabpanel" '
        f'aria-labelledby="tab-{key}"{"" if i == 0 else " hidden"}>'
        f'<div class="lead"><p class="lead-t">{p["lead"]}</p>'
        f'<p class="who">{esc(txt(p["who"]))}</p></div>'
        f'{"".join(days)}'
        f'<section class="notes"><h3>路線筆記</h3><ul>{notes}</ul></section></div>')
    tabs.append(
        f'<button class="tab theme-{key}" id="tab-{key}" role="tab" data-key="{key}" '
        f'aria-controls="panel-{key}" aria-selected="{"true" if i == 0 else "false"}" '
        f'tabindex="{0 if i == 0 else -1}">'
        f'<span class="letter">{esc(p["tag"])}</span>'
        f'<span class="tname">{esc(p["zh"].split("．")[0])}</span>'
        f'<span class="ten">{esc(p["en"])}</span></button>')

TEMPLATE = pathlib.Path('web_template.html').read_text(encoding='utf-8')
doc = TEMPLATE.replace('<!--TABS-->', ''.join(tabs)).replace('<!--PANELS-->', ''.join(panels))
(OUT / 'bangkok-planner.html').write_text(doc, encoding='utf-8')
print('wrote bangkok-planner.html', len(doc), 'bytes')
