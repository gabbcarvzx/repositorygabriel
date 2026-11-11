"""Verify the published build through the browser after a gated deployment."""
import sys
from playwright.sync_api import sync_playwright

url, expected = sys.argv[1:3]
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for language in ('pt', 'en'):
        page = browser.new_page()
        response = page.goto(f'{url.rstrip("/")}/{language}', wait_until='networkidle')
        assert response.status == 200, (language, response.status)
        actual = page.locator('meta[name="portfolio-version"]').get_attribute('content')
        assert actual == expected, (language, actual, expected)
        assert page.locator('.project-visual img').evaluate_all('images => images.every(i => i.naturalWidth > 0)')
        for project in ('pelada', 'giraffas', 'exclusiva', 'prime'):
            response = page.goto(f'{url.rstrip("/")}/{language}/projects/{project}', wait_until='networkidle')
            assert response.status == 200, (language, project, response.status)
            assert page.get_by_role('heading', level=1).count() == 1
        page.close()
    browser.close()
print(f'Published routes, primary assets and version {expected} verified at {url}')
