import React, { useState, useEffect, useCallback } from 'react';
import { getBatchStats, getReportsByBatch } from '../api/getReports';
import { type BatchStats, type Report, type PaginatedReportsResponse } from '../types/reports';
import BatchCard from '../components/BatchCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoginModal from '../components/LoginModal';
import { getTaqeemAuthStatus } from '../api/authTaqeem';
import { useSocket } from '../contexts/SocketContext';
import { useProgress } from '../contexts/ProgressContext';

const ViewReports: React.FC = () => {
  const [batches, setBatches] = useState<BatchStats[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchReports, setBatchReports] = useState<Record<string, Report[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportsLoading, setReportsLoading] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGetReportsButton, setShowGetReportsButton] = useState(true);
  const [hasHandledCompletion, setHasHandledCompletion] = useState(false);

  const { progressData, isConnected } = useSocket();
  const { updateProgress, startProgress, completeProgress, setError: setProgressError } = useProgress();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const refetchBatchStats = useCallback(async () => {
    try {
      console.log('Refetching batch stats after completion...');
      const batchData = await getBatchStats();
      setBatches(batchData);
      console.log('Refreshed batch stats:', batchData.length, 'batches');
    } catch (err: any) {
      console.error('Failed to refetch batch stats:', err.message);
    }
  }, []);

  const resetBatchData = useCallback(() => {
    console.log('Resetting batch reports and selected batch');
    setBatchReports({});
    setSelectedBatch(null);
  }, []);

  const handleCompletion = useCallback(async () => {
    if (hasHandledCompletion) {
      console.log('Completion already handled, skipping');
      return;
    }
    
    setHasHandledCompletion(true);
    completeProgress();
    await refetchBatchStats();
    resetBatchData();
    
    // Reset flag after a delay
    setTimeout(() => {
      setHasHandledCompletion(false);
    }, 2000);
  }, [hasHandledCompletion, completeProgress, refetchBatchStats, resetBatchData]);

  useEffect(() => {
    if (!progressData) return;

    console.log('Progress update received:', progressData);
    
    switch (progressData.status) {
      case 'STARTED':
      case 'PROCESSING_STARTED':
        setHasHandledCompletion(false); // Reset completion flag
        startProgress(
          progressData.batchId, 
          progressData.totalReports || progressData.total,
          progressData.numTabs || 1
        );
        break;
      
      case 'DATA_FETCHED':
        updateProgress({
          ...progressData,
          message: `Using ${progressData.numTabs || 1} tabs for ${progressData.total} reports`
        });
        break;
      
      case 'TAB_STARTED':
      case 'TAB_COMPLETED':
      case 'TAB_FAILED':
      case 'PROCESSING':
      case 'RECORD_STARTED':
      case 'STEP_STARTED':
      case 'STEP_COMPLETED':
      case 'RECORD_COMPLETED':
      case 'RECORD_SUCCESS':
        updateProgress(progressData);
        break;
      
      case 'COMPLETED':
      case 'BATCH_COMPLETED':
      case 'PROCESSING_COMPLETE':
        handleCompletion();
        break;
      
      case 'FAILED':
      case 'ERROR':
      case 'PROCESSING_ERROR':
        setProgressError(progressData.error || 'Processing failed');
        setHasHandledCompletion(false);
        break;
      
      case 'PAUSED':
        updateProgress({ ...progressData, isPaused: true });
        break;
      
      case 'RESUMED':
        updateProgress({ ...progressData, isPaused: false });
        break;
      
      case 'STOPPED':
        updateProgress({ ...progressData, isProcessing: false, status: 'STOPPED' });
        setHasHandledCompletion(false);
        break;
      
      default:
        updateProgress(progressData);
    }
  }, [progressData]);

  const checkAuthStatus = async () => {
    try {
      const status = await getTaqeemAuthStatus();
      setIsAuthenticated(status.data.authenticated);
      console.log('Taqeem authentication status:', status.data.authenticated);
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const handleGetReports = async () => {
    try {
      setLoading(true);
      setShowGetReportsButton(false);
      setError(null);
      setHasHandledCompletion(false);
      
      const batchData = await getBatchStats();
      setBatches(batchData);
      console.log('Loaded', batchData.length, 'batches');
    } catch (err: any) {
      setError(err.message || 'Failed to load batches');
      setShowGetReportsButton(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchToggle = async (batchId: string) => {
    if (selectedBatch === batchId) {
      setSelectedBatch(null);
      return;
    }

    if (batchReports[batchId]) {
      setSelectedBatch(batchId);
      return;
    }

    try {
      setReportsLoading(batchId);
      setSelectedBatch(batchId);
      
      const response: PaginatedReportsResponse = await getReportsByBatch(batchId, 1, 1000);
      
      setBatchReports(prev => ({
        ...prev,
        [batchId]: response.data.forms
      }));

      console.log('Loaded', response.data.forms.length, 'reports for batch', batchId);
    } catch (err: any) {
      setError(err.message || 'Failed to load batch reports');
      setSelectedBatch(null);
    } finally {
      setReportsLoading(null);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    checkAuthStatus();
    console.log('Login successful - submit buttons enabled');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">View Reports</h1>
            <p className="text-gray-600">Browse and analyze your real estate reports</p>
          </div>
          
          <button
            onClick={() => setLoginModalOpen(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAuthenticated 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAuthenticated ? (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Taqeem Connected
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Taqeem Login
              </div>
            )}
          </button>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Global Progress Bar */}

      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">View Reports</h1>
          <p className="text-gray-600">Browse and analyze your real estate reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Socket Connection Indicator */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </div>

          {/* Taqeem Login Button */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAuthenticated 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAuthenticated ? (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Taqeem Connected
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Taqeem Login
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Progress Monitor - Shows when processing with multiple tabs */}

      {/* Get All Reports Button */}
      {showGetReportsButton && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 text-gray-400">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">View Your Reports</h2>
            <p className="text-gray-600 mb-8">
              Click the button below to load all your real estate reports and analyze them.
            </p>
            <button
              onClick={handleGetReports}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Get All Reports
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      {/* No Batches Message */}
      {!showGetReportsButton && !loading && batches.length === 0 && (
        <EmptyState />
      )}

      {/* Batch Cards */}
      {!showGetReportsButton && batches.length > 0 && (
        <div className="space-y-4">
          {batches.map((batch) => (
            <BatchCard
              key={batch._id}
              batch={batch}
              isExpanded={selectedBatch === batch._id}
              reports={batchReports[batch._id] || []}
              isLoading={reportsLoading === batch._id}
              onToggle={handleBatchToggle}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default ViewReports;