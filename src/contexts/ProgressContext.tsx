import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface TabProgress {
  tabId: number;
  status: string;
  message: string;
  current?: number;
  total?: number;
  step?: number;
  isMainTab?: boolean;
  percentage?: number;
}

interface ProgressState {
  batchId: string | null;
  isProcessing: boolean;
  isPaused: boolean;
  current: number;
  total: number;
  percentage: number;
  message: string;
  status: string;
  numTabs?: number;
  tabProgresses: Record<number, TabProgress>;
  error: string | null;
}

interface ProgressContextType {
  progress: ProgressState;
  startProgress: (batchId: string, total: number, numTabs?: number) => void;
  updateProgress: (data: any) => void;
  completeProgress: () => void;
  setError: (error: string) => void;
  resetProgress: () => void;
}

const initialState: ProgressState = {
  batchId: null,
  isProcessing: false,
  isPaused: false,
  current: 0,
  total: 0,
  percentage: 0,
  message: '',
  status: '',
  numTabs: 1,
  tabProgresses: {},
  error: null
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressState>(initialState);

  // Helper function to calculate percentage
  const calculatePercentage = useCallback((current: number, total: number): number => {
    if (total <= 0) return 0;
    return Math.round((current / total) * 100);
  }, []);

  const startProgress = (batchId: string, total: number, numTabs: number = 1) => {
    console.log(`Starting progress tracking for batch ${batchId} with ${total} items using ${numTabs} tabs`);
    setProgress({
      ...initialState,
      batchId,
      isProcessing: true,
      total,
      numTabs,
      percentage: 0,
      message: `Starting processing with ${numTabs} tab${numTabs > 1 ? 's' : ''}...`
    });
  };

const updateProgress = (data: any) => {
  setProgress(prev => {
    // Calculate percentage based on current progress
    const current = data.current ?? prev.current;
    const total = data.total ?? prev.total;
    const calculatedPercentage = calculatePercentage(current, total);

    // More comprehensive equality check
    const isSameStatus = data.status === prev.status;
    const isSameCurrent = current === prev.current;
    const isSameTotal = total === prev.total;
    const isSamePercentage = calculatedPercentage === prev.percentage;
    const isSameMessage = data.message === prev.message;
    const isSameBatchId = data.batchId === prev.batchId;

    if (isSameStatus && isSameCurrent && isSameTotal && 
        isSamePercentage && isSameMessage && isSameBatchId) {
      return prev;
    }

    const updates: Partial<ProgressState> = {
      batchId: data.batchId || prev.batchId,
      message: data.message || prev.message,
      status: data.status || prev.status,
      current,
      total,
      percentage: calculatedPercentage,
      numTabs: data.numTabs ?? prev.numTabs,
      isPaused: data.isPaused ?? prev.isPaused,
      isProcessing: data.isProcessing ?? prev.isProcessing,
    };

    // Remove tab-specific progress handling since we're only tracking main tab
    // Keep tabProgresses as empty object

    // Handle completion
    if (data.status === 'COMPLETED' || data.status === 'BATCH_COMPLETED') {
      updates.isProcessing = false;
      updates.isPaused = false;
      updates.percentage = 100;
      updates.current = total;
      updates.message = data.message || 'Processing completed';
      updates.status = 'COMPLETED';
    }

    // Handle errors
    if (data.status === 'FAILED' || data.status === 'ERROR') {
      updates.isProcessing = false;
      updates.isPaused = false;
      updates.error = data.message || data.error || 'An error occurred';
      updates.status = 'FAILED';
    }

    return { ...prev, ...updates };
  });
};

  const completeProgress = () => {
    console.log('Progress completed');
    setProgress(prev => ({
      ...prev,
      isProcessing: false,
      isPaused: false,
      percentage: 100,
      current: prev.total,
      message: 'Processing completed',
      status: 'COMPLETED'
    }));
  };

  const setError = (error: string) => {
    console.error('Progress error:', error);
    setProgress(prev => ({
      ...prev,
      isProcessing: false,
      isPaused: false,
      error,
      message: error,
      status: 'FAILED'
    }));
  };

  const resetProgress = () => {
    console.log('Resetting progress');
    setProgress(initialState);
  };

  const value: ProgressContextType = {
    progress,
    startProgress,
    updateProgress,
    completeProgress,
    setError,
    resetProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};