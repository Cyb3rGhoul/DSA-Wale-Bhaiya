import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import config from '../config/env.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { sendSuccess, sendError } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const payload = { userId };
  
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
  
  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire
  });
  
  return { accessToken, refreshToken };
};

/**
 * Calculate token expiration times
 */
const getTokenExpirationTimes = () => {
  const accessTokenExpiry = new Date();
  const refreshTokenExpiry = new Date();
  
  // Parse expiration times (15m, 7d, etc.)
  const parseExpiry = (expiry) => {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000; // Default 15 minutes
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000;
    }
  };
  
  accessTokenExpiry.setTime(accessTokenExpiry.getTime() + parseExpiry(config.jwtExpire));
  refreshTokenExpiry.setTime(refreshTokenExpiry.getTime() + parseExpiry(config.jwtRefreshExpire));
  
  return { accessTokenExpiry, refreshTokenExpiry };
};

/**
 * Set authentication cookies
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  const { accessTokenExpiry, refreshTokenExpiry } = getTokenExpirationTimes();
  
  // Set access token cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    expires: accessTokenExpiry
  });
  
  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    expires: refreshTokenExpiry
  });
};

/**
 * Clear authentication cookies
 */
const clearAuthCookies = (res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'User already exists with this email', 400);
  }

  try {
    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    const { refreshTokenExpiry } = getTokenExpirationTimes();
    
    console.log('🔑 Generated tokens for new user:', user.email);
    console.log('🔑 Access token length:', accessToken.length);
    console.log('🔑 Refresh token length:', refreshToken.length);

    // Create session
    const session = new Session({
      userId: user._id,
      token: accessToken,
      refreshToken,
      expiresAt: refreshTokenExpiry,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    console.log('💾 Creating session for new user:', user._id);
    await session.save();
    console.log('✅ Session created successfully:', session._id);

    // Update user's last login
    await user.updateLastLogin();

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);
    console.log('🍪 Cookies set successfully');

    // Return user data (password excluded by model transform)
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    console.log('📤 Sending response with tokens');
    sendSuccess(res, {
      user: userData,
      accessToken,
      refreshToken,
      expiresIn: config.jwtExpire
    }, 'User registered successfully', 201);

  } catch (error) {
    logger.error('Registration error:', error.message);
    sendError(res, 'Registration failed', 500);
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  const { email, password } = req.body;

  try {
    // Find user with password
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    const { refreshTokenExpiry } = getTokenExpirationTimes();
    
    console.log('🔑 Generated tokens for user:', user.email);
    console.log('🔑 Access token length:', accessToken.length);
    console.log('🔑 Refresh token length:', refreshToken.length);

    // Create session
    const session = new Session({
      userId: user._id,
      token: accessToken,
      refreshToken,
      expiresAt: refreshTokenExpiry,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    console.log('💾 Creating session for user:', user._id);
    await session.save();
    console.log('✅ Session created successfully:', session._id);

    // Update user's last login
    await user.updateLastLogin();

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);
    console.log('🍪 Cookies set successfully');

    // Return user data (password excluded by model transform)
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      lastLogin: user.lastLogin
    };

    console.log('📤 Sending response with tokens');
    sendSuccess(res, {
      user: userData,
      accessToken,
      refreshToken,
      expiresIn: config.jwtExpire
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error.message);
    sendError(res, 'Login failed', 500);
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  try {
    // Deactivate current session
    if (req.session) {
      await req.session.deactivate();
    }

    // Clear cookies
    clearAuthCookies(res);

    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    logger.error('Logout error:', error.message);
    sendError(res, 'Logout failed', 500);
  }
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req, res) => {
  try {
    // Deactivate all user sessions
    await Session.deactivateUserSessions(req.user._id);

    // Clear cookies
    clearAuthCookies(res);

    sendSuccess(res, null, 'Logged out from all devices');
  } catch (error) {
    logger.error('Logout all error:', error.message);
    sendError(res, 'Logout failed', 500);
  }
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Private (requires refresh token)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Refreshing tokens for user:', req.user.email);
    console.log('🔄 Current session:', req.session._id);
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(req.user._id);
    const { refreshTokenExpiry } = getTokenExpirationTimes();
    
    console.log('🔑 Generated new tokens');
    console.log('🔑 New access token length:', accessToken.length);
    console.log('🔑 New refresh token length:', newRefreshToken.length);

    // Update session with new tokens
    req.session.token = accessToken;
    req.session.refreshToken = newRefreshToken;
    req.session.expiresAt = refreshTokenExpiry;
    await req.session.save();
    console.log('✅ Session updated with new tokens');

    // Set new cookies
    setAuthCookies(res, accessToken, newRefreshToken);
    console.log('🍪 New cookies set');

    console.log('📤 Sending response with new tokens');
    sendSuccess(res, {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: config.jwtExpire
    }, 'Token refreshed successfully');

  } catch (error) {
    logger.error('Token refresh error:', error.message);
    sendError(res, 'Token refresh failed', 500);
  }
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const userData = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    avatar: req.user.avatar,
    lastLogin: req.user.lastLogin,
    createdAt: req.user.createdAt
  };

  sendSuccess(res, { user: userData }, 'User data retrieved successfully');
});

/**
 * @desc    Get user sessions
 * @route   GET /api/auth/sessions
 * @access  Private
 */
export const getSessions = asyncHandler(async (req, res) => {
  try {
    const sessions = await Session.findUserActiveSessions(req.user._id);
    
    const sessionData = sessions.map(session => ({
      id: session._id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      isCurrent: session._id.toString() === req.session._id.toString()
    }));

    sendSuccess(res, { sessions: sessionData }, 'Sessions retrieved successfully');
  } catch (error) {
    logger.error('Get sessions error:', error.message);
    sendError(res, 'Failed to retrieve sessions', 500);
  }
});