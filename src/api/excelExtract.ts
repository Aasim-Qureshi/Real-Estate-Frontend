import axiosInstance from './axios.config';
import { type UploadedFile, type ExcelExtractResponse, type UploadResult, type UploadProgressCallback } from '../types/upload';

/**
 * Upload progress callback type
 */


/**
 * Uploads Excel and PDF files to the extraction endpoint using Axios
 * @param excelFile - The Excel file to upload
 * @param pdfFiles - Array of PDF files to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with upload result
 */

export const uploadForExtraction = async (
  excelFile: File,
  pdfFiles: File[] = [],
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Append Excel file
    formData.append('excelFile', excelFile);
    
    // Append PDF files
    pdfFiles.forEach(pdfFile => {
      formData.append('pdfFiles', pdfFile);
    });

    // Make the API call with axios
    const response = await axiosInstance.post<ExcelExtractResponse>(
      '/estate/excel-extract',
      formData,
      {
        headers: {
          // Let axios/browser set the Content-Type with boundary automatically
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(Math.round(progress));
          }
        },
      }
    );

    return {
      success: true,
      data: response.data.data
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Extract error message from axios error
    let errorMessage = 'Unknown error occurred';
    let statusCode;
    
    if (error.response) {
      // Server responded with error status
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error: Could not connect to server';
    } else {
      // Something else happened
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
      status: statusCode
    };
  }
};

/**
 * Upload with UploadedFile objects (compatible with your existing component)
 */
export const uploadExtractionWithUploadedFiles = async (
  excelFiles: UploadedFile[],
  pdfFiles: UploadedFile[] = [],
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  if (!excelFiles.length) {
    return {
      success: false,
      error: 'No Excel file provided'
    };
  }

  const excelFile = excelFiles[0].file;
  const pdfFileList = pdfFiles.map(pf => pf.file);

  return uploadForExtraction(excelFile, pdfFileList, onProgress);
};

/**
 * Check if the API server is reachable
 */
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    await axiosInstance.get('/health');
    return true;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};
