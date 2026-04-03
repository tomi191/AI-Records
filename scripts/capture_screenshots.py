from playwright.sync_api import sync_playwright
import os

URL = "https://www.ai-records.eu"
OUT = "Z:/AI-Records/screenshots"
os.makedirs(OUT, exist_ok=True)

def capture(url, output_path, vw, vh, scroll_to=None, full_page=False, wait_ms=2000):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': vw, 'height': vh})
        page.goto(url, wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(wait_ms)
        if scroll_to:
            page.evaluate(f'document.querySelector("{scroll_to}")?.scrollIntoView({{behavior:"instant",block:"start"}})')
            page.wait_for_timeout(1000)
        page.screenshot(path=output_path, full_page=full_page)
        browser.close()
        print(f"Saved: {output_path}")

# Desktop above-the-fold
capture(URL, f"{OUT}/desktop_above_fold.png", 1920, 1080)

# Desktop full page
capture(URL, f"{OUT}/desktop_full.png", 1920, 1080, full_page=True)

# Mobile above-the-fold
capture(URL, f"{OUT}/mobile_above_fold.png", 375, 812)

# Mobile full page
capture(URL, f"{OUT}/mobile_full.png", 375, 812, full_page=True)

# Desktop - music section
capture(URL, f"{OUT}/desktop_music_section.png", 1920, 1080, scroll_to="#music")

# Mobile - music section
capture(URL, f"{OUT}/mobile_music_section.png", 375, 812, scroll_to="#music")

# Tablet
capture(URL, f"{OUT}/tablet_above_fold.png", 768, 1024)

print("All screenshots captured.")
