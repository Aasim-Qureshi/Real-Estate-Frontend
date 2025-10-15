import React, { createContext, useContext, useEffect, useState } from 'react';
import socketClient from '../services/socketClient';

interface SocketContextType {
  isConnected: boolean;
  progressData: any | null;
  startProcessing: (batchId: string, reportIds: string[]) => void;
  pauseProcessing: (batchId: string) => void;
  resumeProcessing: (batchId: string) => void;
  stopProcessing: (batchId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [progressData, setProgressData] = useState<any | null>(null);

  useEffect(() => {
    // Connect to socket immediately when app loads
    const socket = socketClient.connect();

    socket.on('connect', () => {
      console.log('Socket connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected from server');
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    // Listen for all progress-related events
    socket.on('processing_progress', (data) => {
      console.log('Processing progress:', data);
      setProgressData(data);
    });

    socket.on('batch_status_update', (data) => {
      console.log('Batch status update:', data);
      setProgressData(data);
    });

    socket.on('processing_started', (data) => {
      console.log('Processing started:', data);
      setProgressData(data);
    });

    socket.on('processing_complete', (data) => {
      console.log('Processing complete:', data);
      setProgressData(data);
    });

    socket.on('processing_paused', (data) => {
      console.log('Processing paused:', data);
      setProgressData(data);
    });

    socket.on('processing_resumed', (data) => {
      console.log('Processing resumed:', data);
      setProgressData(data);
    });

    socket.on('processing_stopped', (data) => {
      console.log('Processing stopped:', data);
      setProgressData(data);
    });

    socket.on('processing_error', (data) => {
      console.error('Processing error:', data);
      setProgressData(data);
    });

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting socket...');
      socketClient.disconnect();
    };
  }, []); // Only run once on mount

  const startProcessing = (batchId: string, reportIds: string[]) => {
    console.log('Starting processing for batch:', batchId, 'with', reportIds.length, 'reports');
    socketClient.startProcessing(batchId, reportIds);
  };

  const pauseProcessing = (batchId: string) => {
    console.log('Pausing processing for batch:', batchId);
    socketClient.pauseProcessing(batchId);
  };

  const resumeProcessing = (batchId: string) => {
    console.log('Resuming processing for batch:', batchId);
    socketClient.resumeProcessing(batchId);
  };

  const stopProcessing = (batchId: string) => {
    console.log('Stopping processing for batch:', batchId);
    socketClient.stopProcessing(batchId);
  };

  const value: SocketContextType = {
    isConnected,
    progressData,
    startProcessing,
    pauseProcessing,
    resumeProcessing,
    stopProcessing,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};