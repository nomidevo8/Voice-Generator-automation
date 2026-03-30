import time
import random
import json
import subprocess
import os
import sys
from playwright.sync_api import sync_playwright

# Get text from command-line argument or environment variable
if len(sys.argv) > 1:
    text_to_generate = sys.argv[1]
    
else:
    text_to_generate = os.getenv('VOICE_TEXT', """In the ancient land of Eldoria, where skies shimmered and forests whispered secrets to the wind...""")

print(f"[~] Text to generate ({len(text_to_generate)} chars): {text_to_generate[:100]}...")

def human_delay(a=0.5, b=2.0):
    time.sleep(random.uniform(a, b))

def wait_for_captcha_manual(page, timeout=300):
    """
    Wait for user to manually solve captcha.
    Timeout in seconds (default 5 minutes)
    """
    print("\n" + "="*60)
    print("[!] CAPTCHA DETECTED!")
    print("Please solve the captcha in the browser window manually.")
    print(f"Waiting for {timeout} seconds...")
    print("="*60 + "\n")
    
    start_time = time.time()
    
    try:
        # Wait for captcha to be solved by monitoring page changes
        while time.time() - start_time < timeout:
            # Check if page has navigated or content changed (captcha solved)
            try:
                # Try to see if main content is now visible
                page.wait_for_selector('textarea[aria-label*="Enter your text"]', timeout=2000)
                print("[+] Captcha solved! Continuing...\n")
                return True
            except:
                # Still waiting
                time.sleep(1)
        
        print("[!] Captcha timeout - proceeding anyway\n")
        return False
    except KeyboardInterrupt:
        print("User skipped captcha wait")
        return False

def detect_captcha(page):
    """Detect if captcha is present on page"""
    captcha_selectors = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="captcha"]',
        'div[class*="captcha"]',
        'div[data-sitekey]',
        '.g-recaptcha',
        'iframe[title*="recaptcha"]',
    ]
    
    for selector in captcha_selectors:
        try:
            if page.query_selector(selector):
                print("🔒 Captcha detected!")
                return True
        except:
            pass
    
    return False

def simulate_human_browsing(page, duration=10):
    """
    Simulate human browsing behavior for a duration (in seconds).
    Random scrolling, hovering, mouse movements.
    """
    print(f"Simulating human browsing for {duration} seconds...")
    start_time = time.time()
    
    while time.time() - start_time < duration:
        action = random.choice(['scroll', 'move', 'hover', 'idle'])
        
        if action == 'scroll':
            human_scroll(page, random.choice(['down', 'down', 'down', 'up']), random.randint(1, 3))
        elif action == 'move':
            human_mouse_move(page)
        elif action == 'idle':
            human_delay(1, 3)
        elif action == 'hover':
            try:
                # Hover over random elements
                links = page.query_selector_all('a, button')
                if links:
                    elem = random.choice(links[:5])  # Random element from first 5
                    page.hover(elem.locator.selector if hasattr(elem, 'locator') else 'a')
            except:
                pass
        
        human_delay(0.5, 1.5)

def get_random_user_agent():
    """Get random user agent to look more human"""
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    ]
    return random.choice(user_agents)

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

def get_random_location():
    """Generate random geolocation coordinates (different countries)"""
    locations = {
        "US": {"latitude": 40.7128, "longitude": -74.0060},  # New York
        "UK": {"latitude": 51.5074, "longitude": -0.1278},  # London
        "DE": {"latitude": 52.5200, "longitude": 13.4050},  # Berlin
        "FR": {"latitude": 48.8566, "longitude": 2.3522},  # Paris
        "JP": {"latitude": 35.6762, "longitude": 139.6503},  # Tokyo
        "AU": {"latitude": -33.8688, "longitude": 151.2093},  # Sydney
        "CA": {"latitude": 43.6532, "longitude": -79.3832},  # Toronto
        "IN": {"latitude": 28.6139, "longitude": 77.2090},  # Delhi
    }
    
    location = random.choice(list(locations.values()))
    print(f"Using location: Lat {location['latitude']}, Long {location['longitude']}")
    return location

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
                print(f"\n[+] Response captured from: {response.url}")
                print(f"[+] Status: {response.status}")
            except:
                pass
    
    # Listen for responses
    page.on("response", handle_response)
    
    return captured_response

def run(proxy=None, keep_browser_open=True, browser_type="chromium"):
    """
    Args:
        proxy: Optional proxy URL (e.g., 'http://proxy.example.com:8080')
        keep_browser_open: If True, keeps browser open; if False, closes it
        browser_type: "chromium" (default), "firefox", or "webkit"
    """
    with sync_playwright() as p:
        # Get random location and user agent
        location = get_random_location()
        user_agent = get_random_user_agent()
        print(f"Using User-Agent: {user_agent}")
        print(f"Using Browser: {browser_type.upper()}")
        
        # Launch browser with optional proxy
        # IMPORTANT: Disable headless mode and avoid incognito to look more human
        launch_args = [
            "--start-maximized",
            # Disable headless mode (already done with headless=False)
            # Disable automation signals
            "--disable-automation",
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",  # Use disk instead of shared memory
            "--disable-gpu",  # Better for automation detection avoidance
        ]
        
        context_args = {
            "viewport": {"width": 1280, "height": 800},
            "geolocation": location,  # Random location
            "permissions": ["geolocation"],  # Allow geolocation
            "user_agent": user_agent,  # Random user agent
            # IMPORTANT: Do NOT use incognito mode - use persistent context
            "ignore_https_errors": True,
            # Add more realistic headers
            "extra_http_headers": {
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
        }
        
        if proxy:
            context_args["proxy"] = {"server": proxy}
            print(f"Using proxy: {proxy}")
        
        # Select browser
        if browser_type.lower() == "firefox":
            browser = p.firefox.launch(
                headless=False,
                args=launch_args,
                proxy={"server": proxy} if proxy else None
            )
        elif browser_type.lower() == "webkit":
            browser = p.webkit.launch(
                headless=False,
                args=launch_args,
                proxy={"server": proxy} if proxy else None
            )
        else:  # Default: chromium
            browser = p.chromium.launch(
                headless=False,  # IMPORTANT: Keep headless=False to look human
                args=launch_args,
                proxy={"server": proxy} if proxy else None
            )

        context = browser.new_context(**context_args)

        # Remove webdriver property to avoid detection
        page = context.new_page()
        
        # Override navigator.webdriver to hide automation
        page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        """)

        url = "https://elevenlabs.io/" 
        print("Loading page...")
        page.goto(url)
        
        # Wait for page to fully load
        print("⏳ Waiting for page to load completely...")
        page.wait_for_load_state("networkidle")
        human_delay(2, 3)

        # 1. VERY LONG initial delay to "view" the page like a real user
        print("⏳ Simulating realistic page load time...")
        print("(Waiting 15-25 seconds before interacting - like a real user reading)")
        human_delay(15, 25)  # Real users take time to read a page!
        
        # 1.2 Simulate human browsing - scroll and read
        print("📖 Simulating human browsing behavior...")
        simulate_human_browsing(page, duration=random.randint(10, 20))
        
        # 1.3 Check for captcha
        if detect_captcha(page):
            print("🛑 Captcha detected during initial browsing")
            wait_for_captcha_manual(page, timeout=300)
        
        # 1.4 More human scrolling
        human_scroll(page, "down", random.randint(1, 3))
        human_delay(2, 4)

        # 2. Wait for textarea (IMPORTANT) - with longer timeout
        print("🔍 Looking for text input...")
        try:
            textarea_selector = 'textarea[aria-label*="Enter your text here"]'
            page.wait_for_selector(textarea_selector, timeout=15000)  # Longer timeout
            print("[+] Textarea found!")
        except Exception as e:
            print(f"[!] Could not find textarea: {e}")
            print("The page may have changed or captcha is still present")
            # Try to detect captcha again
            if detect_captcha(page):
                print("Captcha still detected, waiting...")
                wait_for_captcha_manual(page, timeout=300)
            else:
                # Try again with longer timeout
                try:
                    page.wait_for_selector(textarea_selector, timeout=30000)
                    print("[+] Textarea found on second attempt!")
                except Exception as e2:
                    print(f"[X] Could not find textarea even after retry: {e2}")
                    raise

        human_delay(2, 3)
        
        # 2.5 More human-like mouse movement before clicking
        print("🖱️ Human-like mouse movement...")
        human_mouse_move(page)
        human_delay(1, 2)

        # 3. Scroll textarea into view if needed
        print("📍 Ensuring textarea is visible...")
        try:
            page.locator(textarea_selector).scroll_into_view_if_needed()
            human_delay(1, 2)
        except Exception as e:
            print(f"[!] Could not scroll element into view: {e}")

        # 3.5 Click inside textarea with hover first (but make it optional)
        print("🖱️ Hovering over textarea...")
        try:
            human_hover(page, textarea_selector)
            human_delay(1, 2)
        except Exception as e:
            print(f"[!] Hover failed ({e}), skipping to direct click...")
        
        print("[~] Clicking on textarea...")
        page.click(textarea_selector)

        human_delay(1, 2)  # Wait after clicking

        # 4. Clear existing text
        page.fill(textarea_selector, "")

        human_delay(2, 3)  # Wait after clearing

        # 5. Human-like typing with pauses (like thinking) - SLOWER
        print("✍️ Typing text slowly and naturally...")
        
        # Simulate thinking pauses while typing - MORE PAUSES
        for i, char in enumerate(text_to_generate):
            # Slower character delay (100-200ms instead of 50-150ms)
            page.type(textarea_selector, char, delay=random.randint(100, 250))
            
            # MUCH more random pauses (30% chance instead of 10%)
            if random.random() < 0.30:  # 30% chance of pause
                pause_length = random.choice([1, 1, 1, 2, 2, 3])  # Longer pauses
                print(f"  [Thinking pause at character {i}...]")
                human_delay(pause_length, pause_length + 1)

        print("✍️ Finished typing")
        human_delay(3, 5)

        # 6. Look at what was written - simulate review time
        print("👀 Reviewing content...")
        human_mouse_move(page)
        simulate_human_browsing(page, duration=random.randint(5, 10))
        human_delay(2, 3)

        # 7. CLICK THE BUTTON - Try multiple selectors for ElevenLabs generate button
        print("🔍 Looking for generate/play button...")
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
                    print(f"[+] Found button with selector: {selector}")
                    
                    # Set up response listener BEFORE clicking
                    captured_response = {}
                    
                    def handle_response(response):
                        try:
                            if response.request.method == "POST" and "/anonymous" in response.url:
                                print(f"\n[+] API Response detected from: {response.url}")
                                print(f"[+] Status: {response.status}")
                                
                                # Store response info
                                captured_response['status'] = response.status
                                captured_response['url'] = response.url
                                captured_response['method'] = response.request.method
                                
                                # Try to get response body
                                try:
                                    response_body = response.text()
                                    captured_response['body'] = response_body
                                    print(f"[+] Response body captured ({len(response_body)} bytes)")
                                except Exception as e:
                                    print(f"[!] Could not get response body: {e}")
                                    # Try JSON instead
                                    try:
                                        response_json = response.json()
                                        captured_response['body'] = json.dumps(response_json)
                                        print(f"[+] Response JSON captured")
                                    except:
                                        pass
                        except Exception as e:
                            print(f"Error in response handler: {e}")
                    
                    page.on("response", handle_response)
                    
                    # Long human delay before button action
                    human_delay(2, 4)
                    
                    # Hover before clicking - with delay
                    print("🖱️ Hovering over button...")
                    human_hover(page, selector)
                    human_delay(1, 3)
                    
                    # Move mouse slightly to simulate real cursor
                    human_mouse_move(page)
                    human_delay(0.5, 1)
                    
                    # Click the button
                    print("🖱️ Clicking button...")
                    
                    # Use wait_for_response for more reliable capture
                    try:
                        with page.expect_response(lambda response: "/anonymous" in response.url and response.request.method == "POST") as response_info:
                            page.click(selector)
                        
                        response = response_info.value
                        print(f"\n[+] Response captured via expect_response!")
                        print(f"[+] Status: {response.status}")
                        print(f"[+] URL: {response.url}")
                        
                        captured_response['status'] = response.status
                        captured_response['url'] = response.url
                        captured_response['method'] = response.request.method
                        
                        try:
                            response_body = response.text()
                            captured_response['body'] = response_body
                            print(f"[+] Response body captured ({len(response_body)} bytes)")
                        except Exception as e:
                            print(f"[!] Could not get response body: {e}")
                            try:
                                response_json = response.json()
                                captured_response['body'] = json.dumps(response_json)
                                print(f"[+] Response JSON captured")
                            except:
                                pass
                        
                        button_found = True
                        api_response = captured_response
                        print("[+] Button clicked and response captured!")
                        break
                    
                    except Exception as e:
                        print(f"[!] wait_for_response timeout: {e}")
                        print("Retrying with event listener...")
                        
                        # Fallback: just wait with the event listener
                        button_found = True
                        
                        # Wait longer for response - IMPORTANT!
                        print("⏳ Waiting for API response via listener (15 seconds)...")
                        for i in range(15):
                            human_delay(1, 1)
                            if 'status' in captured_response and 'body' in captured_response:
                                print("[+] Response captured!")
                                api_response = captured_response
                                break
                        
                        if not api_response:
                            api_response = captured_response if captured_response else {}
                        
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
        print("\n" + "="*60)
        if api_response:
            print(f"Response captured: {api_response}")
            if api_response.get('body'):
                print("SAVING RESPONSE TO FILE...")
                
                # Try to parse JSON response
                try:
                    response_json = json.loads(api_response['body'])
                    
                    # Save as both response.json and response.txt for flexibility
                    with open('response.json', 'w', encoding='utf-8') as f:
                        json.dump(response_json, f, indent=2)
                    
                    print("[+] Response saved to response.json")
                    
                    # Also save as response.txt for compatibility
                    with open('response.txt', 'w', encoding='utf-8') as f:
                        f.write("=== API RESPONSE ===\n")
                        f.write(f"URL: {api_response.get('url', 'N/A')}\n")
                        f.write(f"Status: {api_response.get('status', 'N/A')}\n")
                        f.write(f"Method: {api_response.get('method', 'N/A')}\n")
                        f.write("\n=== RESPONSE BODY ===\n")
                        f.write(json.dumps(response_json, indent=2))
                    
                    print("[+] Response saved to response.txt")
                    
                    # Print response preview
                    print(f"\n[~] Response Preview:")
                    if 'audio_base64' in response_json:
                        print(f"   - Audio: {len(response_json['audio_base64'])} bytes")
                    if 'alignment' in response_json:
                        chars = response_json['alignment'].get('characters', [])
                        print(f"   - Alignment: {len(chars)} characters")
                    
                    # AUTO-EXTRACT AUDIO: Run Node.js script automatically
                    print("\n" + "="*60)
                    print("🚀 Auto-generating audio file...")
                    print("="*60)
                    try:
                        # Run audio_extract.js automatically
                        result = subprocess.run(
                            ["node", "audio_extract.js"],
                            cwd=os.getcwd(),
                            capture_output=True,
                            text=True,
                            timeout=60
                        )
                        
                        if result.returncode == 0:
                            print(result.stdout)
                            print("[+] Audio extraction completed successfully!")
                        else:
                            print("[!] Audio extraction had issues:")
                            print(result.stderr)
                    except subprocess.TimeoutExpired:
                        print("[!] Audio extraction timed out")
                    except FileNotFoundError:
                        print("[!] Node.js not found. Please install Node.js to auto-extract audio.")
                        print("   Run manually: node audio_extract.js")
                    except Exception as e:
                        print(f"[!] Error running audio extraction: {e}")
                        print("   Run manually: node audio_extract.js")
                
                except json.JSONDecodeError as e:
                    print(f"[!] Could not parse JSON: {e}")
                    # Save as plain text
                    with open('response.txt', 'w', encoding='utf-8') as f:
                        f.write(api_response['body'])
                    print("[+] Response saved to response.txt (raw)")
            else:
                print("[!] Response captured but no body - saving metadata...")
                with open('response.txt', 'w', encoding='utf-8') as f:
                    f.write("=== API RESPONSE (METADATA ONLY) ===\n")
                    f.write(f"URL: {api_response.get('url', 'N/A')}\n")
                    f.write(f"Status: {api_response.get('status', 'N/A')}\n")
                    f.write(f"Method: {api_response.get('method', 'N/A')}\n")
                    f.write("\n[!] Body not captured - may need to configure response capture\n")
        else:
            print("[!] No API response was captured")
            print("The response handler may not have detected the /anonymous endpoint")
            print("Check the browser console (F12) for the actual API call")
        print("="*60)

        human_delay(5, 8)

        # Keep browser open or close it
        if keep_browser_open:
            print("\n" + "="*50)
            print("[+] Browser will remain open. Press Ctrl+C to close.")
            print("="*50)
            try:
                # Keep the script running so browser stays open
                while True:
                    human_delay(1, 1)
            except KeyboardInterrupt:
                print("\nClosing browser...")
                try:
                    browser.close()
                except Exception as e:
                    print(f"[!] Browser close error (expected): {e}")
        else:
            print("Closing browser...")
            try:
                browser.close()
            except Exception as e:
                print(f"[!] Browser close error (expected): {e}")

if __name__ == "__main__":
    # Example usage:
    # run()  # Default: chromium, no proxy, random location, keep open
    # run(browser_type="firefox")  # Use Firefox instead
    # run(browser_type="webkit")  # Use WebKit (Safari)
    # run(proxy="http://proxy.example.com:8080")  # With proxy
    # run(proxy="http://proxy.example.com:8080", keep_browser_open=False)  # Close after
    # run(browser_type="firefox", proxy="http://proxy.example.com:8080")  # Firefox + Proxy
    
    # Try Firefox first (less likely to be detected)
    # If Firefox fails, automatically try Chromium and WebKit
    browsers_to_try = ["firefox", "chromium", "webkit"]
    
    for browser_type in browsers_to_try:
        try:
            print(f"\n[*] Attempting with {browser_type.upper()}...")
            print("="*60)
            run(keep_browser_open=True, browser_type=browser_type)
            break  # Success - don't try other browsers
        except Exception as e:
            print(f"\n[X] {browser_type.upper()} failed: {e}")
            print(f"Trying next browser...\n")
            continue
    else:
        print("\n[X] All browsers failed. Please check:")
        print("1. Is Playwright installed? (python -m playwright install)")
        print("2. Is ElevenLabs.io accessible?")
        print("3. Check your internet connection")