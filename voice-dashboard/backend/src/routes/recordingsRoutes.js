import express from 'express';
import { Recording } from '../models/Recording.js';

const router = express.Router();

// Get all recordings with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const recordings = await Recording.getAll(limit, offset);
    const total = await Recording.getTotalCount();

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
router.get('/status/:status', async (req, res) => {
  try {
    const recordings = await Recording.getByStatus(req.params.status);
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const stats = await Recording.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single recording
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

// Delete recording
router.delete('/:id', async (req, res) => {
  try {
    await Recording.delete(req.params.id);
    res.json({ success: true, message: 'Recording deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
