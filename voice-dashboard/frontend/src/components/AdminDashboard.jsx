import { useState, useEffect } from 'react';
import { BarChart3, Music, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react';
import axios from 'axios';
import AudioGenerator from './AudioGenerator';

export default function AdminDashboard({ socket }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalSize: 0
  });
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchStats();
    fetchRecordings();
    const interval = setInterval(() => {
      fetchStats();
      fetchRecordings();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/recordings/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      const response = await axios.get(`/api/recordings?page=${currentPage}&limit=${recordsPerPage}`);
      setRecordings(response.data.recordings);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    }
  };

  const handleDeleteRecording = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }
    try {
      await axios.delete(`/api/recordings/${id}`);
      setRecordings(recordings.filter(r => r.id !== id));
      fetchStats();
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✓ Completed</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">⏳ Processing</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">⏳ Pending</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">✗ Failed</span>;
      default:
        return <span className="text-xs text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Recordings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Recordings</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-2">All time</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Music className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-slate-500 mt-2">{completionRate}% success rate</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Processing */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Processing</p>
              <p className="text-3xl font-bold text-primary-600">{stats.pending}</p>
              <p className="text-xs text-slate-500 mt-2">In queue</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-xs text-slate-500 mt-2">Errors</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Storage */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Storage</p>
              <p className="text-3xl font-bold text-purple-600">{formatSize(stats.totalSize)}</p>
              <p className="text-xs text-slate-500 mt-2">Used</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Admin Controls</h3>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105"
        >
          {showGenerator ? 'Hide' : 'Create New Audio'}
        </button>
      </div>

      {/* Audio Generator (Admin) */}
      {showGenerator && (
        <AudioGenerator 
          socket={socket}
          onSuccess={() => {
            fetchStats();
            fetchRecordings();
          }}
        />
      )}

      {/* All Recordings Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">All Recordings</h3>
          <p className="text-sm text-slate-600 mt-1">Manage and monitor all audio generations</p>
        </div>

        {recordings.length === 0 ? (
          <div className="p-12 text-center">
            <Music className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No recordings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Download</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recordings.map((recording) => (
                  <tr key={recording.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{recording.title}</p>
                        <p className="text-xs text-slate-500 mt-1">ID: {recording.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(recording.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatSize(recording.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(recording.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {recording.status === 'completed' && recording.audioPath ? (
                        <a
                          href={recording.audioPath}
                          download
                          className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteRecording(recording.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
