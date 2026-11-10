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
            context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce', is_mobile=width <= 768, has_touch=width <= 768)
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
            whatsapp = page.get_by_role('link', name='Conversar pelo WhatsApp' if lang == 'pt' else 'Chat on WhatsApp', exact=True)
            record(f'{lang}-{width} WhatsApp contact', whatsapp.last.get_attribute('href') == 'https://wa.me/5581992796870')
            if width == 360:
                page.get_by_role('button', name='Abrir menu' if lang == 'pt' else 'Open menu').click()
                record(f'{lang} mobile menu', page.get_by_role('link', name='Sobre' if lang == 'pt' else 'About', exact=True).is_visible())
                record(f'{lang} mobile WhatsApp', whatsapp.first.is_visible() and whatsapp.first.get_attribute('href') == 'https://wa.me/5581992796870')
                page.screenshot(path=str(out / f'{lang}-360-menu.png'), animations='disabled')
            context.close()
        for project in ('pelada', 'giraffas', 'exclusiva', 'prime'):
            for width, height in ((360, 780), (1440, 900)):
                context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce', is_mobile=width == 360, has_touch=width == 360)
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                response = page.goto(f'{base}/{lang}/projects/{project}', wait_until='networkidle')
                key = f'{lang}/{project}/{width}'
                record(f'{key} route', response.status == 200 and page.get_by_role('heading', level=1).count() == 1)
                record(f'{key} image', page.locator('.case-page img').evaluate('image => image.naturalWidth > 0'))
                record(f'{key} overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
                record(f'{key} console', not errors, '; '.join(errors))
                record(f'{key} WhatsApp', page.get_by_role('link', name='Conversar pelo WhatsApp' if lang == 'pt' else 'Chat on WhatsApp', exact=True).last.get_attribute('href') == 'https://wa.me/5581992796870')
                page.screenshot(path=str(out / f'{lang}-{project}-{width}.png'), full_page=True, animations='disabled')
                if width == 1440:
                    page.locator('.case-topline .motion-control').click()
                    record(f'{key} pause', page.locator('.field').evaluate("el => el.classList.contains('is-still')"))
                    other = 'en' if lang == 'pt' else 'pt'
                    page.get_by_role('button', name=other.upper(), exact=True).click()
                    record(f'{lang}/{project} language context', page.url.endswith(f'/{other}/projects/{project}'))
                context.close()
    video_ready = os.environ.get('PORTFOLIO_RECORD_VIDEO') == '1'
    motion_options = {'viewport': {'width': 1440, 'height': 900}}
    if video_ready:
        motion_options.update({'record_video_dir': str(out / 'video'), 'record_video_size': {'width': 1440, 'height': 900}})
    motion_context = browser.new_context(**motion_options)
    page = motion_context.new_page()
    page.goto(f'{base}/pt', wait_until='networkidle')
    field = page.locator('.field')
    mesh = page.locator('.field__mesh')
    page.evaluate("window.__motionLongTasks=[]; new PerformanceObserver(list => { window.__motionLongTasks.push(...list.getEntries().map(entry => Math.round(entry.duration))) }).observe({entryTypes:['longtask']})")
    page.wait_for_timeout(500)
    page.screenshot(path=str(out / 'motion-top.png'))
    at_top = mesh.evaluate('el => getComputedStyle(el).transform')
    page.mouse.move(750, 460)
    page.wait_for_timeout(400)
    with_pointer = page.locator('.field__wash').evaluate('el => getComputedStyle(el).transform')
    page.mouse.move(1300, 700)
    page.wait_for_timeout(300)
    moved_pointer = page.locator('.field__wash').evaluate('el => getComputedStyle(el).transform')
    record('desktop pointer response', with_pointer != moved_pointer)
    hero_button = page.locator('.round-action')
    button_box = hero_button.bounding_box()
    page.mouse.move(button_box['x'] + button_box['width'] - 12, button_box['y'] + button_box['height'] / 2)
    page.wait_for_timeout(220)
    magnetic_offset = page.locator('.round-action .magnet-core').evaluate('el => {const m=new DOMMatrix(getComputedStyle(el).transform); return Math.hypot(m.m41,m.m42)}')
    button_after_move = hero_button.bounding_box()
    record('magnet keeps clickable area stable', abs(button_box['x'] - button_after_move['x']) < 1 and abs(button_box['y'] - button_after_move['y']) < 1)
    page.mouse.move(0, 0)
    page.wait_for_timeout(500)
    magnetic_return = page.locator('.round-action .magnet-core').evaluate('el => {const m=new DOMMatrix(getComputedStyle(el).transform); return Math.hypot(m.m41,m.m42)}')
    record('magnet moves and returns', magnetic_offset > 1 and magnetic_return < 1.5, f'{magnetic_offset:.2f}px -> {magnetic_return:.2f}px')
    for position in (240, 520, 900):
        page.evaluate('(y) => window.scrollTo({top:y,behavior:"instant"})', position)
        page.wait_for_timeout(280)
    after_slow = mesh.evaluate('el => getComputedStyle(el).transform')
    record('slow scroll changes field', at_top != after_slow)
    featured_visual = page.locator('.featured-section .visual-link')
    visual_box = featured_visual.bounding_box()
    page.mouse.move(visual_box['x'] + visual_box['width'] * .68, visual_box['y'] + 70)
    page.wait_for_timeout(250)
    image_tilt = featured_visual.locator('.project-visual').evaluate('el => getComputedStyle(el).transform')
    page.mouse.move(0, 0)
    page.wait_for_timeout(550)
    image_return = featured_visual.locator('.project-visual').evaluate('el => getComputedStyle(el).transform')
    record('image tilt responds and returns', image_tilt != image_return)
    page.screenshot(path=str(out / 'motion-pelada.png'))
    page.evaluate('window.scrollTo({top:2400,behavior:"instant"})')
    page.wait_for_timeout(400)
    after_fast = mesh.evaluate('el => getComputedStyle(el).transform')
    record('fast scroll changes field', after_slow != after_fast)
    page.screenshot(path=str(out / 'motion-projects.png'))
    page.evaluate('window.scrollTo({top:450,behavior:"instant"})')
    page.wait_for_timeout(450)
    after_reverse = mesh.evaluate('el => getComputedStyle(el).transform')
    record('reverse scroll changes field', after_reverse != after_fast and after_reverse != after_slow)
    page.screenshot(path=str(out / 'motion-reverse.png'), animations='disabled')
    page.set_viewport_size({'width': 1200, 'height': 800})
    page.wait_for_timeout(350)
    after_resize = mesh.evaluate('el => getComputedStyle(el).transform')
    record('resize updates composition', after_resize != after_reverse)
    long_tasks = page.evaluate('window.__motionLongTasks || []')
    page.locator('.motion-control').click()
    paused_mesh = mesh.evaluate('el => getComputedStyle(el).transform')
    page.evaluate('window.scrollTo({top:1500,behavior:"instant"})')
    page.mouse.move(500, 300)
    page.wait_for_timeout(400)
    record('motion pause freezes scroll and pointer', field.evaluate("el => el.classList.contains('is-still')") and mesh.evaluate('el => getComputedStyle(el).transform') == paused_mesh)
    record('motion pause removes image parallax', page.locator('.project-visual img').first.evaluate('el => getComputedStyle(el).transform') == 'none')
    page.reload()
    record('motion pause persists', page.locator('.motion-control').get_attribute('aria-pressed') == 'true')
    page.locator('.motion-control').click()
    page.emulate_media(reduced_motion='reduce')
    reduced_mesh = mesh.evaluate('el => getComputedStyle(el).transform')
    page.evaluate('window.scrollTo({top:2200,behavior:"instant"})')
    page.wait_for_timeout(250)
    record('reduced motion freezes parallax', page.locator('html').get_attribute('data-motion') == 'off' and mesh.evaluate('el => getComputedStyle(el).transform') == reduced_mesh)
    record('reduced motion removes magnetic shift', page.locator('.round-action .magnet-core').evaluate('el => getComputedStyle(el).transform') == 'none')
    page.emulate_media(reduced_motion='no-preference')
    page.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, get:()=>true}); document.dispatchEvent(new Event('visibilitychange'))")
    record('hidden tab pauses', field.evaluate("el => el.classList.contains('is-still')"))
    page.close()
    motion_context.close()
    for lang in ('pt', 'en'):
        mobile = browser.new_context(viewport={'width': 360, 'height': 780}, is_mobile=True, has_touch=True)
        page = mobile.new_page()
        page.goto(f'{base}/{lang}', wait_until='networkidle')
        record(f'{lang} mobile coarse pointer', not page.evaluate("matchMedia('(hover: hover) and (pointer: fine)').matches"))
        start_transform = page.locator('.field__mesh').evaluate('el => getComputedStyle(el).transform')
        page.evaluate('window.scrollTo({top:700,behavior:"instant"})')
        page.wait_for_timeout(400)
        record(f'{lang} mobile scroll depth', start_transform != page.locator('.field__mesh').evaluate('el => getComputedStyle(el).transform'))
        page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
        page.wait_for_timeout(180)
        page.keyboard.press('Tab')
        record(f'{lang} keyboard skip link', page.evaluate('document.activeElement?.classList.contains("skip-link")'))
        page.get_by_role('button', name='Abrir menu' if lang == 'pt' else 'Open menu').focus()
        page.keyboard.press('Enter')
        record(f'{lang} keyboard menu', page.get_by_role('link', name='Conversar pelo WhatsApp' if lang == 'pt' else 'Chat on WhatsApp', exact=True).first.is_visible())
        mobile.close()
    browser.close()

summary = {'sha': sha, 'base_url': base, 'video_available': video_ready, 'headless_long_tasks_ms': long_tasks, 'passed': sum(r['passed'] for r in results), 'total': len(results), 'results': results}
(out / 'checks.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
failed = [r for r in results if not r['passed']]
lines = [f'# Delivery check — {sha}', '', f'Checks: {summary["passed"]}/{summary["total"]}', '', 'Screenshots: PT/EN home at 360, 768 and 1440 px; project pages at 360 and 1440 px; motion at top, PeladaPro, projects and reverse scroll.', f'Headless long tasks during motion sampling: {long_tasks} ms.', f'Video: {"recorded" if video_ready else "not recorded (optional FFmpeg unavailable or disabled)"}.', '', 'Automated checks and headless timings do not replace visual review or physical-device testing.', '']
if failed:
    lines += ['## Failures', ''] + [f'- {r["check"]}: {r["detail"]}' for r in failed]
(out / 'report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(out / 'report.md')
for item in failed:
    print('FAIL', item['check'], item['detail'])
if failed:
    raise SystemExit(1)
