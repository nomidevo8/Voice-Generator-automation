# 🎵 Voice Generator Dashboard

A professional, modern, real-time voice generation platform with admin dashboard and audio management.

## ✨ Features

- **🎤 Text-to-Speech Generation** - Convert any text into natural-sounding audio
- **📊 Real-time Progress Tracking** - WebSocket-powered progress updates with visual feedback
- **📁 Recording Management** - View, play, and download past recordings
- **⚙️ Admin Dashboard** - Comprehensive statistics and system monitoring
- **🎨 Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- **⚡ Real-time Updates** - Live connection status and progress notifications
- **📱 Fully Responsive** - Works seamlessly on desktop, tablet, and mobile

## 🏗️ Project Structure

```
voice-dashboard/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Database and utilities
│   │   └── server.js       # Main entry point
│   ├── package.json
│   └── data/               # SQLite database
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── assets/         # Styles and static files
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── data/
│   ├── recordings/         # Generated audio files
│   └── voice_generator.db  # SQLite database
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.9+ (for audio generation)

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

### Running the Application

#### Terminal 1 - Start Backend Server
```bash
cd backend
npm start
# Backend will run on http://localhost:3001
```

#### Terminal 2 - Start Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend will open at http://localhost:5173
```

Visit `http://localhost:5173` in your browser to access the dashboard.

## 📖 Usage

### Generating Audio

1. Navigate to the **Generator** tab
2. Enter a title for your recording
3. Input the text you want to convert (up to 5000 characters)
4. Select your preferred voice
5. Click "Generate Audio"
6. Monitor the real-time progress bar
7. Download the generated audio when complete

### Managing Recordings

- Visit the **Recordings** tab to see all past audio generations
- Play audio directly in the browser
- Download any completed recording
- Delete recordings you no longer need
- View metadata about each recording

### Admin Dashboard

- Access the **Admin** tab to see system statistics
- Monitor total recordings, completion rate, and storage usage
- Track pending, completed, and failed operations
- View system status and health information

## 🔌 API Endpoints

### Audio Generation
- `POST /api/audio/generate` - Create new audio generation

### Recordings
- `GET /api/recordings` - List all recordings (paginated)
- `GET /api/recordings/:id` - Get recording details
- `GET /api/recordings/status/:status` - Get recordings by status
- `GET /api/recordings/dashboard/stats` - Get dashboard statistics
- `DELETE /api/recordings/:id` - Delete recording

### Health Check
- `GET /api/health` - Check API status

## 🔌 WebSocket Events

### Server -> Client
- `progress` - Real-time progress updates
  ```javascript
  {
    recordingId: 123,
    status: 'processing',
    progress: 50,
    message: 'Generating audio...',
    audioPath: '/downloads/123/output_audio.mp3'
  }
  ```

## 🗄️ Database Schema

### Recordings Table
```sql
CREATE TABLE recordings (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  voice TEXT DEFAULT 'default',
  status TEXT DEFAULT 'pending',
  audioPath TEXT,
  alignmentPath TEXT,
  chunkedContentPath TEXT,
  metadataPath TEXT,
  duration REAL DEFAULT 0,
  fileSize INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icon components
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket support
- **Better-sqlite3** - SQLite database driver
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload handling

## 📝 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/voice_generator.db
```

## 🔒 Security Features

- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Database prepared statements
- ✅ Error handling and logging
- ✅ File size limits

## 🚢 Deployment

### Backend Deployment
```bash
# Build for production
npm start

# Or use process manager (PM2)
pm2 start src/server.js --name "voice-backend"
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy the dist folder to your hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:3001`
- Check firewall settings
- Verify Node.js is installed correctly

### Audio Generation Fails
- Ensure Python environment is properly configured
- Check that ElevenLabs API credentials are valid
- Verify internet connection

### Database Errors
- Clear database: `rm data/voice_generator.db`
- Reinitialize database automatically on next start

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Socket.io Documentation](https://socket.io/docs)
- [Vite Documentation](https://vitejs.dev)

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Support

For issues, questions, or suggestions, please open an issue or contact support.

---

**Made with ❤️ for voice generation enthusiasts**
