import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { sendError } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (for browser requests)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Find active session with this token
    const session = await Session.findActiveByToken(token);
    if (!session) {
      return sendError(res, 'Invalid or expired session.', 401);
    }

    // Check if user is still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      // Deactivate session if user is inactive
      await session.deactivate();
      return sendError(res, 'User account is inactive.', 401);
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401);
    } else if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired.', 401);
    } else {
      return sendError(res, 'Token verification failed.', 401);
    }
  }
});

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't require authentication
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Find active session
    const session = await Session.findActiveByToken(token);
    if (!session) {
      return next();
    }

    // Check if user is still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next();
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    req.token = token;
  } catch (error) {
    // Silently continue if token is invalid in optional auth
  }

  next();
});

/**
 * Role-based Authorization Middleware
 * Requires authentication and checks user roles (for future use)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Access denied. Authentication required.', 401);
    }

    // For now, all authenticated users have access
    // In the future, you can implement role-based access control
    if (roles.length > 0 && req.user.role && !roles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Insufficient permissions.', 403);
    }

    next();
  };
};

/**
 * Refresh Token Middleware
 * Verifies refresh token for token renewal
 */
export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  let refreshToken;

  // Check for refresh token in body or cookies
  if (req.body.refreshToken) {
    refreshToken = req.body.refreshToken;
  } else if (req.cookies && req.cookies.refreshToken) {
    refreshToken = req.cookies.refreshToken;
  }

  if (!refreshToken) {
    return sendError(res, 'Refresh token is required.', 401);
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    
    // Find active session with this refresh token
    const session = await Session.findActiveByRefreshToken(refreshToken);
    if (!session) {
      return sendError(res, 'Invalid or expired refresh token.', 401);
    }

    // Check if user is still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      // Deactivate session if user is inactive
      await session.deactivate();
      return sendError(res, 'User account is inactive.', 401);
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid refresh token.', 401);
    } else if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Refresh token expired.', 401);
    } else {
      return sendError(res, 'Refresh token verification failed.', 401);
    }
  }
});