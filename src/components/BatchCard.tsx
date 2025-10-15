import React from 'react';
import { type BatchStats, type Report } from '../types/reports';
import ReportCard from './ReportCard';
import { useSocket } from '../contexts/SocketContext';
import { useProgress } from '../contexts/ProgressContext';

interface BatchCardProps {
  batch: BatchStats;
  isExpanded: boolean;
  reports: Report[];
  isLoading: boolean;
  onToggle: (batchId: string) => void;
  isAuthenticated: boolean;
}

const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  isExpanded,
  reports,
  isLoading,
  onToggle,
  isAuthenticated
}) => {
  const { startProcessing, pauseProcessing, resumeProcessing } = useSocket();
  const { progress } = useProgress();

  const isCurrentBatchProcessing = progress.batchId === batch._id && progress.isProcessing;
  const isCurrentBatchPaused = progress.batchId === batch._id && progress.isPaused;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBatchStatusCapsule = () => {
    switch (batch.submissionStatus) {
      case 'completed':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
            Completed
          </span>
        );
      case 'partial':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200">
            Partial
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border border-gray-200">
            Pending
          </span>
        );
    }
  };

  const getSubmitButton = () => {
    if (batch.submissionStatus === 'completed') {
      return null; // No button when all are submitted
    } else {
      const buttonText = batch.submissionStatus === 'partial' ? 'Retry' : 'Submit Batch';
      const buttonColor = batch.submissionStatus === 'partial' ? 'yellow' : 'green';

      return (
        <button
          onClick={handleSubmitBatch}
          disabled={!isAuthenticated || batch.count === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${isAuthenticated && batch.count > 0
              ? `bg-${buttonColor}-600 text-white hover:bg-${buttonColor}-700`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          title={!isAuthenticated ? 'Please login to Taqeem first' : ''}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {batch.submissionStatus === 'partial' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              )}
            </svg>
            {buttonText}
          </div>
        </button>
      );
    }
  };

  const handleSubmitBatch = () => {
    if (!isAuthenticated) {
      alert('Please login to Taqeem first before submitting reports');
      return;
    }

    const reportIds = reports.map(report => report._id);
    console.log('Submitting batch:', batch._id, 'with report IDs:', reportIds);
    startProcessing(batch._id, reportIds);
  };

  const handlePause = () => {
    console.log('Pausing batch:', batch._id);
    pauseProcessing(batch._id);
  };

  const handleResume = () => {
    console.log('Resuming batch:', batch._id);
    resumeProcessing(batch._id);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Batch Header */}
      <div className="w-full p-6 bg-white hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onToggle(batch._id)}
            className="flex-1 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <span className="text-lg font-bold text-blue-600">{batch.count}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Reports Batch
                </h3>
                <p className="text-sm text-gray-600">
                  Uploaded {formatDate(batch.latestUpload)}
                </p>
                {/* Submission count info */}
                <p className="text-xs text-gray-500 mt-1">
                  {batch.submittedCount} of {batch.count} reports submitted
                </p>
              </div>
            </div>
          </button>

          <div className="flex items-center space-x-3">
            {/* Batch Status Capsule */}
            {getBatchStatusCapsule()}

            {/* Submit/Retry Button - Only shown when NOT processing */}
            {!isCurrentBatchProcessing && getSubmitButton()}


            {/* Control Buttons - Only shown when processing this batch */}
            {isCurrentBatchProcessing && (
              <div className="flex space-x-2">
                {!progress.isPaused ? (
                  <button
                    onClick={handlePause}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pause
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resume
                    </div>
                  </button>
                )}


              </div>
            )}

            {/* Expand/Collapse Icon */}
            <button
              onClick={() => onToggle(batch._id)}
              className="text-gray-400 transform transition-transform hover:text-gray-600"
            >
              <svg
                className={`w-5 h-5 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Processing Status Bar - Only shown when this batch is processing */}
        {isCurrentBatchProcessing && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {progress.message || 'Processing...'}
              </span>
              <span className="text-sm text-gray-600">
                {progress.current} / {progress.total} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${isCurrentBatchPaused ? 'bg-yellow-500' : 'bg-blue-600'
                  }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {isCurrentBatchPaused && (
              <p className="text-xs text-yellow-600 mt-1">⏸ Processing paused</p>
            )}
          </div>
        )}
      </div>

      {/* Batch Reports - Expanded View */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h4 className="text-md font-medium text-gray-700 mb-4">
                Reports in this batch ({reports.length})
              </h4>
              <div className="space-y-3">
                {reports.map((report) => (
                  <ReportCard key={report._id} report={report} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchCard;