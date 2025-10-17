export interface Report {
  _id: string;
  type: string;
  batch_id: string;
  row_number: number;
  ts: string;
  report_asset_file: string;
  form_id: string;
  [key: string]: any; // For dynamic Excel columns
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface PaginatedReportsResponse {
  success: boolean;
  data: {
    forms: Report[];
    pagination: PaginationInfo;
  };
  message: string;
}

export interface BatchStats {
  _id: string;
  count: number;
  latestUpload: string;
  earliestUpload: string;
  submissionStatus: 'pending' | 'partial' | 'completed';
  submittedCount: number;
   reportIds: string[]; // Add this
  percentage: number;
}

export interface ReportsFilter {
  page?: number;
  limit?: number;
  batchId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}