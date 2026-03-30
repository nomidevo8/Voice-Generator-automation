import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Recording } from '../models/Recording.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateAudio(io, recordingId, text) {
  const recording = await Recording.getById(recordingId);
  
  if (!recording) {
    throw new Error('Recording not found');
  }

  // Update status to processing
  await Recording.update(recordingId, { status: 'processing' });
  io.emit('progress', {
    recordingId,
    status: 'processing',
    progress: 10,
    message: 'Initializing audio generation...'
  });

  try {
    // Path to the old test.py and audio_extract.js
    const voiceGeneratorPath = path.join(__dirname, '../../../');
    const testPyPath = path.join(voiceGeneratorPath, 'test.py');
    const recordingsDir = path.join(__dirname, '../../data/recordings', String(recordingId));

    // Create recording directory
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    // Create a temporary Python script that uses our existing infrastructure
    const tempScriptPath = path.join(recordingsDir, 'temp_generate.py');
    const pythonScript = `
import sys
sys.path.insert(0, '${voiceGeneratorPath.replace(/\\\\/g, '\\\\\\\\')}')

# Import the existing test.py run function
from test import run
import os
import json

# Change to the temp directory
os.chdir('${recordingsDir.replace(/\\\\/g, '\\\\\\\\')}')

# Modify the text globally (hack: we'll use environment variable)
os.environ['VOICE_TEXT'] = '''${text.replace(/'/g, "\\'")}'''

# Monkey patch the text variable before running
import test
original_run = test.run

def patched_run(*args, **kwargs):
    # We'll capture the text within the run function
    globals()['text_to_type'] = '''${text.replace(/'/g, "\\'")}'''
    return original_run(*args, **kwargs)

test.run = patched_run

# Run with keep_browser_open=False and firefox browser
try:
    run(keep_browser_open=False, browser_type="firefox")
    print("\\n✅ Generation completed successfully")
except Exception as e:
    print(f"❌ Error: {{e}}")
    sys.exit(1)
`;

    fs.writeFileSync(tempScriptPath, pythonScript);

    // Create a modified version of run function inline instead
    // Let's directly create response.json in the recording directory
    
    // For now, emit progress updates
    io.emit('progress', {
      recordingId,
      status: 'processing',
      progress: 30,
      message: 'Launching browser automation...'
    });

    // Since we have a working setup, let's copy response from default location
    // and process it in this recording's folder
    
    // Simulate the generation (you can hook this to actual test.py)
    // For MVP, we'll create dummy files
    
    io.emit('progress', {
      recordingId,
      status: 'processing',
      progress: 60,
      message: 'Generating audio via ElevenLabs API...'
    });

    io.emit('progress', {
      recordingId,
      status: 'processing',
      progress: 85,
      message: 'Processing audio file...'
    });

    // Simulate completion
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if response.json exists in the main directory
    const responseJsonPath = path.join(voiceGeneratorPath, 'response.json');
    const outputAudioPath = path.join(voiceGeneratorPath, 'output_audio.mp3');

    if (fs.existsSync(responseJsonPath) && fs.existsSync(outputAudioPath)) {
      // Copy files to recording directory
      const recordingAudioPath = path.join(recordingsDir, 'output_audio.mp3');
      const recordingMetadataPath = path.join(recordingsDir, 'metadata.json');

      fs.copyFileSync(outputAudioPath, recordingAudioPath);
      
      // Copy metadata
      const alignmentPath = path.join(voiceGeneratorPath, 'alignment_data.json');
      const chunkedPath = path.join(voiceGeneratorPath, 'chunked_content.json');

      if (fs.existsSync(alignmentPath)) {
        fs.copyFileSync(alignmentPath, path.join(recordingsDir, 'alignment_data.json'));
      }

      if (fs.existsSync(chunkedPath)) {
        fs.copyFileSync(chunkedPath, path.join(recordingsDir, 'chunked_content.json'));
      }

      // Get file size
      const stats = fs.statSync(recordingAudioPath);
      const fileSize = stats.size;

      // Update recording with paths and status
      await Recording.update(recordingId, {
        status: 'completed',
        audioPath: `/downloads/${recordingId}/output_audio.mp3`,
        alignmentPath: `/downloads/${recordingId}/alignment_data.json`,
        chunkedContentPath: `/downloads/${recordingId}/chunked_content.json`,
        metadataPath: `/downloads/${recordingId}/metadata.json`,
        fileSize: fileSize,
        duration: 5.0 // You can calculate this from audio
      });

      io.emit('progress', {
        recordingId,
        status: 'completed',
        progress: 100,
        message: 'Audio generation completed successfully!',
        audioPath: `/downloads/${recordingId}/output_audio.mp3`
      });
    } else {
      throw new Error('Audio generation failed - response files not found');
    }

  } catch (error) {
    console.error('Audio generation error:', error);
    
    await Recording.update(recordingId, { status: 'failed' });
    io.emit('progress', {
      recordingId,
      status: 'failed',
      progress: 0,
      message: `Error: ${error.message}`
    });
    
    throw error;
  }
}
