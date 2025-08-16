import axios from 'axios';
import logger from '../utils/logger.js';

// Create axios instance with base configuration
const getApiBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // If API URL is set, use it
  if (apiUrl && apiUrl !== '/api') {
    return apiUrl;
  }
  
  // In development, use direct localhost connection
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // In production, use environment variable or fallback
  return import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: false, // Disable for now to fix CORS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token is handled via cookies, but we can also support Authorization header
    const token = localStorage.getItem('accessToken');
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token in localStorage:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Added Bearer token to request');
    } else {
      console.log('❌ No token found in localStorage');
    }
    
    // Log API requests only in development
    logger.apiRequest(config.method?.toUpperCase() || 'GET', config.url, config.data);
    
    return config;
  },
  (error) => {
    logger.apiError('REQUEST', error.config?.url || 'unknown', error);
    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Store both tokens if provided
      if (response.data.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }
      if (response.data.data?.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store both tokens if provided
      if (response.data.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }
      if (response.data.data?.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout current session
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Silent error handling - logout should always clear local storage
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Logout from all devices
   */
  async logoutAll() {
    try {
      await api.post('/auth/logout-all');
    } catch (error) {
      // Silent error handling - logout should always clear local storage
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Get current user data
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      
      // Store new tokens if provided
      if (response.data.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }
      if (response.data.data?.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user sessions
   */
  async getSessions() {
    try {
      const response = await api.get('/auth/sessions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token;
  },

  /**
   * Get stored access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Clear stored tokens
   */
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Response interceptor to handle token refresh (moved after authService definition)
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    
    // Log API responses only in development
    logger.apiResponse(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url,
      response.status,
      response.data
    );
    return response;
  },
  async (error) => {
    console.log('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
    console.log('❌ Error details:', error.response?.data);
    
    // Log API errors
    logger.apiError(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || 'unknown',
      error
    );

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('🔥 Network Error - Backend might be down or CORS issue');
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Got 401, attempting token refresh...');
      originalRequest._retry = true;

      try {
        // Try to refresh the token using the auth service
        const refreshResponse = await authService.refreshToken();
        
        if (refreshResponse.success) {
          console.log('✅ Token refresh successful');
          
          // Retry the original request with new token
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('🔄 Retrying original request with new token');
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('❌ Token refresh failed:', refreshError.response?.status);
        // Refresh failed, clear tokens and reject
        authService.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);