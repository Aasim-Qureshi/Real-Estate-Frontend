import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private progressCallbacks: ((data: any) => void)[] = [];
  private statusCallbacks: ((data: any) => void)[] = [];
  private pauseResumeCallbacks: ((data: any) => void)[] = [];

  
  connect() {
    const url = import.meta.env.VITE_SOCKET_URL;
    this.socket = io(url);

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('processing_progress', (data: any) => {
      this.progressCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('batch_status_update', (data: any) => {
      this.statusCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('processing_complete', (data: any) => {
      this.statusCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('processing_error', (data: any) => {
      this.statusCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('processing_paused', (data: any) => {
      this.pauseResumeCallbacks.forEach(callback => callback({ ...data, isPaused: true }));
    });

    this.socket.on('processing_resumed', (data: any) => {
      this.pauseResumeCallbacks.forEach(callback => callback({ ...data, isPaused: false }));
    });

    this.socket.on('processing_stopped', (data: any) => {
      this.statusCallbacks.forEach(callback => callback(data));
    });

    return this.socket;
  }

  identifyUser(userId: string) {
    this.socket?.emit('user_identified', userId);
  }

  joinBatch(batchId: string) {
    this.socket?.emit('join_batch', batchId);
  }

  startProcessing(batchId: string, reportIds: string[], numTabs: number) {
    // Validate numTabs
    const validatedNumTabs = Math.max(1, Math.min(10, Math.floor(numTabs)));
    
    console.log(`Starting processing with ${validatedNumTabs} tabs for ${reportIds.length} reports`);
    
    this.socket?.emit('start_taqeem_processing', {
      batchId,
      reportIds,
      numTabs: validatedNumTabs,
      actionType: 'process'
    });
  }

  pauseProcessing(batchId: string) {
    this.socket?.emit('pause_processing', { batchId });
  }

  resumeProcessing(batchId: string) {
    this.socket?.emit('resume_processing', { batchId });
  }

  stopProcessing(batchId: string) {
    this.socket?.emit('stop_processing', { batchId });
  }

  onProgress(callback: (data: any) => void) {
    this.progressCallbacks.push(callback);
  }

  onStatusUpdate(callback: (data: any) => void) {
    this.statusCallbacks.push(callback);
  }

  onPauseResume(callback: (data: any) => void) {
    this.pauseResumeCallbacks.push(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketClient();