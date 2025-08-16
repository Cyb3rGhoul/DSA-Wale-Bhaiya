import logger from '../utils/logger.js';

// Request logging middleware
const requestLogger = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  // Log response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    logger.http(method, url, status, duration, ip);
  });

  next();
};

export default requestLogger;