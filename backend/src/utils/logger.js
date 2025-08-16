import config from '../config/env.js';

/**
 * Logger utility with different log levels
 * Reduces console noise in production
 */
class Logger {
  constructor() {
    this.isDevelopment = config.nodeEnv === 'development';
    this.isProduction = config.nodeEnv === 'production';
  }

  /**
   * Log info messages (only in development)
   */
  info(message, ...args) {
    if (this.isDevelopment) {
      console.log(`ℹ️  ${message}`, ...args);
    }
  }

  /**
   * Log success messages (only in development)
   */
  success(message, ...args) {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  /**
   * Log warning messages (always shown but minimal in production)
   */
  warn(message, ...args) {
    if (this.isDevelopment) {
      console.warn(`⚠️  ${message}`, ...args);
    } else {
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
      console.error(`Error: ${message}`);
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
   * Log HTTP requests (only in development)
   */
  http(method, url, status, duration, ip) {
    if (this.isDevelopment) {
      const statusColor = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${method} ${url} - ${statusColor}${status}\x1b[0m - ${duration}ms - ${ip}`);
    }
  }

  /**
   * Log database connections (minimal in production)
   */
  database(message, ...args) {
    if (this.isDevelopment) {
      console.log(`💾 ${message}`, ...args);
    } else if (message.includes('Connected') || message.includes('connection failed')) {
      console.log(message);
    }
  }

  /**
   * Log server startup (always shown but clean)
   */
  server(message, ...args) {
    if (this.isDevelopment) {
      console.log(`🚀 ${message}`, ...args);
    } else {
      console.log(message);
    }
  }
}

const logger = new Logger();
export default logger;