import mongoose from 'mongoose';
import Chat from '../Chat.js';
import User from '../User.js';

describe('Chat Model', () => {
  const TEST_DB_URI = 'mongodb+srv://sayantika:sayantika@cluster0.ifwhram.mongodb.net/dsa-brother-bot-test';
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Chat.deleteMany({});
    await User.deleteMany({});
    
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
  });

  describe('Chat Creation', () => {
    it('should create a chat with valid data', async () => {
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
      expect(savedChat.createdAt).toBeDefined();
      expect(savedChat.updatedAt).toBeDefined();
    });

    it('should require userId and title', async () => {
      const chat = new Chat({});
      
      await expect(chat.save()).rejects.toThrow();
      
      const error = chat.validateSync();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    it('should set default title to "New Chat"', async () => {
      const chat = new Chat({
        userId: testUser._id
      });

      const savedChat = await chat.save();
      expect(savedChat.title).toBe('New Chat');
    });

    it('should validate message text length', async () => {
      const longText = 'a'.repeat(5001);
      const chat = new Chat({
        userId: testUser._id,
        title: 'Test Chat',
        messages: [
          {
            id: '1',
            text: longText,
            isUser: true
          }
        ]
      });

      await expect(chat.save()).rejects.toThrow();
    });

    it('should limit messages per chat to 1000', async () => {
      const messages = Array.from({ length: 1001 }, (_, i) => ({
        id: i.toString(),
        text: `Message ${i}`,
        isUser: true
      }));

      const chat = new Chat({
        userId: testUser._id,
        title: 'Test Chat',
        messages
      });

      await expect(chat.save()).rejects.toThrow();
    });
  });

  describe('Message Schema', () => {
    it('should create messages with required fields', async () => {
      const chat = new Chat({
        userId: testUser._id,
        title: 'Test Chat',
        messages: [
          {
            id: '1',
            text: 'Hello',
            isUser: true
          }
        ]
      });

      const savedChat = await chat.save();
      const message = savedChat.messages[0];

      expect(message.id).toBe('1');
      expect(message.text).toBe('Hello');
      expect(message.isUser).toBe(true);
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should require message id and text', async () => {
      const chat = new Chat({
        userId: testUser._id,
        title: 'Test Chat',
        messages: [
          {
            isUser: true
          }
        ]
      });

      await expect(chat.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let chat;

    beforeEach(async () => {
      chat = new Chat({
        userId: testUser._id,
        title: 'Test Chat'
      });
      await chat.save();
    });

    it('should add a message', async () => {
      const messageData = {
        id: '1',
        text: 'Hello, world!',
        isUser: true
      };

      await chat.addMessage(messageData);

      expect(chat.messages).toHaveLength(1);
      expect(chat.messages[0].text).toBe(messageData.text);
      expect(chat.messages[0].isUser).toBe(messageData.isUser);
    });

    it('should generate message id if not provided', async () => {
      const messageData = {
        text: 'Hello, world!',
        isUser: true
      };

      await chat.addMessage(messageData);

      expect(chat.messages[0].id).toBeDefined();
      expect(typeof chat.messages[0].id).toBe('string');
    });

    it('should get message count', async () => {
      expect(chat.getMessageCount()).toBe(0);

      await chat.addMessage({
        id: '1',
        text: 'Message 1',
        isUser: true
      });

      expect(chat.getMessageCount()).toBe(1);
    });

    it('should get last message', async () => {
      expect(chat.getLastMessage()).toBeNull();

      await chat.addMessage({
        id: '1',
        text: 'First message',
        isUser: true
      });

      await chat.addMessage({
        id: '2',
        text: 'Last message',
        isUser: false
      });

      const lastMessage = chat.getLastMessage();
      expect(lastMessage.text).toBe('Last message');
      expect(lastMessage.isUser).toBe(false);
    });

    it('should archive and unarchive chat', async () => {
      expect(chat.isArchived).toBe(false);

      await chat.archive();
      expect(chat.isArchived).toBe(true);

      await chat.unarchive();
      expect(chat.isArchived).toBe(false);
    });
  });

  describe('Static Methods', () => {
    let user2;

    beforeEach(async () => {
      user2 = await User.create({
        email: 'user2@example.com',
        password: 'password123',
        name: 'User 2'
      });

      await Chat.create([
        {
          userId: testUser._id,
          title: 'Active Chat 1',
          isArchived: false
        },
        {
          userId: testUser._id,
          title: 'Active Chat 2',
          isArchived: false
        },
        {
          userId: testUser._id,
          title: 'Archived Chat',
          isArchived: true
        },
        {
          userId: user2._id,
          title: 'Other User Chat',
          isArchived: false
        }
      ]);
    });

    it('should find user active chats', async () => {
      const activeChats = await Chat.findUserActiveChats(testUser._id);

      expect(activeChats).toHaveLength(2);
      expect(activeChats.every(chat => !chat.isArchived)).toBe(true);
      expect(activeChats.every(chat => chat.userId._id.toString() === testUser._id.toString())).toBe(true);
    });

    it('should find user archived chats', async () => {
      const archivedChats = await Chat.findUserArchivedChats(testUser._id);

      expect(archivedChats).toHaveLength(1);
      expect(archivedChats[0].isArchived).toBe(true);
      expect(archivedChats[0].title).toBe('Archived Chat');
    });

    it('should find all user chats', async () => {
      const userChats = await Chat.findUserChats(testUser._id);

      expect(userChats).toHaveLength(3);
      expect(userChats.every(chat => chat.userId._id.toString() === testUser._id.toString())).toBe(true);
    });

    it('should limit user chats query', async () => {
      const userChats = await Chat.findUserChats(testUser._id, 2);

      expect(userChats).toHaveLength(2);
    });
  });

  describe('Pre-save Middleware', () => {
    it('should auto-generate title from first user message', async () => {
      const chat = new Chat({
        userId: testUser._id,
        messages: [
          {
            id: '1',
            text: 'This is a long message that should be truncated for the title',
            isUser: true
          }
        ]
      });

      const savedChat = await chat.save();
      expect(savedChat.title).toBe('This is a long message that should be truncated...');
    });

    it('should not change custom title', async () => {
      const customTitle = 'My Custom Title';
      const chat = new Chat({
        userId: testUser._id,
        title: customTitle,
        messages: [
          {
            id: '1',
            text: 'This message should not affect the title',
            isUser: true
          }
        ]
      });

      const savedChat = await chat.save();
      expect(savedChat.title).toBe(customTitle);
    });

    it('should not generate title from bot messages', async () => {
      const chat = new Chat({
        userId: testUser._id,
        messages: [
          {
            id: '1',
            text: 'This is a bot message',
            isUser: false
          }
        ]
      });

      const savedChat = await chat.save();
      expect(savedChat.title).toBe('New Chat');
    });
  });

  describe('JSON Transformation', () => {
    it('should exclude __v from JSON output', async () => {
      const chat = new Chat({
        userId: testUser._id,
        title: 'Test Chat'
      });

      const savedChat = await chat.save();
      const chatJSON = savedChat.toJSON();

      expect(chatJSON.__v).toBeUndefined();
      expect(chatJSON.title).toBeDefined();
      expect(chatJSON.userId).toBeDefined();
    });
  });
});