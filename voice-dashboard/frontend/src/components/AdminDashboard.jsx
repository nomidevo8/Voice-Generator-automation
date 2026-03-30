import { useState, useEffect } from 'react';
import { BarChart3, Music, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalSize: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
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

  const formatSize = (bytes) => {
    if (!bytes) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
            <p className="text-3xl font-bold text-slate-900">{formatSize(stats.totalSize)}</p>
            <p className="text-xs text-slate-500 mt-2">Used</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
