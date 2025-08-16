import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import custom middleware and utilities
import config from './src/config/env.js';
import connectDB from './src/config/database.js';
import errorHandler from './src/middleware/errorHandler.js';
import requestLogger from './src/middleware/logger.js';
import logger from './src/utils/logger.js';
import { sendSuccess } from './src/utils/response.js';
import { getDatabaseStatus, isDatabaseHealthy } from './src/utils/dbStatus.js';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.port;

// Connect to MongoDB
connectDB();

// Request logging middleware (only in development)
if (config.nodeEnv === 'development') {
  app.use(requestLogger);
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Enhanced health check route
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = isDatabaseHealthy();
  
  const healthData = {
    status: isHealthy ? 'OK' : 'DEGRADED',
    message: 'DSA Brother Bot Backend is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: dbStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  
  const statusCode = isHealthy ? 200 : 503;
  const message = isHealthy ? 'Health check successful' : 'Service degraded - database issues';
  
  res.status(statusCode).json({
    success: isHealthy,
    message,
    data: healthData
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// API info route
app.get('/api', (req, res) => {
  const apiInfo = {
    message: 'DSA Brother Bot API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      chats: '/api/chats',
      users: '/api/users (coming soon)'
    }
  };
  
  sendSuccess(res, apiInfo, 'API information');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Use custom error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.server(`Server running on port ${PORT}`);
  if (config.nodeEnv === 'development') {
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Frontend URL: ${config.frontendUrl}`);
    logger.info(`MongoDB URI: ${config.mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
  }
});

export default app;