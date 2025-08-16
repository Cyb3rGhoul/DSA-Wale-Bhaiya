import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../server.js';
import User from '../../models/User.js';
import Session from '../../models/Session.js';
import config from '../../config/env.js';

// Mock the database connection
jest.mock('../../config/database.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Auth Controller', () => {
  let testUser;
  let testSession;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create test user
    testUser = {
      _id: 'testUserId123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword123',
      isActive: true,
      save: jest.fn(),
      updateLastLogin: jest.fn(),
      comparePassword: jest.fn()
    };

    // Create test session
    testSession = {
      _id: 'testSessionId123',
      userId: testUser._id,
      token: 'testAccessToken',
      refreshToken: 'testRefreshToken',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      save: jest.fn(),
      deactivate: jest.fn()
    };
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock User constructor and save
      const mockUser = {
        ...testUser,
        save: jest.fn().mockResolvedValue(testUser),
        updateLastLogin: jest.fn().mockResolvedValue(testUser)
      };
      User.mockImplementation(() => mockUser);
      
      // Mock Session constructor and save
      const mockSession = {
        ...testSession,
        save: jest.fn().mockResolvedValue(testSession)
      };
      Session.mockImplementation(() => mockSession);

      const userData = {
        email: 'test@example.com',
        password: 'TestPass123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.accessToken).toBeDefined();
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
    });

    it('should return error if user already exists', async () => {
      // Mock User.findOne to return existing user
      User.findOne = jest.fn().mockResolvedValue(testUser);

      const userData = {
        email: 'test@example.com',
        password: 'TestPass123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email');
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPass123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return validation error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      // Mock User.findByEmailWithPassword
      const mockUser = {
        ...testUser,
        comparePassword: jest.fn().mockResolvedValue(true),
        updateLastLogin: jest.fn().mockResolvedValue(testUser)
      };
      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);
      
      // Mock Session constructor and save
      const mockSession = {
        ...testSession,
        save: jest.fn().mockResolvedValue(testSession)
      };
      Session.mockImplementation(() => mockSession);

      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
    });

    it('should return error for invalid email', async () => {
      // Mock User.findByEmailWithPassword to return null
      User.findByEmailWithPassword = jest.fn().mockResolvedValue(null);

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return error for invalid password', async () => {
      // Mock User.findByEmailWithPassword
      const mockUser = {
        ...testUser,
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);

      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
    });

    it('should return error for inactive user', async () => {
      // Mock User.findByEmailWithPassword with inactive user
      const mockUser = {
        ...testUser,
        isActive: false
      };
      User.findByEmailWithPassword = jest.fn().mockResolvedValue(mockUser);

      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      // Mock authentication middleware
      const mockUser = { ...testUser };
      const mockSession = {
        ...testSession,
        deactivate: jest.fn().mockResolvedValue(testSession)
      };

      // Create a valid JWT token
      const token = jwt.sign({ userId: testUser._id }, config.jwtSecret);
      
      // Mock Session.findActiveByToken
      Session.findActiveByToken = jest.fn().mockResolvedValue(mockSession);
      
      // Mock User.findById
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should return error if no token provided', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // Mock refresh token verification
      const mockUser = { ...testUser };
      const mockSession = {
        ...testSession,
        save: jest.fn().mockResolvedValue(testSession)
      };

      // Create a valid refresh token
      const refreshToken = jwt.sign({ userId: testUser._id }, config.jwtRefreshSecret);
      
      // Mock Session.findActiveByRefreshToken
      Session.findActiveByRefreshToken = jest.fn().mockResolvedValue(mockSession);
      
      // Mock User.findById
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return error if no refresh token provided', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Refresh token is required.');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user data', async () => {
      // Mock authentication middleware
      const mockUser = { ...testUser };
      const mockSession = { ...testSession };

      // Create a valid JWT token
      const token = jwt.sign({ userId: testUser._id }, config.jwtSecret);
      
      // Mock Session.findActiveByToken
      Session.findActiveByToken = jest.fn().mockResolvedValue(mockSession);
      
      // Mock User.findById
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User data retrieved successfully');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
    });

    it('should return error if not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });
});