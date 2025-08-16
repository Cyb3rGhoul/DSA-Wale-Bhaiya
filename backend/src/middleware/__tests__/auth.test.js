import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate, optionalAuth, authorize, verifyRefreshToken } from '../auth.js';
import User from '../../models/User.js';
import Session from '../../models/Session.js';
import config from '../../config/env.js';

// Mock dependencies
jest.mock('../../models/User.js');
jest.mock('../../models/Session.js');
jest.mock('../../utils/response.js', () => ({
  sendError: jest.fn((res, message, status) => {
    res.status(status).json({ success: false, message });
  })
}));

describe('Auth Middleware', () => {
  let req, res, next;
  let testUser, testSession;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    testUser = {
      _id: 'testUserId123',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true
    };

    testSession = {
      _id: 'testSessionId123',
      userId: testUser._id,
      token: 'testAccessToken',
      refreshToken: 'testRefreshToken',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      deactivate: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    it('should authenticate user with valid Bearer token', async () => {
      const token = jwt.sign({ userId: testUser._id }, config.jwtSecret);
      req.headers.authorization = `Bearer ${token}`;

      Session.findActiveByToken = jest.fn().mockResolvedValue(testSession);
      User.findById = jest.fn().mockResolvedValue(testUser);

      await authenticate(req, res, next);

      expect(Session.findActiveByToken).toHaveBeenCalledWith(token);
      expect(User.findById).toHaveBeenCalledWith(testUser._id);
      expect(req.user).toEqual(testUser);
      expect(req.session).toEqual(testSession);
      expect(req.token).toBe(token);
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate user with valid cookie token', async () => {
      const token = jwt.sign({ userId: testUser._id }, config.jwtSecret);
      req.cookies.token = token;

      Session.findActiveByToken = jest.fn().mockResolvedValue(testSession);
      User.findById = jest.fn().mockResolvedValue(testUser);

      await authenticate(req, res, next);

      expect(Session.findActiveByToken).toHaveBeenCalledWith(token);
      expect(User.findById).toHaveBeenCalledWith(testUser._id);
      expect(req.user).toEqual(testUser);
      expect(req.session).toEqual(testSession);
      expect(req.token).toBe(token);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if session not found', async () => {
      const token = jwt.sign({ userId: testUser._id }, config.jwtSecret);
      req.headers.authorization = `Bearer ${token}`;

      Session.findActiveByToken = jest.fn().mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired session.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is inactive', async () => {
      const token = jwt.sign({ userId: testUser._id }, config.jwtSecret);
      req.headers.authorization = `Bearer ${token}`;

      const inactiveUser = { ...testUser, isActive: false };
      Session.findActiveByToken = jest.fn().mockResolvedValue(testSession);
      User.findById = jest.fn().mockResolvedValue(inactiveUser);

      await authenticate(req, res, next);

      expect(testSession.deactivate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User account is inactive.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        config.jwtSecret,
        { expiresIn: '-1h' }
      );
      req.headers.authorization = `Bearer ${expiredToken}`;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth middleware', () => {
    it('should attach user if valid token provided', async () => {
      const token = jwt.sign({ userId: testUser._id }, config.jwtSecret);
      req.headers.authorization = `Bearer ${token}`;

      Session.findActiveByToken = jest.fn().mockResolvedValue(testSession);
      User.findById = jest.fn().mockResolvedValue(testUser);

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(testUser);
      expect(req.session).toEqual(testSession);
      expect(req.token).toBe(token);
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if no token provided', async () => {
      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(req.session).toBeUndefined();
      expect(req.token).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(req.session).toBeUndefined();
      expect(req.token).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should allow access for authenticated user', () => {
      req.user = testUser;

      const middleware = authorize();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access if user not authenticated', () => {
      const middleware = authorize();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Authentication required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should check roles if provided (future feature)', () => {
      req.user = { ...testUser, role: 'user' };

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyRefreshToken middleware', () => {
    it('should verify refresh token from body', async () => {
      const refreshToken = jwt.sign({ userId: testUser._id }, config.jwtRefreshSecret);
      req.body.refreshToken = refreshToken;

      Session.findActiveByRefreshToken = jest.fn().mockResolvedValue(testSession);
      User.findById = jest.fn().mockResolvedValue(testUser);

      await verifyRefreshToken(req, res, next);

      expect(Session.findActiveByRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(User.findById).toHaveBeenCalledWith(testUser._id);
      expect(req.user).toEqual(testUser);
      expect(req.session).toEqual(testSession);
      expect(req.refreshToken).toBe(refreshToken);
      expect(next).toHaveBeenCalled();
    });

    it('should verify refresh token from cookies', async () => {
      const refreshToken = jwt.sign({ userId: testUser._id }, config.jwtRefreshSecret);
      req.cookies.refreshToken = refreshToken;

      Session.findActiveByRefreshToken = jest.fn().mockResolvedValue(testSession);
      User.findById = jest.fn().mockResolvedValue(testUser);

      await verifyRefreshToken(req, res, next);

      expect(Session.findActiveByRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(req.user).toEqual(testUser);
      expect(req.session).toEqual(testSession);
      expect(req.refreshToken).toBe(refreshToken);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no refresh token provided', async () => {
      await verifyRefreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token is required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if refresh token is invalid', async () => {
      req.body.refreshToken = 'invalidrefreshtoken';

      await verifyRefreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if refresh session not found', async () => {
      const refreshToken = jwt.sign({ userId: testUser._id }, config.jwtRefreshSecret);
      req.body.refreshToken = refreshToken;

      Session.findActiveByRefreshToken = jest.fn().mockResolvedValue(null);

      await verifyRefreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is inactive', async () => {
      const refreshToken = jwt.sign({ userId: testUser._id }, config.jwtRefreshSecret);
      req.body.refreshToken = refreshToken;

      const inactiveUser = { ...testUser, isActive: false };
      Session.findActiveByRefreshToken = jest.fn().mockResolvedValue(testSession);
      User.findById = jest.fn().mockResolvedValue(inactiveUser);

      await verifyRefreshToken(req, res, next);

      expect(testSession.deactivate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User account is inactive.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});