import axios from 'axios';
import logger from '../utils/logger.js';

// Create axios instance with base configuration
const getApiBaseURL = () => {
  // In production, use the environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';
  }
  // In development, use proxy or localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json'
  }
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

export const chatService = {
  /**
   * Get all user chats
   */
  async getChats(options = {}) {
    try {
      const { archived = false, limit = 50 } = options;
      const params = new URLSearchParams();
      
      if (archived === 'all') {
        params.append('archived', 'all');
      } else if (archived) {
        params.append('archived', 'true');
      }
      
      if (limit) {
        params.append('limit', limit.toString());
      }

      const response = await api.get(`/chats?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get specific chat by ID
   */
  async getChat(chatId) {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new chat
   */
  async createChat(chatData) {
    try {
      const response = await api.post('/chats', chatData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update chat
   */
  async updateChat(chatId, updates) {
    try {
      const response = await api.put(`/chats/${chatId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete chat
   */
  async deleteChat(chatId) {
    try {
      const response = await api.delete(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add message to chat
   */
  async addMessage(chatId, messageData) {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Archive chat
   */
  async archiveChat(chatId) {
    try {
      const response = await api.post(`/chats/${chatId}/archive`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unarchive chat
   */
  async unarchiveChat(chatId) {
    try {
      const response = await api.post(`/chats/${chatId}/unarchive`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};