
import sys
sys.path.insert(0, 'E:\voice generator\voice-dashboard\')

# Import the existing test.py run function
from test import run
import os
import json

# Change to the temp directory
os.chdir('E:\voice generator\voice-dashboard\backend\data\recordings\2')

# Modify the text globally (hack: we'll use environment variable)
os.environ['VOICE_TEXT'] = '''This is test'''

# Monkey patch the text variable before running
import test
original_run = test.run

def patched_run(*args, **kwargs):
    # We'll capture the text within the run function
    globals()['text_to_type'] = '''This is test'''
    return original_run(*args, **kwargs)

test.run = patched_run

# Run with keep_browser_open=False and firefox browser
try:
    run(keep_browser_open=False, browser_type="firefox")
    print("\n✅ Generation completed successfully")
except Exception as e:
    print(f"❌ Error: {{e}}")
    sys.exit(1)
