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

    // Check if test.py exists
    if (!fs.existsSync(testPyPath)) {
      throw new Error(`test.py not found at ${testPyPath}`);
    }

    io.emit('progress', {
      recordingId,
      status: 'processing',
      progress: 30,
      message: 'Launching browser automation...'
    });

    // Execute Python test.py to generate audio
    // This will create response.json and output_audio.mp3 in the voiceGeneratorPath
    await new Promise((resolve, reject) => {
      // Pass text as command-line argument to Python script
      const pythonProcess = spawn('python', [testPyPath, text], {
        cwd: voiceGeneratorPath,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`[test.py] ${data.toString()}`);
        io.emit('progress', {
          recordingId,
          status: 'processing',
          progress: 50,
          message: 'Generating audio...'
        });
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`[test.py ERROR] ${data.toString()}`);
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(err);
      });
    });

    io.emit('progress', {
      recordingId,
      status: 'processing',
      progress: 85,
      message: 'Processing audio file...'
    });

    // Check if response.json exists in the main directory
    const responseJsonPath = path.join(voiceGeneratorPath, 'response.json');
    const outputAudioPath = path.join(voiceGeneratorPath, 'output_audio.mp3');

    if (!fs.existsSync(responseJsonPath)) {
      throw new Error(`response.json not found at ${responseJsonPath}`);
    }
    if (!fs.existsSync(outputAudioPath)) {
      throw new Error(`output_audio.mp3 not found at ${outputAudioPath}`);
    }

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

    // Copy response.json as metadata
    if (fs.existsSync(responseJsonPath)) {
      fs.copyFileSync(responseJsonPath, path.join(recordingsDir, 'response.json'));
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
      metadataPath: `/downloads/${recordingId}/response.json`,
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
