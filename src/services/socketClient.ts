import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private progressCallbacks: ((data: any) => void)[] = [];
  private statusCallbacks: ((data: any) => void)[] = [];
  private pauseResumeCallbacks: ((data: any) => void)[] = [];

  connect() {
    this.socket = io('http://localhost:5000');

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

    // Add pause/resume events
    this.socket.on('processing_paused', (data: any) => {
      this.pauseResumeCallbacks.forEach(callback => callback({ ...data, isPaused: true }));
    });

    this.socket.on('processing_resumed', (data: any) => {
      this.pauseResumeCallbacks.forEach(callback => callback({ ...data, isPaused: false }));
    });

    return this.socket;
  }

  identifyUser(userId: string) {
    this.socket?.emit('user_identified', userId);
  }

  joinBatch(batchId: string) {
    this.socket?.emit('join_batch', batchId);
  }

  startProcessing(batchId: string, reportIds: string[]) {
    this.socket?.emit('start_taqeem_processing', {
      batchId,
      reportIds,
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