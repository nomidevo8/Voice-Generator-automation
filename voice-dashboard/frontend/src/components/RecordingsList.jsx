import { useState, useEffect } from 'react';
import { Download, Trash2, Play, Calendar, Volume2, Loader } from 'lucide-react';
import axios from 'axios';

export default function RecordingsList() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    fetchRecordings(currentPage);
  }, [currentPage]);

  const fetchRecordings = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/recordings', {
        params: { page, limit: 10 }
      });

      setRecordings(response.data.recordings);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      setDeleting(id);
      await axios.delete(`/api/recordings/${id}`);
      fetchRecordings(currentPage);
    } catch (error) {
      console.error('Failed to delete recording:', error);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Volume2 className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Past Recordings</h2>
          <p className="text-sm text-slate-500">View and manage your audio generations</p>
        </div>
      </div>

      {loading && !recordings.length ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="ml-2 text-slate-600">Loading recordings...</span>
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-12">
          <Volume2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No recordings yet</p>
          <p className="text-sm text-slate-500">Create your first audio recording above</p>
        </div>
      ) : (
        <>
          {/* Recordings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Text</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recordings.map((recording) => (
                  <tr key={recording.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{recording.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 truncate block max-w-xs">
                        {recording.text.substring(0, 50)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(recording.status)}`}>
                        {recording.status.charAt(0).toUpperCase() + recording.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {recording.fileSize ? formatFileSize(recording.fileSize) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(recording.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {recording.status === 'completed' && recording.audioPath && (
                          <>
                            <button
                              onClick={() => setPlaying(playing === recording.id ? null : recording.id)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                              title="Play audio"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <a
                              href={recording.audioPath}
                              download
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                              title="Download audio"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(recording.id)}
                          disabled={deleting === recording.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete recording"
                        >
                          {deleting === recording.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Audio Player */}
                      {playing === recording.id && recording.audioPath && (
                        <div className="mt-3 col-span-6">
                          <audio
                            controls
                            autoPlay
                            src={recording.audioPath}
                            className="w-full"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
