from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.tools' / 'python'))
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / 'public' / 'projects'
OUT.mkdir(parents=True, exist_ok=True)
sites = {
    'pelada': 'https://peladaprohub.vercel.app/',
    'giraffas': 'https://expansao-giraffas.vercel.app/',
    'exclusiva': 'https://exclusivamodas.vercel.app/',
    'prime': 'https://juniormodelo.vercel.app/',
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', args=['--no-sandbox'])
    for name, url in sites.items():
        for suffix, viewport in [('', {'width': 1440, 'height': 900}), ('-mobile', {'width': 390, 'height': 620})]:
            page = browser.new_page(viewport=viewport, device_scale_factor=1, reduced_motion='reduce')
            try:
                response = page.goto(url, wait_until='domcontentloaded', timeout=30000)
                page.wait_for_timeout(1800)
                target = OUT / f'{name}{suffix}.jpg'
                page.screenshot(path=str(target), type='jpeg', quality=82, animations='disabled')
                print(name + suffix, 'status', response.status if response else None, 'title', page.title(), 'image', str(target))
            except Exception as exc:
                print(name + suffix, 'ERROR', type(exc).__name__, str(exc)[:150])
            finally:
                page.close()
    browser.close()
