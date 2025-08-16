/**
 * Disable console logging in production
 * This should be imported in main.jsx for production builds
 */

const isProduction = import.meta.env.MODE === 'production';

if (isProduction) {
  // Override console methods in production
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  
  // Keep console.warn and console.error for critical issues
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    // Only show critical warnings
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning:')) {
      originalWarn(...args);
    }
  };
  
  console.error = (...args) => {
    // Only show critical errors
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Error:')) {
      originalError(...args);
    }
  };
}

export default {};