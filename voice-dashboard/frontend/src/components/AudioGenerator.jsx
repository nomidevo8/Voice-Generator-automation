import { useState } from 'react';
import { Mic, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import ProgressBar from './ProgressBar';

export default function AudioGenerator({ socket, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    voice: 'default'
  });
  const [loading, setLoading] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [progress, setProgress] = useState({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData.text.trim()) {
      setError('Please enter text to convert');
      return;
    }

    if (formData.text.length > 5000) {
      setError('Text is too long (maximum 5000 characters)');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('/api/audio/generate', {
        title: formData.title,
        text: formData.text,
        voice: formData.voice
      });

      setRecordingId(response.data.recordingId);
      setSuccess('🎵 Audio generation started!');

      // Listen for progress updates
      if (socket) {
        socket.off('progress');
        socket.on('progress', (data) => {
          if (data.recordingId === response.data.recordingId) {
            setProgress(data);
            
            if (data.status === 'completed') {
              setSuccess('✅ Audio generated successfully!');
              if (onSuccess) {
                onSuccess(data);
              }
            } else if (data.status === 'failed') {
              setError(`❌ Generation failed: ${data.message}`);
            }
          }
        });
      }

      // Reset form
      setFormData({
        title: '',
        text: '',
        voice: 'default'
      });

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Mic className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create New Audio</h2>
          <p className="text-sm text-slate-500">Convert your text to professional audio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Recording Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Product Announcement, Welcome Message"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            disabled={loading}
            maxLength="100"
          />
          <p className="text-xs text-slate-500 mt-1">{formData.title.length}/100 characters</p>
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Text to Convert
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Enter the text you want to convert to audio. You can use up to 5000 characters."
            rows="6"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
            disabled={loading}
            maxLength="5000"
          />
          <p className="text-xs text-slate-500 mt-1">{formData.text.length}/5000 characters</p>
        </div>

        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Voice Selection
          </label>
          <select
            name="voice"
            value={formData.voice}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            disabled={loading}
          >
            <option value="default">Default Voice</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="female">Female Voice</option>
            <option value="male">Male Voice</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
          </div>
        )}

        {/* Progress */}
        {recordingId && progress.status !== 'idle' && (
          <ProgressBar progress={progress} />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || progress.status === 'processing'}
          className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading || progress.status === 'processing' ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              {progress.message || 'Generating...'}
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Generate Audio
            </>
          )}
        </button>
      </form>
    </div>
  );
}
