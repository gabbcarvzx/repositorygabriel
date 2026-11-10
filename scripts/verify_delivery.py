"""Deterministic browser checks and screenshots; visual judgment remains human."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
try:
    from playwright.sync_api import sync_playwright
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT / '.tools' / 'python'))
    from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='http://127.0.0.1:5173')
parser.add_argument('--sha', default=os.environ.get('GITHUB_SHA'))
parser.add_argument('--output', default='delivery-reports')
parser.add_argument('--expect-version', action='store_true')
args = parser.parse_args()
sha = args.sha or subprocess.check_output(['git', '-c', f'safe.directory={ROOT.as_posix()}', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
out = ROOT / args.output / sha
out.mkdir(parents=True, exist_ok=True)
base = args.base_url.rstrip('/')
for attempt in range(30):
    try:
        with urlopen(base, timeout=2) as response:
            if response.status == 200:
                break
    except Exception:
        time.sleep(1)
else:
    raise SystemExit(f'Server did not respond: {base}')

results = []
def record(name, ok, detail=''):
    results.append({'check': name, 'passed': bool(ok), 'detail': detail})

chrome = os.environ.get('CHROME_PATH')
if not chrome and Path(r'C:\Program Files\Google\Chrome\Application\chrome.exe').exists():
    chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

with sync_playwright() as playwright:
    launch = {'headless': True}
    if chrome:
        launch['executable_path'] = chrome
    browser = playwright.chromium.launch(**launch)
    for lang in ('pt', 'en'):
        for width, height in ((360, 780), (768, 1024), (1440, 900)):
            context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
            page.goto(f'{base}/{lang}', wait_until='networkidle')
            page.locator('.project-visual img').evaluate_all("images => Promise.all(images.map(i => {i.loading='eager'; return i.decode()}))")
            page.screenshot(path=str(out / f'{lang}-{width}.png'), full_page=True, animations='disabled')
            record(f'{lang}-{width} language', page.locator('html').get_attribute('lang') == ('pt-BR' if lang == 'pt' else 'en'))
            record(f'{lang}-{width} title', page.get_by_role('heading', name='Gabriel Carvalho.').count() == 1)
            if args.expect_version:
                record(f'{lang}-{width} version', page.locator('meta[name="portfolio-version"]').get_attribute('content') == sha)
            record(f'{lang}-{width} images', page.locator('.project-visual img').evaluate_all('images => images.length === 4 && images.every(i => i.naturalWidth > 0)'))
            record(f'{lang}-{width} overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
            record(f'{lang}-{width} console', not errors, '; '.join(errors))
            record(f'{lang}-{width} internal links', page.eval_on_selector_all('a[href^="/"]', 'links => links.every(a => a.pathname.startsWith("/pt") || a.pathname.startsWith("/en"))'))
            if width == 360:
                page.get_by_role('button', name='Abrir menu' if lang == 'pt' else 'Open menu').click()
                record(f'{lang} mobile menu', page.get_by_role('link', name='Sobre' if lang == 'pt' else 'About', exact=True).is_visible())
                page.screenshot(path=str(out / f'{lang}-360-menu.png'), animations='disabled')
            context.close()
        for project in ('pelada', 'giraffas', 'exclusiva', 'prime'):
            for width, height in ((360, 780), (1440, 900)):
                context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                response = page.goto(f'{base}/{lang}/projects/{project}', wait_until='networkidle')
                key = f'{lang}/{project}/{width}'
                record(f'{key} route', response.status == 200 and page.get_by_role('heading', level=1).count() == 1)
                record(f'{key} image', page.locator('.case-page img').evaluate('image => image.naturalWidth > 0'))
                record(f'{key} overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
                record(f'{key} console', not errors, '; '.join(errors))
                page.screenshot(path=str(out / f'{lang}-{project}-{width}.png'), full_page=True, animations='disabled')
                if width == 1440:
                    other = 'en' if lang == 'pt' else 'pt'
                    page.get_by_role('button', name=other.upper(), exact=True).click()
                    record(f'{lang}/{project} language context', page.url.endswith(f'/{other}/projects/{project}'))
                context.close()
    page = browser.new_page()
    page.goto(f'{base}/pt', wait_until='networkidle')
    initial_shift = page.locator('.field').evaluate("el => el.style.getPropertyValue('--field-shift')")
    page.evaluate("window.scrollTo({top:600,behavior:'instant'})")
    page.wait_for_timeout(100)
    scrolled_shift = page.locator('.field').evaluate("el => el.style.getPropertyValue('--field-shift')")
    record('scroll changes field depth', initial_shift != scrolled_shift, f'{initial_shift} -> {scrolled_shift}')
    page.locator('.motion-control').click()
    record('motion pause', page.locator('.field').evaluate("el => el.classList.contains('is-still') && [...el.children].every(child => getComputedStyle(child).animationPlayState === 'paused')"))
    page.reload()
    record('motion pause persists', page.locator('.motion-control').get_attribute('aria-pressed') == 'true')
    page.locator('.motion-control').click()
    page.emulate_media(reduced_motion='reduce')
    record('reduced motion', page.locator('.field__halo').evaluate("el => getComputedStyle(el).animationName === 'none'"))
    page.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, get:()=>true}); document.dispatchEvent(new Event('visibilitychange'))")
    record('hidden tab pauses', page.locator('.field').evaluate("el => el.classList.contains('is-still')"))
    page.close()
    browser.close()

summary = {'sha': sha, 'base_url': base, 'passed': sum(r['passed'] for r in results), 'total': len(results), 'results': results}
(out / 'checks.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
failed = [r for r in results if not r['passed']]
lines = [f'# Delivery check — {sha}', '', f'Checks: {summary["passed"]}/{summary["total"]}', '', 'Screenshots: PT/EN home at 360, 768 and 1440 px, plus project pages at 360 and 1440 px.', '', 'Automated checks do not replace visual review or physical-device testing.', '']
if failed:
    lines += ['## Failures', ''] + [f'- {r["check"]}: {r["detail"]}' for r in failed]
(out / 'report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(out / 'report.md')
for item in failed:
    print('FAIL', item['check'], item['detail'])
if failed:
    raise SystemExit(1)
