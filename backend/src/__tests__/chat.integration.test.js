import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

// Mock the database connection to prevent actual DB connections
jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(null)
}));

// Mock mongoose to prevent actual database operations
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({
    connection: { host: 'mocked-host' }
  }),
  connection: {
    on: jest.fn(),
    close: jest.fn()
  },
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn(),
    post: jest.fn(),
    methods: {},
    statics: {},
    index: jest.fn()
  })),
  model: jest.fn().mockReturnValue({}),
  Types: {
    ObjectId: jest.fn().mockImplementation(() => ({
      toString: () => 'mockObjectId'
    }))
  }
}));

// Mock process.exit to prevent actual process termination
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

// Mock user and session for authentication
const mockUser = {
  _id: 'testUserId123',
  email: 'test@example.com',
  name: 'Test User',
  isActive: true
};

const mockSession = {
  _id: 'testSessionId123',
  userId: mockUser._id,
  token: 'testAccessToken',
  refreshToken: 'testRefreshToken',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isActive: true
};

// Mock chat data
const mockChat = {
  _id: 'testChatId123',
  userId: mockUser._id,
  title: 'Test Chat',
  messages: [
    {
      id: '1',
      text: 'Hello, this is a test message',
      isUser: true,
      timestamp: new Date()
    },
    {
      id: '2',
      text: 'This is a bot response',
      isUser: false,
      timestamp: new Date()
    }
  ],
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn(),
  addMessage: jest.fn(),
  archive: jest.fn(),
  unarchive: jest.fn(),
  getMessageCount: jest.fn(() => 2),
  getLastMessage: jest.fn(() => mockChat.messages[1])
};

// Create mock functions
const mockUserFindById = jest.fn();
const mockSessionFindActiveByToken = jest.fn();
const mockChatFindUserChats = jest.fn();
const mockChatFindUserActiveChats = jest.fn();
const mockChatFindUserArchivedChats = jest.fn();
const mockChatFindOne = jest.fn();
const mockChatFindById = jest.fn();
const mockChatFindByIdAndDelete = jest.fn();

// Mock the models
jest.mock('../models/User.js', () => ({
  __esModule: true,
  default: {
    findById: mockUserFindById
  }
}));

jest.mock('../models/Session.js', () => ({
  __esModule: true,
  default: {
    findActiveByToken: mockSessionFindActiveByToken
  }
}));

jest.mock('../models/Chat.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockChat),
  findUserChats: mockChatFindUserChats,
  findUserActiveChats: mockChatFindUserActiveChats,
  findUserArchivedChats: mockChatFindUserArchivedChats,
  findOne: mockChatFindOne,
  findById: mockChatFindById,
  findByIdAndDelete: mockChatFindByIdAndDelete
}));

// Import the app after mocking
let app;

describe('Chat API Integration Tests', () => {
  beforeAll(async () => {
    // Import app after mocks are set up
    const appModule = await import('../../server.js');
    app = appModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks for authentication
    mockUserFindById.mockResolvedValue(mockUser);
    mockSessionFindActiveByToken.mockResolvedValue(mockSession);
  });

  // Helper function to create authenticated request
  const createAuthenticatedRequest = (method, url) => {
    const token = jwt.sign({ userId: mockUser._id }, config.jwtSecret);
    return request(app)[method](url).set('Authorization', `Bearer ${token}`);
  };

  describe('GET /api/chats', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/chats');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should return user chats when authenticated', async () => {
      const mockChats = [mockChat];
      mockChatFindUserActiveChats.mockResolvedValue(mockChats);

      const response = await createAuthenticatedRequest('get', '/api/chats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Chats retrieved successfully');
      expect(mockChatFindUserActiveChats).toHaveBeenCalledWith(mockUser._id);
    });

    it('should handle archived query parameter', async () => {
      const mockArchivedChats = [{ ...mockChat, isArchived: true }];
      mockChatFindUserArchivedChats.mockResolvedValue(mockArchivedChats);

      const response = await createAuthenticatedRequest('get', '/api/chats?archived=true');

      expect(response.status).toBe(200);
      expect(mockChatFindUserArchivedChats).toHaveBeenCalledWith(mockUser._id);
    });

    it('should handle limit query parameter', async () => {
      const mockChats = [mockChat];
      mockChatFindUserActiveChats.mockResolvedValue(mockChats);

      const response = await createAuthenticatedRequest('get', '/api/chats?limit=10');

      expect(response.status).toBe(200);
      expect(mockChatFindUserActiveChats).toHaveBeenCalledWith(mockUser._id);
    });
  });

  describe('GET /api/chats/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/chats/testChatId123');
      
      expect(response.status).toBe(401);
    });

    it('should return specific chat when authenticated and authorized', async () => {
      mockChatFindOne.mockResolvedValue({
        ...mockChat,
        populate: jest.fn().mockResolvedValue(mockChat)
      });

      const response = await createAuthenticatedRequest('get', '/api/chats/testChatId123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Chat retrieved successfully');
      expect(mockChatFindOne).toHaveBeenCalledWith({
        _id: 'testChatId123',
        userId: mockUser._id
      });
    });

    it('should return 404 for non-existent chat', async () => {
      mockChatFindOne.mockResolvedValue(null);

      const response = await createAuthenticatedRequest('get', '/api/chats/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Chat not found');
    });

    it('should return 400 for invalid chat ID', async () => {
      mockChatFindOne.mockRejectedValue({ name: 'CastError' });

      const response = await createAuthenticatedRequest('get', '/api/chats/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid chat ID');
    });
  });

  describe('POST /api/chats', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/chats')
        .send({ title: 'New Chat' });
      
      expect(response.status).toBe(401);
    });

    it('should create new chat with valid data', async () => {
      const newChatData = {
        title: 'New Test Chat',
        messages: [
          {
            text: 'First message',
            isUser: true
          }
        ]
      };

      mockChat.save.mockResolvedValue(mockChat);

      const response = await createAuthenticatedRequest('post', '/api/chats')
        .send(newChatData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Chat created successfully');
    });

    it('should validate chat data', async () => {
      const invalidData = {
        title: 'a'.repeat(101), // Too long
        messages: [
          {
            text: '', // Empty text
            isUser: true
          }
        ]
      };

      const response = await createAuthenticatedRequest('post', '/api/chats')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should create chat without messages', async () => {
      const newChatData = {
        title: 'Empty Chat'
      };

      mockChat.save.mockResolvedValue(mockChat);

      const response = await createAuthenticatedRequest('post', '/api/chats')
        .send(newChatData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/chats/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/chats/testChatId123')
        .send({ title: 'Updated Title' });
      
      expect(response.status).toBe(401);
    });

    it('should update chat with valid data', async () => {
      const updatedChat = { ...mockChat, title: 'Updated Title' };
      mockChatFindOne.mockResolvedValue(mockChat);
      mockChat.save.mockResolvedValue(updatedChat);

      const response = await createAuthenticatedRequest('put', '/api/chats/testChatId123')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Chat updated successfully');
      expect(mockChat.save).toHaveBeenCalled();
    });

    it('should return 404 for non-existent chat', async () => {
      mockChatFindOne.mockResolvedValue(null);

      const response = await createAuthenticatedRequest('put', '/api/chats/nonexistent')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Chat not found');
    });

    it('should validate update data', async () => {
      mockChatFindOne.mockResolvedValue(mockChat);

      const response = await createAuthenticatedRequest('put', '/api/chats/testChatId123')
        .send({ title: 'a'.repeat(101) }); // Too long

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('DELETE /api/chats/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app).delete('/api/chats/testChatId123');
      
      expect(response.status).toBe(401);
    });

    it('should delete chat when authorized', async () => {
      mockChatFindOne.mockResolvedValue(mockChat);
      mockChatFindByIdAndDelete.mockResolvedValue(mockChat);

      const response = await createAuthenticatedRequest('delete', '/api/chats/testChatId123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Chat deleted successfully');
      expect(mockChatFindByIdAndDelete).toHaveBeenCalledWith('testChatId123');
    });

    it('should return 404 for non-existent chat', async () => {
      mockChatFindOne.mockResolvedValue(null);

      const response = await createAuthenticatedRequest('delete', '/api/chats/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Chat not found');
    });
  });

  describe('POST /api/chats/:id/messages', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/chats/testChatId123/messages')
        .send({ text: 'New message', isUser: true });
      
      expect(response.status).toBe(401);
    });

    it('should add message to chat', async () => {
      mockChatFindOne.mockResolvedValue(mockChat);
      mockChat.addMessage.mockResolvedValue(mockChat);
      mockChatFindById.mockResolvedValue({
        ...mockChat,
        populate: jest.fn().mockResolvedValue(mockChat)
      });

      const messageData = {
        text: 'New test message',
        isUser: true
      };

      const response = await createAuthenticatedRequest('post', '/api/chats/testChatId123/messages')
        .send(messageData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Message added successfully');
      expect(mockChat.addMessage).toHaveBeenCalled();
    });

    it('should validate message data', async () => {
      const response = await createAuthenticatedRequest('post', '/api/chats/testChatId123/messages')
        .send({ text: '', isUser: true }); // Empty text

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 404 for non-existent chat', async () => {
      mockChatFindOne.mockResolvedValue(null);

      const response = await createAuthenticatedRequest('post', '/api/chats/nonexistent/messages')
        .send({ text: 'New message', isUser: true });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Chat not found');
    });
  });

  describe('POST /api/chats/:id/archive', () => {
    it('should require authentication', async () => {
      const response = await request(app).post('/api/chats/testChatId123/archive');
      
      expect(response.status).toBe(401);
    });

    it('should archive chat', async () => {
      mockChatFindOne.mockResolvedValue(mockChat);
      mockChat.archive.mockResolvedValue({ ...mockChat, isArchived: true });

      const response = await createAuthenticatedRequest('post', '/api/chats/testChatId123/archive');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Chat archived successfully');
      expect(mockChat.archive).toHaveBeenCalled();
    });

    it('should return 404 for non-existent chat', async () => {
      mockChatFindOne.mockResolvedValue(null);

      const response = await createAuthenticatedRequest('post', '/api/chats/nonexistent/archive');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Chat not found');
    });
  });

  describe('POST /api/chats/:id/unarchive', () => {
    it('should require authentication', async () => {
      const response = await request(app).post('/api/chats/testChatId123/unarchive');
      
      expect(response.status).toBe(401);
    });

    it('should unarchive chat', async () => {
      const archivedChat = { ...mockChat, isArchived: true };
      mockChatFindOne.mockResolvedValue(archivedChat);
      archivedChat.unarchive = jest.fn().mockResolvedValue({ ...archivedChat, isArchived: false });

      const response = await createAuthenticatedRequest('post', '/api/chats/testChatId123/unarchive');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Chat unarchived successfully');
      expect(archivedChat.unarchive).toHaveBeenCalled();
    });

    it('should return 404 for non-existent chat', async () => {
      mockChatFindOne.mockResolvedValue(null);

      const response = await createAuthenticatedRequest('post', '/api/chats/nonexistent/unarchive');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Chat not found');
    });
  });
});