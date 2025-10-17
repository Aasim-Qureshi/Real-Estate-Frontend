import React from 'react';
import { useProgress } from '../contexts/ProgressContext';

const GlobalProgressBar: React.FC = () => {
  const { progress } = useProgress();

  if (!progress.isProcessing && progress.status === 'IDLE') {
    return null;
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case 'PROCESSING':
      case 'STARTED':
      case 'RESUMED':
        return 'bg-blue-600';
      case 'PAUSED':
        return 'bg-yellow-500';
      case 'COMPLETED':
        return 'bg-green-600';
      case 'ERROR':
        return 'bg-red-600';
      case 'STOPPED':
        return 'bg-gray-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'PROCESSING':
      case 'STARTED':
      case 'RESUMED':
        return (
          <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'PAUSED':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'COMPLETED':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ERROR':
        return (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center flex-1">
            {getStatusIcon()}
            <div className="flex-1 mr-4">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>
                  Batch {progress.batchId?.slice(0, 8)}... - {progress.message}
                </span>
                <span>
                  {progress.current} / {progress.total} ({Math.round(progress.percentage)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {progress.error && (
            <div className="ml-4 text-sm text-red-600">
              Error: {progress.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

