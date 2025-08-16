import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/env.js';

// Mock the database connection to prevent actual DB connections
jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the models
const mockUser = {
  _id: 'testUserId123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedPassword123',
  isActive: true,
  save: jest.fn(),
  updateLastLogin: jest.fn(),
  comparePassword: jest.fn()
};

const mockSession = {
  _id: 'testSessionId123',
  userId: mockUser._id,
  token: 'testAccessToken',
  refreshToken: 'testRefreshToken',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isActive: true,
  save: jest.fn(),
  deactivate: jest.fn()
};

jest.mock('../models/User.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockUser),
  findOne: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../models/Session.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockSession),
  findActiveByToken: jest.fn(),
  findActiveByRefreshToken: jest.fn(),
  deactivateUserSessions: jest.fn()
}));

// Import the app after mocking
let app;

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Import app after mocks are set up
    const appModule = await import('../../server.js');
    app = appModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return validation error for invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'weak',
          name: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should accept valid registration data format', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'TestPass123',
        name: 'Test User'
      };

      // This test just checks that the validation passes
      // The actual registration logic would need proper mocking
      const response = await request(app)
        .post('/api/auth/register')
        .send(validData);

      // We expect either success or a specific error (not validation error)
      expect(response.status).not.toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return validation error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should accept valid login data format', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'TestPass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(validData);

      // We expect either success or a specific error (not validation error)
      expect(response.status).not.toBe(400);
    });
  });

  describe('Authentication middleware', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token.');
    });
  });

  describe('Token generation and validation', () => {
    it('should generate valid JWT tokens', () => {
      const payload = { userId: 'testUserId123' };
      
      const accessToken = jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpire
      });
      
      const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
        expiresIn: config.jwtRefreshExpire
      });

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // Verify tokens can be decoded
      const decodedAccess = jwt.verify(accessToken, config.jwtSecret);
      const decodedRefresh = jwt.verify(refreshToken, config.jwtRefreshSecret);

      expect(decodedAccess.userId).toBe(payload.userId);
      expect(decodedRefresh.userId).toBe(payload.userId);
    });
  });

  describe('Password hashing', () => {
    it('should hash passwords correctly', async () => {
      const password = 'TestPassword123';
      const saltRounds = 12;
      
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);

      // Verify password comparison works
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });
});