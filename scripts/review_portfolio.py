from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.tools' / 'python'))
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
phase = sys.argv[1] if len(sys.argv) > 1 else 'baseline'
OUT = ROOT / 'docs' / 'review' / phase
OUT.mkdir(parents=True, exist_ok=True)
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

def measure(page):
    return page.evaluate('''() => {
      const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect();
        return {x:Math.round(r.x), y:Math.round(r.y), width:Math.round(r.width), height:Math.round(r.height), right:Math.round(r.right)} };
      const visibleOverflow = [...document.querySelectorAll('body *')].filter(el => {
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return r.width && r.right > innerWidth + 1 && s.visibility !== 'hidden' && s.display !== 'none';
      }).slice(0, 12).map(el => ({selector:el.className || el.tagName, right:Math.round(el.getBoundingClientRect().right),
        overflow:getComputedStyle(el).overflow, parent:el.parentElement?.className || el.parentElement?.tagName}));
      return {title:document.title, lang:document.documentElement.lang,
        scrollWidth:document.documentElement.scrollWidth, viewport:innerWidth,
        hero:rect('.hero h1'), heroLead:rect('.hero__top p'), heroAction:rect('.round-action'),
        contact:rect('.contact-section h2'), images:[...document.querySelectorAll('.project-visual img')].map(i =>
          ({src:i.getAttribute('src'), currentSrc:i.currentSrc, loaded:i.naturalWidth>0, natural:[i.naturalWidth,i.naturalHeight], box:[Math.round(i.clientWidth),Math.round(i.clientHeight)], fit:getComputedStyle(i).objectFit})),
        visibleOverflow};
    }''')

def motion_state(page):
    return page.evaluate('''() => ({
      scrollY, hidden:document.hidden, fieldClass:document.querySelector('.field').className,
      shift:document.querySelector('.field').style.getPropertyValue('--field-shift'),
      opacity:document.querySelector('.field').style.getPropertyValue('--field-opacity'),
      halo:getComputedStyle(document.querySelector('.field__halo')).transform,
      haloPlay:getComputedStyle(document.querySelector('.field__halo')).animationPlayState,
      haloDuration:getComputedStyle(document.querySelector('.field__halo')).animationDuration,
      lines:getComputedStyle(document.querySelector('.field__lines')).transform,
      linesPlay:getComputedStyle(document.querySelector('.field__lines')).animationPlayState,
      linesDuration:getComputedStyle(document.querySelector('.field__lines')).animationDuration,
      heroTop:document.querySelector('.hero h1').getBoundingClientRect().top
    })''')

report = {}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=CHROME, args=['--no-sandbox'])
    for lang in ['pt', 'en']:
        for width, height in [(360, 780), (768, 1024), (1440, 900)]:
            context = browser.new_context(viewport={'width':width,'height':height}, device_scale_factor=1)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            page.goto(f'http://127.0.0.1:5173/{lang}', wait_until='networkidle')
            page.locator('.project-visual img').evaluate_all("images => Promise.all(images.map(i => {i.loading='eager'; return i.decode()}))")
            page.screenshot(path=str(OUT / f'{lang}-{width}.png'), full_page=True, animations='disabled')
            data = measure(page)
            data['pageErrors'] = errors
            if width == 360:
                page.get_by_role('button', name='Abrir menu' if lang == 'pt' else 'Open menu').click()
                data['mobileMenuVisible'] = page.get_by_role('link', name='Sobre' if lang == 'pt' else 'About', exact=True).is_visible()
                page.screenshot(path=str(OUT / f'{lang}-360-menu.png'), animations='disabled')
            report[f'{lang}-{width}'] = data
            context.close()

    context = browser.new_context(viewport={'width':1440,'height':900})
    page = context.new_page()
    page.goto('http://127.0.0.1:5173/pt', wait_until='networkidle')
    report['motion'] = {'start':motion_state(page)}
    page.screenshot(path=str(OUT / 'motion-idle-start.png'))
    page.wait_for_timeout(1100)
    report['motion']['idleAfter1100ms'] = motion_state(page)
    page.screenshot(path=str(OUT / 'motion-idle-1100ms.png'))
    page.evaluate("window.scrollTo({top:650,behavior:'instant'})")
    page.wait_for_timeout(100)
    report['motion']['scroll650'] = motion_state(page)
    page.screenshot(path=str(OUT / 'motion-scroll650.png'))
    page.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, get:()=>true}); document.dispatchEvent(new Event('visibilitychange'))")
    report['motion']['simulatedHidden'] = motion_state(page)
    page.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, get:()=>false}); document.dispatchEvent(new Event('visibilitychange'))")
    report['motion']['simulatedReturn'] = motion_state(page)
    page.locator('.motion-control').click()
    report['motion']['paused'] = motion_state(page)
    page.wait_for_timeout(1100)
    report['motion']['pausedAfter1100ms'] = motion_state(page)
    page.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, get:()=>true}); document.dispatchEvent(new Event('visibilitychange'))")
    page.evaluate("Object.defineProperty(document, 'hidden', {configurable:true, get:()=>false}); document.dispatchEvent(new Event('visibilitychange'))")
    report['motion']['pausedAfterReturn'] = motion_state(page)
    page.locator('.motion-control').click()
    page.emulate_media(reduced_motion='reduce')
    report['motion']['reduced'] = motion_state(page)
    page.wait_for_timeout(500)
    report['motion']['reducedAfter500ms'] = motion_state(page)
    page.emulate_media(reduced_motion='no-preference')
    page.evaluate("window.scrollTo({top:2400,behavior:'instant'})")
    page.wait_for_timeout(150)
    report['motion']['fieldOutOfView'] = motion_state(page)
    page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
    page.wait_for_timeout(100)
    page.mouse.move(720, 450)
    report['motion']['wheelSteps'] = []
    for _ in range(4):
        page.mouse.wheel(0, 160)
        page.wait_for_timeout(120)
        report['motion']['wheelSteps'].append(motion_state(page))
    context.close()

    context = browser.new_context(viewport={'width':360,'height':780}, is_mobile=True, has_touch=True)
    page = context.new_page()
    page.goto('http://127.0.0.1:5173/pt', wait_until='networkidle')
    report['mobileMotion'] = {'start':motion_state(page)}
    page.wait_for_timeout(1100)
    report['mobileMotion']['idleAfter1100ms'] = motion_state(page)
    page.evaluate("window.scrollTo({top:250,behavior:'instant'})")
    page.wait_for_timeout(100)
    report['mobileMotion']['scroll250'] = motion_state(page)
    page.emulate_media(reduced_motion='reduce')
    report['mobileMotion']['reduced'] = motion_state(page)
    page.wait_for_timeout(500)
    report['mobileMotion']['reducedAfter500ms'] = motion_state(page)
    context.close()
    browser.close()

(OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(OUT / 'report.json')
for key, value in report.items():
    if key not in ('motion', 'mobileMotion'):
        print(key, 'scrollWidth', value['scrollWidth'], 'viewport', value['viewport'], 'errors', value['pageErrors'], 'loadedImages', sum(i['loaded'] for i in value['images']))
for key in ('motion', 'mobileMotion'):
    print(key, json.dumps(report[key], ensure_ascii=False))
