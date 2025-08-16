import mongoose from 'mongoose';
import Session from '../Session.js';
import User from '../User.js';

describe('Session Model', () => {
  const TEST_DB_URI = 'mongodb+srv://sayantika:sayantika@cluster0.ifwhram.mongodb.net/dsa-brother-bot-test';
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Session.deleteMany({});
    await User.deleteMany({});
    
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
  });

  describe('Session Creation', () => {
    it('should create a session with valid data', async () => {
      const sessionData = {
        userId: testUser._id,
        token: 'test-jwt-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };

      const session = new Session(sessionData);
      const savedSession = await session.save();

      expect(savedSession._id).toBeDefined();
      expect(savedSession.userId.toString()).toBe(testUser._id.toString());
      expect(savedSession.token).toBe(sessionData.token);
      expect(savedSession.refreshToken).toBe(sessionData.refreshToken);
      expect(savedSession.isActive).toBe(true);
      expect(savedSession.userAgent).toBe(sessionData.userAgent);
      expect(savedSession.ipAddress).toBe(sessionData.ipAddress);
      expect(savedSession.createdAt).toBeDefined();
      expect(savedSession.updatedAt).toBeDefined();
    });

    it('should require userId, token, refreshToken, and expiresAt', async () => {
      const session = new Session({});
      
      await expect(session.save()).rejects.toThrow();
      
      const error = session.validateSync();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.token).toBeDefined();
      expect(error.errors.refreshToken).toBeDefined();
      expect(error.errors.expiresAt).toBeDefined();
    });

    it('should enforce unique token constraint', async () => {
      const sessionData = {
        userId: testUser._id,
        token: 'duplicate-token',
        refreshToken: 'refresh-token-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await new Session(sessionData).save();
      
      const duplicateSession = new Session({
        ...sessionData,
        refreshToken: 'refresh-token-2'
      });
      
      await expect(duplicateSession.save()).rejects.toThrow();
    });

    it('should enforce unique refresh token constraint', async () => {
      const sessionData = {
        userId: testUser._id,
        token: 'token-1',
        refreshToken: 'duplicate-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      await new Session(sessionData).save();
      
      const duplicateSession = new Session({
        ...sessionData,
        token: 'token-2'
      });
      
      await expect(duplicateSession.save()).rejects.toThrow();
    });

    it('should set default expiration if not provided', async () => {
      const session = new Session({
        userId: testUser._id,
        token: 'test-token',
        refreshToken: 'test-refresh-token'
      });

      const savedSession = await session.save();
      expect(savedSession.expiresAt).toBeInstanceOf(Date);
      expect(savedSession.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Instance Methods', () => {
    let session;

    beforeEach(async () => {
      session = new Session({
        userId: testUser._id,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await session.save();
    });

    it('should deactivate session', async () => {
      expect(session.isActive).toBe(true);
      
      await session.deactivate();
      
      expect(session.isActive).toBe(false);
    });

    it('should check if session is expired', async () => {
      expect(session.isExpired()).toBe(false);
      
      session.expiresAt = new Date(Date.now() - 1000); // 1 second ago
      expect(session.isExpired()).toBe(true);
    });

    it('should extend session expiration', async () => {
      const originalExpiration = session.expiresAt.getTime();
      const extensionTime = 24 * 60 * 60 * 1000; // 1 day
      
      await session.extendExpiration(extensionTime);
      
      expect(session.expiresAt.getTime()).toBeGreaterThan(originalExpiration);
      expect(session.expiresAt.getTime()).toBeCloseTo(Date.now() + extensionTime, -3);
    });
  });

  describe('Static Methods', () => {
    let user2;
    let activeSession;
    let expiredSession;
    let inactiveSession;

    beforeEach(async () => {
      user2 = await User.create({
        email: 'user2@example.com',
        password: 'password123',
        name: 'User 2'
      });

      activeSession = await Session.create({
        userId: testUser._id,
        token: 'active-token',
        refreshToken: 'active-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      expiredSession = await Session.create({
        userId: testUser._id,
        token: 'expired-token',
        refreshToken: 'expired-refresh-token',
        expiresAt: new Date(Date.now() - 1000),
        isActive: true
      });

      inactiveSession = await Session.create({
        userId: testUser._id,
        token: 'inactive-token',
        refreshToken: 'inactive-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false
      });
    });

    it('should find active session by token', async () => {
      const foundSession = await Session.findActiveByToken('active-token');
      
      expect(foundSession).toBeDefined();
      expect(foundSession._id.toString()).toBe(activeSession._id.toString());
      expect(foundSession.userId).toBeDefined();
      expect(foundSession.userId.name).toBe(testUser.name);
    });

    it('should not find expired session by token', async () => {
      const foundSession = await Session.findActiveByToken('expired-token');
      expect(foundSession).toBeNull();
    });

    it('should not find inactive session by token', async () => {
      const foundSession = await Session.findActiveByToken('inactive-token');
      expect(foundSession).toBeNull();
    });

    it('should find active session by refresh token', async () => {
      const foundSession = await Session.findActiveByRefreshToken('active-refresh-token');
      
      expect(foundSession).toBeDefined();
      expect(foundSession._id.toString()).toBe(activeSession._id.toString());
    });

    it('should find user active sessions', async () => {
      const userSessions = await Session.findUserActiveSessions(testUser._id);
      
      expect(userSessions).toHaveLength(1);
      expect(userSessions[0]._id.toString()).toBe(activeSession._id.toString());
    });

    it('should deactivate all user sessions', async () => {
      const result = await Session.deactivateUserSessions(testUser._id);
      
      expect(result.modifiedCount).toBeGreaterThan(0);
      
      const activeSessions = await Session.findUserActiveSessions(testUser._id);
      expect(activeSessions).toHaveLength(0);
    });

    it('should cleanup expired sessions', async () => {
      const result = await Session.cleanupExpiredSessions();
      
      expect(result.deletedCount).toBeGreaterThan(0);
      
      const remainingSessions = await Session.find({});
      expect(remainingSessions.some(s => s.token === 'expired-token')).toBe(false);
    });

    it('should get session statistics', async () => {
      const stats = await Session.getSessionStats();
      
      expect(stats.totalSessions).toBeGreaterThan(0);
      expect(stats.activeSessions).toBeDefined();
      expect(stats.expiredSessions).toBeDefined();
      expect(typeof stats.totalSessions).toBe('number');
      expect(typeof stats.activeSessions).toBe('number');
      expect(typeof stats.expiredSessions).toBe('number');
    });
  });

  describe('JSON Transformation', () => {
    it('should exclude sensitive fields from JSON output', async () => {
      const session = new Session({
        userId: testUser._id,
        token: 'secret-token',
        refreshToken: 'secret-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const savedSession = await session.save();
      const sessionJSON = savedSession.toJSON();

      expect(sessionJSON.token).toBeUndefined();
      expect(sessionJSON.refreshToken).toBeUndefined();
      expect(sessionJSON.__v).toBeUndefined();
      expect(sessionJSON.userId).toBeDefined();
      expect(sessionJSON.isActive).toBeDefined();
      expect(sessionJSON.expiresAt).toBeDefined();
    });
  });

  describe('TTL Index', () => {
    it('should have TTL index on expiresAt field', async () => {
      const indexes = await Session.collection.getIndexes();
      const ttlIndex = Object.values(indexes).find(index => 
        index.expireAfterSeconds === 0
      );
      
      expect(ttlIndex).toBeDefined();
    });
  });
});