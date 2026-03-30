import time
import random
from playwright.sync_api import sync_playwright

def human_delay(a=0.5, b=2.0):
    """Random delay to simulate human thinking time"""
    time.sleep(random.uniform(a, b))

def human_type(page, selector, text):
    """Type like a human with random delays between keystrokes"""
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

        # --- Step 1: Go to website ---
        url = "https://elevenlabs.io/"  # replace later
        page.goto(url)

        human_delay(2, 4)

        # --- Step 2: Move mouse randomly (human-like) ---
        page.mouse.move(300, 300)
        human_delay(0.5, 1.5)
        page.mouse.move(500, 400)

        # --- Step 3: Wait for textbox ---
        textbox_selector = "input[type='text']"  # replace later
        page.wait_for_selector(textbox_selector)

        human_delay(1, 2)

        # --- Step 4: Click into textbox ---
        page.click(textbox_selector)

        human_delay(0.5, 1.0)

        # --- Step 5: Human-like typing ---
        text_to_type = "Hello, this is test content"
        human_type(page, textbox_selector, text_to_type)

        human_delay(1, 2)

        # --- Optional: Press Enter ---
        # page.keyboard.press("Enter")

        # --- Keep open for observation ---
        human_delay(5, 8)

        browser.close()

if __name__ == "__main__":
    run()