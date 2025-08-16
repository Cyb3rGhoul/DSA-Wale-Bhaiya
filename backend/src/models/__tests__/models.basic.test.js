import mongoose from 'mongoose';
import User from '../User.js';
import Chat from '../Chat.js';
import Session from '../Session.js';

describe('Basic Model Tests', () => {
  const TEST_DB_URI = 'mongodb+srv://sayantika:sayantika@cluster0.ifwhram.mongodb.net/dsa-brother-bot-test';

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Session.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Session.deleteMany({});
  });

  describe('User Model', () => {
    it('should create and save a user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.isActive).toBe(true);
    });

    it('should hash password correctly', async () => {
      const user = new User({
        email: 'test2@example.com',
        password: 'password123',
        name: 'Test User 2'
      });

      const savedUser = await user.save();
      const isMatch = await savedUser.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await savedUser.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Chat Model', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'chatuser@example.com',
        password: 'password123',
        name: 'Chat User'
      });
    });

    it('should create and save a chat', async () => {
      const chatData = {
        userId: testUser._id,
        title: 'Test Chat',
        messages: [
          {
            id: '1',
            text: 'Hello, world!',
            isUser: true,
            timestamp: new Date()
          }
        ]
      };

      const chat = new Chat(chatData);
      const savedChat = await chat.save();

      expect(savedChat._id).toBeDefined();
      expect(savedChat.userId.toString()).toBe(testUser._id.toString());
      expect(savedChat.title).toBe(chatData.title);
      expect(savedChat.messages).toHaveLength(1);
      expect(savedChat.isArchived).toBe(false);
    });

    it('should add messages to chat', async () => {
      const chat = new Chat({
        userId: testUser._id,
        title: 'Test Chat'
      });
      await chat.save();

      await chat.addMessage({
        id: '1',
        text: 'Hello, world!',
        isUser: true
      });

      expect(chat.messages).toHaveLength(1);
      expect(chat.messages[0].text).toBe('Hello, world!');
    });
  });

  describe('Session Model', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'sessionuser@example.com',
        password: 'password123',
        name: 'Session User'
      });
    });

    it('should create and save a session', async () => {
      const sessionData = {
        userId: testUser._id,
        token: 'test-jwt-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const session = new Session(sessionData);
      const savedSession = await session.save();

      expect(savedSession._id).toBeDefined();
      expect(savedSession.userId.toString()).toBe(testUser._id.toString());
      expect(savedSession.token).toBe(sessionData.token);
      expect(savedSession.refreshToken).toBe(sessionData.refreshToken);
      expect(savedSession.isActive).toBe(true);
    });

    it('should check if session is expired', async () => {
      const session = new Session({
        userId: testUser._id,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(Date.now() + 1000) // 1 second from now
      });

      await session.save();
      expect(session.isExpired()).toBe(false);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(session.isExpired()).toBe(true);
    });
  });
});