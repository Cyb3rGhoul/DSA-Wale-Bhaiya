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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
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
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/auth/refresh');
        
        if (refreshResponse.data.success) {
          // Store new token if provided
          if (refreshResponse.data.data.accessToken) {
            localStorage.setItem('accessToken', refreshResponse.data.data.accessToken);
          }
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

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
      
      // Store token if provided
      if (response.data.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
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
      
      // Store token if provided
      if (response.data.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
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
      const response = await api.post('/auth/refresh');
      
      // Store new token if provided
      if (response.data.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
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
   * Clear stored tokens
   */
  clearTokens() {
    localStorage.removeItem('accessToken');
  }
};