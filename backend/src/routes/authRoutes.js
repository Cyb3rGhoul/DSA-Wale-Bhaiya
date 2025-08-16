import express from 'express';
import {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  getSessions,
  updateProfile,
  getProfileForChat
} from '../controllers/authController.js';
import {
  authenticate,
  verifyRefreshToken
} from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post('/register', validateRegister, register);

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @desc    Logout user (current session)
 * @route   POST /api/auth/logout
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @desc    Logout user from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
router.post('/logout-all', authenticate, logoutAll);

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Private (requires refresh token)
 */
router.post('/refresh', verifyRefreshToken, refreshToken);

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @desc    Get user sessions
 * @route   GET /api/auth/sessions
 * @access  Private
 */
router.get('/sessions', authenticate, getSessions);

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

/**
 * @desc    Get user profile with API key (for chat functionality)
 * @route   GET /api/auth/profile/chat
 * @access  Private
 */
router.get('/profile/chat', authenticate, getProfileForChat);

export default router;