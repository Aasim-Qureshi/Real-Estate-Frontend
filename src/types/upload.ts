export interface UploadedFile {
  id: string;
  file: File;
  status: 'ready' | 'completed' | 'error'; // Simplified status
  error?: string;
}

export interface UploadBlockProps {
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  onFilesChange: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  disabled?: boolean;
}

export interface ExcelExtractResponse {
  success: boolean;
  message: string;
  data: {
    fileName: string;
    batchId: string;
    headers: string[];
    totalRows: number;
    insertedCount: number;
    databaseIds: string[];
    pdfStats: {
      totalPdfs: number;
      matchedPdfs: number;
      unmatchedPdfs: number;
    };
  };
}

export interface UploadResult {
  success: boolean;
  data?: ExcelExtractResponse['data'];
  error?: string;
  status?: number;
}

export type UploadProgressCallback = (progress: number) => void;