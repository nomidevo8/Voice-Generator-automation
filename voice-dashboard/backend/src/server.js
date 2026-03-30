import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import audioRoutes from './routes/audioRoutes.js';
import recordingsRoutes from './routes/recordingsRoutes.js';
import { initializeDatabase } from './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for downloads
app.use('/downloads', express.static(path.join(__dirname, '../data/recordings')));

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    // Routes
    app.use('/api/audio', audioRoutes(io));
    app.use('/api/recordings', recordingsRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Voice Generator API is running' });
    });

    // Make io available globally
    app.set('io', io);

    // Socket.io events
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    const PORT = process.env.PORT || 3001;

    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Voice Generator API Server running on http://localhost:${PORT}`);
      console.log(`📱 Frontend will connect to this server\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };
