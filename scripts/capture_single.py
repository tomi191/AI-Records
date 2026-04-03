import sys
from playwright.sync_api import sync_playwright
import os

URL = "https://www.ai-records.eu"
OUT = "Z:/AI-Records/screenshots"
os.makedirs(OUT, exist_ok=True)

mode = sys.argv[1] if len(sys.argv) > 1 else "desktop"

configs = {
    "desktop": (1920, 1080, f"{OUT}/desktop_above_fold.png", None, False),
    "desktop_full": (1920, 1080, f"{OUT}/desktop_full.png", None, True),
    "mobile": (375, 812, f"{OUT}/mobile_above_fold.png", None, False),
    "mobile_full": (375, 812, f"{OUT}/mobile_full.png", None, True),
    "music_desktop": (1920, 1080, f"{OUT}/desktop_music_section.png", "#music", False),
    "music_mobile": (375, 812, f"{OUT}/mobile_music_section.png", "#music", False),
    "tablet": (768, 1024, f"{OUT}/tablet_above_fold.png", None, False),
}

vw, vh, output_path, scroll_to, full_page = configs[mode]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': vw, 'height': vh})
    page.goto(URL, wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(2000)
    if scroll_to:
        page.evaluate(f'document.querySelector("{scroll_to}")?.scrollIntoView({{behavior:"instant",block:"start"}})')
        page.wait_for_timeout(1000)
    page.screenshot(path=output_path, full_page=full_page)
    browser.close()
    print(f"Saved: {output_path}")
