import { useState } from 'react';
import { Mic, Settings, Home } from 'lucide-react';
import AudioGenerator from './components/AudioGenerator';
import RecordingsList from './components/RecordingsList';
import AdminDashboard from './components/AdminDashboard';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const socket = useSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Voice Generator
                </h1>
                <p className="text-xs text-slate-500">Professional Audio Creation Platform</p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-slate-700">
                {socket?.connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setCurrentPage('home')}
              className={`py-4 px-2 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
                currentPage === 'home'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              Generator
            </button>
            <button
              onClick={() => setCurrentPage('recordings')}
              className={`py-4 px-2 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
                currentPage === 'recordings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-4 h-4" />
              Recordings
            </button>
            <button
              onClick={() => setCurrentPage('admin')}
              className={`py-4 px-2 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
                currentPage === 'admin'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Home / Generator Page */}
        {currentPage === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-white shadow-lg">
              <h2 className="text-4xl font-bold mb-4">Welcome to Voice Generator</h2>
              <p className="text-lg text-primary-100 max-w-2xl mb-6">
                Convert your text into professional audio with advanced AI technology. Perfect for podcasts, audiobooks, announcements, and more.
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-300 rounded-full" />
                  <span>Natural-sounding voices</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-300 rounded-full" />
                  <span>Multiple voice options</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-300 rounded-full" />
                  <span>Instant downloads</span>
                </div>
              </div>
            </div>

            {/* Generator Form */}
            <AudioGenerator socket={socket} />
          </div>
        )}

        {/* Recordings Page */}
        {currentPage === 'recordings' && (
          <RecordingsList />
        )}

        {/* Admin Dashboard Page */}
        {currentPage === 'admin' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
              <p className="text-slate-600">Overview of all audio generations and system statistics</p>
            </div>
            <AdminDashboard socket={socket} />

            {/* Additional Stats */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">System Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">API Status</p>
                  <p className="text-lg font-semibold text-green-600">🟢 Running</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Database</p>
                  <p className="text-lg font-semibold text-green-600">🟢 Active</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Version</p>
                  <p className="text-lg font-semibold text-slate-900">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Last Update</p>
                  <p className="text-lg font-semibold text-slate-900">Today</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Voice Generator</h3>
              <p className="text-sm">Professional audio generation platform powered by ElevenLabs API.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Features</h3>
              <ul className="text-sm space-y-2">
                <li>Real-time audio generation</li>
                <li>Multiple voice options</li>
                <li>Download management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="text-sm space-y-2">
                <li>Documentation</li>
                <li>Contact support</li>
                <li>Report issues</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm">
            <p>&copy; 2024 Voice Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
