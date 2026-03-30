import express from 'express';
import { generateAudio } from '../controllers/audioController.js';
import { Recording } from '../models/Recording.js';

export default function audioRoutes(io) {
  const router = express.Router();

  // Generate audio from text
  router.post('/generate', async (req, res) => {
    try {
      const { title, text, voice } = req.body;

      if (!text || !title) {
        return res.status(400).json({ error: 'Title and text are required' });
      }

      if (text.length > 5000) {
        return res.status(400).json({ error: 'Text is too long (max 5000 characters)' });
      }

      // Create recording entry
      const recording = await Recording.create({
        title,
        text,
        voice: voice || 'default'
      });

      // Start async audio generation
      generateAudio(io, recording.id, text).catch(err => {
        console.error('Generation error:', err);
      });

      res.json({
        success: true,
        recordingId: recording.id,
        message: 'Audio generation started. Monitor progress via WebSocket.'
      });

    } catch (error) {
      console.error('Audio generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get recording details
  router.get('/:id', async (req, res) => {
    try {
      const recording = await Recording.getById(req.params.id);
      
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
