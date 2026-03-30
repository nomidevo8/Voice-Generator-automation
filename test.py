import time
import random
import json
from playwright.sync_api import sync_playwright

def human_delay(a=0.5, b=2.0):
    time.sleep(random.uniform(a, b))

def human_type(page, selector, text):
    for char in text:
        page.type(selector, char, delay=random.randint(50, 150))

def human_scroll(page, direction="down", amount=3):
    """Scroll like a human - variable speed and distance"""
    scrolls = random.randint(1, amount)
    for _ in range(scrolls):
        page.evaluate(f"window.scrollBy(0, {random.randint(200, 500) if direction == 'down' else -random.randint(200, 500)})")
        human_delay(0.3, 0.8)

def human_mouse_move(page):
    """Move mouse to random positions like idle behavior"""
    for _ in range(random.randint(2, 4)):
        x = random.randint(100, 1200)
        y = random.randint(100, 700)
        page.mouse.move(x, y)
        human_delay(0.5, 1.5)

def human_hover(page, selector):
    """Hover over an element before interacting"""
    page.hover(selector)
    human_delay(0.5, 1.5)

def capture_api_response(page, timeout=30000):
    """
    Capture the next POST response (usually the API call).
    Returns the response text/JSON
    """
    captured_response = {}
    
    def handle_response(response):
        # Capture POST requests (usually API calls)
        if response.request.method == "POST":
            try:
                # Try to get JSON response
                response_data = response.text()
                captured_response['status'] = response.status
                captured_response['url'] = response.url
                captured_response['method'] = response.request.method
                captured_response['body'] = response_data
                print(f"\n✓ Response captured from: {response.url}")
                print(f"✓ Status: {response.status}")
            except:
                pass
    
    # Listen for responses
    page.on("response", handle_response)
    
    return captured_response

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

        url = "https://elevenlabs.io/" 
        page.goto(url)

        # 1. Initial delay to "view" the page
        print("Viewing page...")
        human_delay(3, 5)
        
        # 1.5 Scroll around like reading
        human_scroll(page, "down", 2)
        human_delay(1, 2)

        # 2. Wait for textarea (IMPORTANT)
        textarea_selector = 'textarea[aria-label*="Enter your text here"]'
        page.wait_for_selector(textarea_selector)

        human_delay(1, 2)
        
        # 2.5 Move mouse around before interacting
        print("Human-like mouse movement...")
        human_mouse_move(page)
        human_delay(0.5, 1)

        # 3. Click inside textarea with hover first
        print("Clicking textarea...")
        human_hover(page, textarea_selector)
        page.click(textarea_selector)

        human_delay(0.5, 1.0)

        # 4. Clear existing text (optional)
        page.fill(textarea_selector, "")

        human_delay(0.5, 1.0)

        # 5. Human-like typing with pauses (like thinking)
        print("Typing text...")
        text_to_type = """In the ancient land of Eldoria, where skies shimmered and forests whispered secrets to the wind..."""
        
        # Simulate thinking pauses while typing
        for i, char in enumerate(text_to_type):
            page.type(textarea_selector, char, delay=random.randint(50, 150))
            # Random longer pause (like thinking)
            if random.random() < 0.1:  # 10% chance of pause
                human_delay(1, 2)

        human_delay(2, 3)

        # 6. Look at what was written
        print("Reviewing content...")
        human_mouse_move(page)
        human_delay(1, 2)

        # 7. CLICK THE BUTTON - Try multiple selectors for ElevenLabs generate button
        print("Looking for generate/play button...")
        button_selectors = [
            'button:has-text("Generate")',
            'button:has-text("Synthesize")',
            'button[aria-label*="Generat"]',
            'button[aria-label*="Play"]',
            'button:has-text("Play")',
            'button.generate-button'
        ]
        
        button_found = False
        api_response = None
        
        for selector in button_selectors:
            try:
                button_elem = page.query_selector(selector)
                if button_elem:
                    print(f"Found button with selector: {selector}")
                    
                    # Set up response listener BEFORE clicking
                    captured_response = {}
                    
                    def handle_response(response):
                        if response.request.method == "POST" and "/anonymous" in response.url:
                            try:
                                response_data = response.text()
                                captured_response['status'] = response.status
                                captured_response['url'] = response.url
                                captured_response['method'] = response.request.method
                                captured_response['body'] = response_data
                                print(f"\n✓ API Response captured!")
                                print(f"✓ Status: {response.status}")
                                print(f"✓ URL: {response.url}")
                            except:
                                pass
                    
                    page.on("response", handle_response)
                    
                    # Hover before clicking
                    human_hover(page, selector)
                    
                    # Click the button
                    print("Clicking button...")
                    page.click(selector)
                    button_found = True
                    
                    # Wait for response
                    print("Waiting for API response...")
                    human_delay(2, 4)  # Wait for response
                    
                    api_response = captured_response
                    print("Button clicked!")
                    break
            except Exception as e:
                print(f"Error with selector {selector}: {e}")
                continue
        
        if not button_found:
            print("Could not find button - trying to find any visible button near textarea")
            # Fallback: scroll to see if there's a button below
            human_scroll(page, "down", 2)
            human_delay(1, 2)
        
        # 8. Save response to file
        if api_response and api_response.get('body'):
            print("\n" + "="*50)
            print("SAVING RESPONSE TO FILE...")
            with open('response.txt', 'w', encoding='utf-8') as f:
                f.write("=== API RESPONSE ===\n")
                f.write(f"URL: {api_response.get('url', 'N/A')}\n")
                f.write(f"Status: {api_response.get('status', 'N/A')}\n")
                f.write(f"Method: {api_response.get('method', 'N/A')}\n")
                f.write("\n=== RESPONSE BODY ===\n")
                
                # Try to format as JSON if possible
                try:
                    json_data = json.loads(api_response['body'])
                    f.write(json.dumps(json_data, indent=2))
                except:
                    f.write(api_response['body'])
            
            print("✓ Response saved to response.txt")
            print("="*50)
        else:
            print("⚠ No API response captured")

        human_delay(5, 8)

        browser.close()

if __name__ == "__main__":
    run()