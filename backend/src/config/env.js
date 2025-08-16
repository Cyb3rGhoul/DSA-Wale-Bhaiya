import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Missing required environment variables:', missing.join(', '));
      process.exit(1);
    } else {
      // Only show in development
      console.warn('Running in development mode with missing environment variables:', missing.join(', '));
    }
  }
};

// Environment configuration object
const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-brother-bot',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-development',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-for-development',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // Security
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
};

// Validate environment on import
validateEnv();

export default config;