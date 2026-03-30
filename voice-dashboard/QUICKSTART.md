# 🚀 Quick Start Guide - Voice Generator Dashboard

## Prerequisites
- Node.js v16+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Python 3.9+ (for audio generation - already configured)

## ⚡ Installation (2 minutes)

### Option 1: Automatic Setup (Windows PowerShell)
```powershell
./SETUP.ps1
```

### Option 2: Manual Setup

#### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

## 🎯 Running the Application

### Step 1: Start Backend Server (Terminal 1)
```bash
cd voice-dashboard/backend
npm start
```

Expected output:
```
✅ Database initialized
🚀 Voice Generator API Server running on http://localhost:3001
📱 Frontend will connect to this server
```

### Step 2: Start Frontend Dev Server (Terminal 2)
```bash
cd voice-dashboard/frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 3: Open in Browser
Visit **http://localhost:5173** in your web browser

## 🎵 First Audio Generation

1. **Fill in the form:**
   - Title: "My First Audio"
   - Text: "Hello world, this is my first AI generated audio"
   - Voice: Default

2. **Click "Generate Audio"**

3. **Watch the progress bar:**
   - 10% - Initializing
   - 30% - Launching browser
   - 60%- Generating audio
   - 85% - Processing
   - 100% - Complete!

4. **Download your audio**
   - Click "Download Audio" button when complete

## 📁 File Structure

```
voice-dashboard/
├── backend/              # Node.js Express API
│  └── npm start         # Starts on :3001
├── frontend/            # React + Vite UI
│  └── npm run dev      # Starts on :5173
├── data/
│  ├── recordings/       # Generated audio files
│  └── voice_generator.db # Database
└── README.md            # Full documentation
```

## 🔗 Key URLs

| Service | URL |
|---------|-----|
| Frontend UI | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| API Health | http://localhost:3001/api/health |

## 📊 Dashboard Sections

### 🎤 Generator Tab
- Create new audio from text
- Real-time progress tracking
- Download generated audio

### 📁 Recordings Tab
- View all past recordings
- Play audio in browser
- Download audio files
- Delete recordings

### ⚙️ Admin Tab
- View system statistics
- Monitor completion rates
- Check storage usage
- System health status

## 🆘 Troubleshooting

### Backend won't start
```bash
# Port already in use? Try:
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process and restart
```

### Frontend can't connect to backend
```bash
# Check backend is running on :3001
# Check firewall settings
# Restart both servers
```

### Database errors
```bash
# Delete database and reinitialize:
rm voice-dashboard/data/voice_generator.db

# Restart backend server - it will recreate automatically
```

### Audio generation fails
```bash
# Check Python installation:
python --version

# Verify test.py is in parent directory:
# e:\voice generator\test.py
```

## 💡 Tips

1. **Keep browser open:** Real-time updates work best with both tabs/windows visible
2. **Check connection status:** Green dot in top-right = connected
3. **Monitor progress:** Progress bar shows real-time generation status
4. **Download immediately:** Audio links expire after some time
5. **Admin panel:** Shows live statistics updated every 5 seconds

## 📈 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Creates dist/ folder ready for deployment
```

### Deploy Backend
```bash
# Using PM2 for process management:
npm install -g pm2

cd backend
pm2 start src/server.js --name voice-api
pm2 save
```

## 🐛 Getting Help

1. Check backend console for errors
2. Open browser DevTools (F12) for frontend errors
3. Check that all three services are running:
   - Backend: ✅ Running on :3001
   - Frontend: ✅ Running on :5173
   - Connection: ✅ Green indicator in top-right

## 🎉 Success!

You now have a fully functional Voice Generator Dashboard with:
- ✅ Modern UI
- ✅ Real-time progress tracking
- ✅ Recording management
- ✅ Admin dashboard
- ✅ Download functionality

**Happy voice generating!** 🎵

---

**Need more help?** See [README.md](./README.md) for full documentation.
