/**
 * Frontend Logger Utility
 * Provides controlled logging that can be disabled in production
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

class Logger {
  constructor() {
    this.isDevelopment = isDevelopment;
    this.isProduction = isProduction;
  }

  /**
   * Log info messages (only in development)
   */
  info(message, ...args) {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message, ...args) {
    if (this.isDevelopment) {
      console.log(`🐛 ${message}`, ...args);
    }
  }

  /**
   * Log warning messages (minimal in production)
   */
  warn(message, ...args) {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    } else if (this.isProduction) {
      // Only log critical warnings in production
      console.warn(`Warning: ${message}`);
    }
  }

  /**
   * Log error messages (always shown but minimal in production)
   */
  error(message, ...args) {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, ...args);
    } else {
      // Minimal error logging in production
      console.error(`Error: ${message}`);
    }
  }

  /**
   * Log API requests (only in development)
   */
  apiRequest(method, url, data) {
    if (this.isDevelopment) {
      console.log(`🔄 API ${method.toUpperCase()}: ${url}`, data ? { data } : '');
    }
  }

  /**
   * Log API responses (only in development)
   */
  apiResponse(method, url, status, data) {
    if (this.isDevelopment) {
      const statusColor = status >= 400 ? '🔴' : status >= 300 ? '🟡' : '🟢';
      console.log(`${statusColor} API ${method.toUpperCase()}: ${url} - ${status}`, data);
    }
  }

  /**
   * Log API errors (minimal in production)
   */
  apiError(method, url, error) {
    if (this.isDevelopment) {
      console.error(`❌ API ${method.toUpperCase()}: ${url}`, error);
    } else {
      console.error(`API Error: ${method.toUpperCase()} ${url} - ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Completely silent - no logging at all
   */
  silent() {
    // Do nothing
  }
}

const logger = new Logger();
export default logger;