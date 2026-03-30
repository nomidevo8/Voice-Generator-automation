import express from 'express';
import { Recording } from '../models/Recording.js';

const router = express.Router();

// Get all recordings with pagination
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const recordings = Recording.getAll(limit, offset);
    const total = Recording.getTotalCount();

    res.json({
      recordings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recordings by status
router.get('/status/:status', (req, res) => {
  try {
    const recordings = Recording.getByStatus(req.params.status);
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', (req, res) => {
  try {
    const stats = Recording.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single recording
router.get('/:id', (req, res) => {
  try {
    const recording = Recording.getById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    res.json(recording);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete recording
router.delete('/:id', (req, res) => {
  try {
    Recording.delete(req.params.id);
    res.json({ success: true, message: 'Recording deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
