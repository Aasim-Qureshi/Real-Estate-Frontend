import axiosInstance from './axios.config';
import { 
  type Report, 
  type PaginatedReportsResponse,
  type BatchStats,
  type ReportsFilter 
} from '../types/reports';

/**
 * Get all reports with pagination and filtering
 */
export const getAllReports = async (
  filters?: ReportsFilter
): Promise<PaginatedReportsResponse> => {
  try {
    const response = await axiosInstance.get<PaginatedReportsResponse>('/estate/reports', {
      params: filters
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Get all reports error:', error);
    
    let errorMessage = 'Unknown error occurred';
    let statusCode;
    
    if (error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get all reports without pagination (simple version)
 */
export const getAllReportsSimple = async (): Promise<{
  success: boolean;
  data: Report[];
  count: number;
  message: string;
}> => {
  try {
    const response = await axiosInstance.get('/estate/reports/all');
    return response.data;
  } catch (error: any) {
    console.error('Get all reports simple error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get report by ID
 */
export const getReportById = async (id: string): Promise<Report> => {
  try {
    const response = await axiosInstance.get(`/estate/reports/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get report by ID error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Report not found';
      } else {
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get batch statistics
 */
export const getBatchStats = async (): Promise<BatchStats[]> => {
  try {
    const response = await axiosInstance.get('/estate/reports/batch-stats');
    return response.data.data;
  } catch (error: any) {
    console.error('Get batch stats error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Search reports by filename or type
 */
export const searchReports = async (searchTerm: string, page = 1, limit = 50): Promise<PaginatedReportsResponse> => {
  return getAllReports({
    search: searchTerm,
    page,
    limit
  });
};

/**
 * Get reports by batch ID
 */
export const getReportsByBatch = async (batchId: string, page = 1, limit = 50): Promise<PaginatedReportsResponse> => {
  return getAllReports({
    batchId,
    page,
    limit
  });
};

/**
 * Get reports with custom sorting
 */
export const getReportsSorted = async (
  sortBy: string = 'ts', 
  sortOrder: 'asc' | 'desc' = 'desc', 
  page = 1, 
  limit = 50
): Promise<PaginatedReportsResponse> => {
  return getAllReports({
    sortBy,
    sortOrder,
    page,
    limit
  });
};