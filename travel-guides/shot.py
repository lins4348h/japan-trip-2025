import sys, pathlib
from playwright.sync_api import sync_playwright
D = pathlib.Path(__file__).parent
files = sorted(D.glob('0*.html'))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--allow-file-access-from-files','--font-render-hinting=none'])
    pg = b.new_page(viewport={'width':1080,'height':2400}, device_scale_factor=2)
    for f in files:
        pg.goto(f.as_uri()); pg.wait_for_timeout(1200)
        el = pg.query_selector('.page')
        box = el.bounding_box()
        print(f.name, 'size', round(box['width']), 'x', round(box['height']))
        pg.set_viewport_size({'width': 1080, 'height': int(box['height']) + 2})
        pg.wait_for_timeout(300)
        el.screenshot(path=str(D/(f.stem+'.png')))
    b.close()
