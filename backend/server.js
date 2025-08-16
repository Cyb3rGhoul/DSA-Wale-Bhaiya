import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow localhost on any port
    if (config.nodeEnv === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Check against configured frontend URL
    if (origin === config.frontendUrl) {
      return callback(null, true);
    }

    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

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
    },
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'API is running',
    data: apiInfo
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;