import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ProgressBar({ progress }) {
  return (
    <div className="space-y-3">
      {/* Status Message */}
      <div className="flex items-center gap-3">
        {progress.status === 'processing' && (
          <Loader className="w-5 h-5 text-primary-600 animate-spin" />
        )}
        {progress.status === 'completed' && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
        {progress.status === 'failed' && (
          <AlertCircle className="w-5 h-5 text-red-600" />
        )}
        <div>
          <p className="text-sm font-medium text-slate-900">{progress.message}</p>
          <p className="text-xs text-slate-500">Status: {progress.status.toUpperCase()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            progress.status === 'completed'
              ? 'bg-green-500'
              : progress.status === 'failed'
              ? 'bg-red-500'
              : 'bg-gradient-to-r from-primary-500 to-primary-600'
          }`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">{progress.progress}%</span>
        {progress.status === 'completed' && (
          <button
            onClick={() => window.location.href = progress.audioPath}
            className="text-xs px-3 py-1 bg-green-50 text-green-700 font-medium rounded hover:bg-green-100 transition"
          >
            Download Audio
          </button>
        )}
      </div>
    </div>
  );
}
