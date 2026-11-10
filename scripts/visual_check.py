from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.tools' / 'python'))
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'screenshots'
OUT.mkdir(parents=True, exist_ok=True)
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=CHROME, args=['--no-sandbox'])
    for width, height in [(360, 780), (768, 1024), (1440, 900)]:
        page = browser.new_page(viewport={ 'width': width, 'height': height }, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('http://127.0.0.1:5173/pt', wait_until='networkidle')
        page.locator('.project-visual img').evaluate_all('''images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); }))''')
        page.screenshot(path=str(OUT / f'home-{width}.png'), full_page=True)
        overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth')
        overflowing = page.evaluate('''() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 5).map(el => el.className || el.tagName)''')
        print(f'{width}: title={page.title()!r} overflow={overflow} offending={overflowing} errors={errors} projects={page.locator(".project-visual img").count()}')
        if width == 360:
            page.get_by_role('button', name='Abrir menu').click()
            print('mobile menu visible:', page.get_by_role('link', name='Sobre', exact=True).is_visible())
            page.get_by_role('link', name='Sobre', exact=True).click()
            print('mobile section navigation:', page.url, 'menu closed:', page.locator('.nav--open').count() == 0)
            page.get_by_role('button', name='Abrir menu').click()
            page.get_by_role('button', name='EN', exact=True).click()
            print('English route with section:', page.url, 'English title:', page.title())
            print('English body:', page.get_by_text('Let’s talk.').count(), 'English image alt:', page.get_by_alt_text('Real screenshot of the PeladaPro homepage').count())
            page.get_by_role('button', name='Pause animation').click()
            print('animation paused:', page.locator('.field.is-still').count())
            page.reload(wait_until='networkidle')
            print('pause persisted:', page.locator('.field.is-still').count(), 'reload language:', page.locator('html').get_attribute('lang'))
            print('Giraffas code link hidden:', page.locator('a[href*="Site_Gess-"]').count() == 0)
            print('contact links:', page.locator('a[href="https://www.linkedin.com/in/gabrielcarvalhours"]').count(), page.locator('a[href="https://github.com/gabbcarvzx"]').count())
        if width == 768:
            page.emulate_media(reduced_motion='reduce')
            print('reduced motion:', page.evaluate('getComputedStyle(document.querySelector(".field__halo")).animationDuration'))
        if width == 1440:
            page.keyboard.press('Tab')
            print('keyboard focus:', page.evaluate('document.activeElement?.className'))
        page.close()
    browser.close()
