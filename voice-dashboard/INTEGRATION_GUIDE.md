# Voice Generator - Python + Node.js Integration

## 🔄 Workflow

### Step 1: Run Python Script (test.py)
```bash
python test.py
```

**What happens:**
- Launches browser to elevenlabs.io
- Inputs text  
- Clicks generate button
- **Captures API response** and saves to:
  - `response.json` (structured data)
  - `response.txt` (readable format)

### Step 2: Run Node.js Script (audio_extract.js)
```bash
node audio_extract.js
```

**What happens:**
- Auto-reads `response.json` from Python script
- Extracts audio file (base64 → MP3)
- Processes alignment/timing data
- Saves output files:
  - `output_audio.mp3` - The audio file
  - `alignment_data.json` - Character timing data
  - `chunked_content.json` - Text chunks with timing
  - `audio_metadata.json` - Metadata

## 📊 Output Files

| File | Purpose |
|------|---------|
| `output_audio.mp3` | Generated speech audio |
| `alignment_data.json` | Character-level timing data |
| `chunked_content.json` | Text chunks with time ranges |
| `audio_metadata.json` | Response metadata |

## 🎯 Handling Chunked Content  

The script automatically handles content that comes in "little little things":

```javascript
// Chunks are created by:
// - Grouping characters into words/phrases
// - Each chunk has timing info
// - Perfect for syncing with text or creating subtitles
```

**Example output:**
```json
[
  {
    "text": "In the",
    "start_time": 0.0,
    "end_time": 0.24,
    "duration": 0.24
  },
  {
    "text": "ancient land",
    "start_time": 0.304,
    "end_time": 0.68,
    "duration": 0.376
  }
]
```

## 🔧 Features

✅ **Integration:** Python captures → Node processes  
✅ **Batching:** Handles chunked responses efficiently  
✅ **Auto-sync:** Character-level timing for text/audio sync  
✅ **Multiple formats:** MP3, JSON, chunks all generated  
✅ **Error handling:** Validates each step  

## ⚙️ Configuration

### Python Script (test.py)
- Change `browser_type`: "chromium", "firefox", "webkit"
- Add proxy: `run(proxy="http://proxy:8080")`
- Keep browser open: `keep_browser_open=True/False`

### Node Script (audio_extract.js) 
- Automatically reads from response.json
- No manual configuration needed
- All output is automatic

## 🚀 Quick Start

```bash
# Terminal 1: Generate audio
python test.py

# Terminal 2: Extract audio (when Python finishes)
node audio_extract.js

# Result: output_audio.mp3 ready to use!
```

## 📝 Example: Using for Subtitles

```javascript
const chunks = require("./chunked_content.json");

chunks.forEach(chunk => {
  const startMs = Math.round(chunk.start_time * 1000);
  const endMs = Math.round(chunk.end_time * 1000);
  console.log(`[${startMs}ms - ${endMs}ms] ${chunk.text}`);
});
```

## 💡 Tips

1. **First time**: Let Python script finish completely before running Node
2. **Repeated runs**: Different proxy/location each time for bot avoidance  
3. **Timing sync**: Use alignment_data.json for perfect character sync
4. **Large audio**: MP3 files can be 2-5 MB depending on text length

---

**Status:** ✅ Python-Node.js integration complete!
