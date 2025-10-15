// In your ProgressContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import socketClient from '../services/socketClient'; // Import your socket client

interface ProgressState {
  batchId: string | null;
  isProcessing: boolean;
  isPaused: boolean;
  current: number;
  total: number;
  percentage: number;
  status: string;
  message: string;
  error: string | null;
}

interface ProgressContextType {
  progress: ProgressState;
  startProgress: (batchId: string, total: number) => void;
  updateProgress: (data: any) => void;
  pauseProgress: () => void;
  resumeProgress: () => void;
  stopProgress: () => void;
  completeProgress: () => void;
  setError: (error: string) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: React.ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressState>({
    batchId: null,
    isProcessing: false,
    isPaused: false,
    current: 0,
    total: 0,
    percentage: 0,
    status: 'IDLE',
    message: '',
    error: null,
  });

  // Listen for pause/resume events from socket
  React.useEffect(() => {
    const handlePauseResume = (data: any) => {
      setProgress(prev => ({
        ...prev,
        isPaused: data.isPaused,
        status: data.isPaused ? 'PAUSED' : 'PROCESSING',
        message: data.isPaused ? 'Processing paused' : 'Processing resumed'
      }));
    };

    socketClient.onPauseResume(handlePauseResume);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const startProgress = useCallback((batchId: string, total: number) => {
    setProgress({
      batchId,
      isProcessing: true,
      isPaused: false,
      current: 0,
      total,
      percentage: 0,
      status: 'STARTED',
      message: 'Starting processing...',
      error: null,
    });
  }, []);

  const updateProgress = useCallback((data: any) => {
    setProgress(prev => ({
      ...prev,
      current: data.current || prev.current,
      total: data.total || prev.total,
      percentage: data.percentage !== undefined ? data.percentage : prev.percentage,
      status: data.status || prev.status,
      message: data.message || prev.message,
      error: data.error || prev.error,
    }));
  }, []);

  const pauseProgress = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isPaused: true,
      status: 'PAUSED',
      message: 'Processing paused',
    }));
  }, []);

  const resumeProgress = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isPaused: false,
      status: 'PROCESSING',
      message: 'Processing resumed',
    }));
  }, []);

  const stopProgress = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isProcessing: false,
      isPaused: false,
      status: 'STOPPED',
      message: 'Processing stopped',
    }));
  }, []);

  const completeProgress = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isProcessing: false,
      isPaused: false,
      current: prev.total,
      percentage: 100,
      status: 'COMPLETED',
      message: 'Processing completed successfully',
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setProgress(prev => ({
      ...prev,
      isProcessing: false,
      status: 'ERROR',
      message: 'Processing failed',
      error,
    }));
  }, []);

  const value: ProgressContextType = {
    progress,
    startProgress,
    updateProgress,
    pauseProgress,
    resumeProgress,
    stopProgress,
    completeProgress,
    setError,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};