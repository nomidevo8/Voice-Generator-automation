import time
import random
from playwright.sync_api import sync_playwright

def human_delay(a=0.5, b=2.0):
    time.sleep(random.uniform(a, b))

def human_type(page, selector, text):
    for char in text:
        page.type(selector, char, delay=random.randint(50, 150))

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=["--start-maximized"]
        )

        context = browser.new_context(
            viewport={"width": 1280, "height": 800}
        )

        page = context.new_page()

        # 1. Go to site
        url = "https://elevenlabs.io/"  # target site
        page.goto(url)

        human_delay(3, 5)

        # 2. Wait for textarea (IMPORTANT)
        textarea_selector = 'textarea[aria-label*="Enter your text here"]'
        page.wait_for_selector(textarea_selector)

        human_delay(1, 2)

        # 3. Click inside textarea
        page.click(textarea_selector)

        human_delay(0.5, 1.0)

        # 4. Clear existing text (optional)
        page.fill(textarea_selector, "")

        human_delay(0.5, 1.0)

        # 5. Human-like typing
        text_to_type = """In the ancient land of Eldoria, where skies shimmered and forests whispered secrets to the wind..."""

        human_type(page, textarea_selector, text_to_type)

        human_delay(2, 3)

        # 6. Optional: press Enter or click play button later
        # page.keyboard.press("Enter")

        human_delay(5, 8)

        browser.close()

if __name__ == "__main__":
    run()