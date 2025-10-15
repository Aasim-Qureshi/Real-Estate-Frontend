import axiosInstance from './axios.config';

export interface LoginRequest {
  email: string;
  password: string;
  recordId?: string;
}

export interface OtpRequest {
  otp: string;
  recordId?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  requiresOtp?: boolean;
  error?: string;
  recoverable?: boolean;
  data?: any;
}

export interface AuthStatus {
  success: boolean;
  data: {
    worker: {
      ready: boolean;
      workerRunning: boolean;
      pendingCommands: number;
    };
    authenticated: boolean;
  };
}

/**
 * Login to Taqeem system
 */
export const loginTaqeem = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/taqeemAuth/login', credentials);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Submit OTP for Taqeem login
 */
export const submitTaqeemOtp = async (otpData: OtpRequest): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/taqeemAuth/otp', otpData);
    return response.data;
  } catch (error: any) {
    console.error('OTP error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Logout from Taqeem system
 */
export const logoutTaqeem = async (): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    console.error('Logout error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Get authentication status
 */
export const getTaqeemAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const response = await axiosInstance.get('/taqeemAuth/status');
    return response.data;
  } catch (error: any) {
    console.error('Auth status error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Network error: Could not connect to server';
    } else {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};