import React, { useState, useRef, useEffect } from 'react';
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
  const [numTabs, setNumTabs] = useState<number>(1);
  const [showTabInput, setShowTabInput] = useState(false);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const tabInputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCurrentBatchProcessing = progress.batchId === batch._id && progress.isProcessing;
  const isCurrentBatchPaused = progress.batchId === batch._id && progress.isPaused;

  const getEffectiveProgress = () => {
    if (!isCurrentBatchProcessing) {
      return { percentage: 0, current: 0, total: 0, message: '' };
    }

    // Use the progress context values directly
    return {
      percentage: progress.percentage || 0,
      current: progress.current || 0,
      total: progress.total || batch.count || 0,
      message: progress.message || 'Processing...'
    };
  };

  const effectiveProgress = getEffectiveProgress();

  // Add debug logging to track progress updates - ADD THIS USEEFFECT
  useEffect(() => {
    if (isCurrentBatchProcessing) {
      console.log('BatchCard Progress Update:', {
        batchId: batch._id,
        percentage: effectiveProgress.percentage,
        current: effectiveProgress.current,
        total: effectiveProgress.total,
        message: effectiveProgress.message,
        isPaused: isCurrentBatchPaused
      });
    }
  }, [effectiveProgress, isCurrentBatchProcessing, isCurrentBatchPaused, batch._id]);

  // Reset completion state when batch changes or processing starts
  useEffect(() => {
    if (isCurrentBatchProcessing) {
      setIsProcessingComplete(false);
    }
  }, [isCurrentBatchProcessing, batch._id]);

  // Handle processing completion
  useEffect(() => {
    if (isCurrentBatchProcessing && effectiveProgress.percentage === 100 && !progress.isProcessing) {
      setIsProcessingComplete(true);
      console.log('Batch processing completed:', batch._id);
      // Auto-hide the completion state after 5 seconds
      const timer = setTimeout(() => {
        setIsProcessingComplete(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCurrentBatchProcessing, effectiveProgress.percentage, progress.isProcessing, batch._id]);

  // Debug logging
  useEffect(() => {
    console.log('Current numTabs:', numTabs);
    console.log('Batch count:', batch.count);
    console.log('Show tab input:', showTabInput);
  }, [numTabs, batch.count, showTabInput]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBatchStatusCapsule = () => {
    // Show processing status first if currently processing
    if (isCurrentBatchProcessing) {
      if (isCurrentBatchPaused) {
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200">
            ⏸ Paused
          </span>
        );
      }
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200">
          🔄 Processing...
        </span>
      );
    }

    // Show completion status if just finished processing
    if (isProcessingComplete) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200 animate-pulse">
          ✅ Complete
        </span>
      );
    }

    // Otherwise show normal batch status
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

  const handleTabInputToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowTabInput(!showTabInput);
    // Focus and select input when shown
    setTimeout(() => {
      if (!showTabInput && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty value during typing
    if (value === '') {
      setNumTabs(1);
      return;
    }
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      // More permissive validation using batch.count
      const maxTabs = Math.min(10, Math.max(1, batch.count));
      const validatedValue = Math.max(1, Math.min(maxTabs, numValue));
      setNumTabs(validatedValue);
    }
  };

  const handleTabInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    if (e.key === 'Enter') {
      setShowTabInput(false);
    } else if (e.key === 'Escape') {
      setShowTabInput(false);
      // Reset to previous valid value
      setNumTabs(prev => prev);
    }
  };

  const handleTabInputBlur = () => {
    // Ensure we have at least 1 tab
    if (numTabs < 1) {
      setNumTabs(1);
    }
    // Small delay to allow for button clicks
    setTimeout(() => {
      setShowTabInput(false);
    }, 150);
  };

  const getSubmitButton = () => {
    // Don't show submit button if currently processing or just completed
    if (isCurrentBatchProcessing || isProcessingComplete) {
      return null;
    }

    if (batch.submissionStatus === 'completed') {
      return null;
    } else {
      const buttonText = batch.submissionStatus === 'partial' ? 'Retry' : 'Submit Batch';
      const buttonColor = batch.submissionStatus === 'partial' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700';

      return (
        <div className="flex items-center space-x-2">
          {/* Tab Count Input */}
          <div className="relative" ref={tabInputRef}>
            {showTabInput ? (
              <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm px-2 py-1">
                
                <input
                  ref={inputRef}
                  type="number"
                  min="1"
                  max={Math.min(10, batch.count)}
                  value={numTabs}
                  onChange={handleTabChange}
                  onKeyDown={handleTabInputKeyDown}
                  onBlur={handleTabInputBlur}
                  className="w-12 text-center border-0 focus:ring-0 text-sm font-medium bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              
              </div>
            ) : (
              <button
                onClick={handleTabInputToggle}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center text-sm"
                title="Set number of tabs for processing"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                {numTabs} tab{numTabs > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitBatch}
            disabled={!isAuthenticated || batch.count === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAuthenticated && batch.count > 0
                ? `${buttonColor} text-white`
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
        </div>
      );
    }
  };

  const getControlButtons = () => {
    if (!isCurrentBatchProcessing) {
      return null;
    }

    return (
      <div className="flex items-center space-x-2">
        {isCurrentBatchPaused ? (
          <button
            onClick={handleResume}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resume
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause
          </button>
        )}
      </div>
    );
  };

  const handleSubmitBatch = () => {
    if (!isAuthenticated) {
      alert('Please login to Taqeem first before submitting reports');
      return;
    }

    // Reset completion state when starting new processing
    setIsProcessingComplete(false);

    // Calculate optimal number of tabs (don't use more tabs than reports)
    const reportIds = batch.reportIds;

    console.log(`Submitting batch: ${batch._id} with ${reportIds.length} reports using ${numTabs} tabs`);
    startProcessing(batch._id, reportIds, numTabs);
  };

  const handlePause = () => {
    console.log('Pausing batch:', batch._id);
    pauseProcessing(batch._id);
  };

  const handleResume = () => {
    console.log('Resuming batch:', batch._id);
    resumeProcessing(batch._id);
  };

  // Close tab input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabInputRef.current && !tabInputRef.current.contains(event.target as Node)) {
        setShowTabInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set optimal tabs when batch count changes - only set initial value
  useEffect(() => {
    if (batch.count > 0 && numTabs === 1) {
      const optimalTabs = Math.min(5, Math.max(1, Math.ceil(batch.count / 10)));
      setNumTabs(optimalTabs);
    }
  }, [batch.count]); // Removed numTabs from dependencies

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

            {/* Submit/Retry Button - Only shown when NOT processing or recently completed */}
            {getSubmitButton()}

            {/* Control Buttons - Only shown when processing this batch */}
            {getControlButtons()}

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

        {/* Improved Processing Status Bar - Only shown when this batch is processing */}
        {isCurrentBatchProcessing && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {effectiveProgress.message}
                {progress.numTabs && progress.numTabs > 1 && ` • Using ${progress.numTabs} tabs`}
              </span>
              <span className="text-sm text-gray-600">
                {effectiveProgress.current} / {effectiveProgress.total} 
                ({effectiveProgress.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  isCurrentBatchPaused 
                    ? 'bg-yellow-500' 
                    : effectiveProgress.percentage === 100 
                      ? 'bg-green-600' 
                      : 'bg-blue-600'
                }`}
                style={{ 
                  width: `${Math.max(0, Math.min(100, effectiveProgress.percentage))}%`,
                  transition: 'width 0.5s ease-out'
                }}
              />
            </div>
            
            {/* Show tab progress if multiple tabs */}
            {progress.numTabs && progress.numTabs > 1 && Object.keys(progress.tabProgresses).length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Tab Progress:</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.values(progress.tabProgresses).map((tab) => (
                    <div key={tab.tabId} className="flex items-center space-x-1">
                      <span className="text-xs font-medium">Tab {tab.tabId}:</span>
                      <div className="flex-1 bg-gray-300 rounded-full h-1">
                        <div 
                          className="h-1 rounded-full bg-blue-400 transition-all duration-300"
                          style={{ 
                            width: `${tab.percentage || (tab.current && tab.total ? Math.round((tab.current / tab.total) * 100) : 0)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {tab.current || 0}/{tab.total || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCurrentBatchPaused && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Processing paused
              </p>
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
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">
                  Reports in this batch ({reports.length})
                </h4>
                {!isCurrentBatchProcessing && batch.count > 1 && (
                  <div className="text-sm text-gray-500">
                    Max: {Math.min(10, batch.count)} tabs
                  </div>
                )}
              </div>
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