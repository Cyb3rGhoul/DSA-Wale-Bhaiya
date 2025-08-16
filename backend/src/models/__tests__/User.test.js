import mongoose from 'mongoose';
import User from '../User.js';

describe('User Model', () => {
  const TEST_DB_URI = 'mongodb+srv://sayantika:sayantika@cluster0.ifwhram.mongodb.net/dsa-brother-bot-test';

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
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
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require email, password, and name', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
      
      const error = user.validateSync();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it('should validate email format', async () => {
      const user = new User({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      await new User(userData).save();
      
      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      const user = new User({
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should trim and lowercase email', async () => {
      const user = new User({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
        name: 'Test User'
      });

      const savedUser = await user.save();
      expect(savedUser.email).toBe('test@example.com');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = new User({
        email: 'test@example.com',
        password: plainPassword,
        name: 'Test User'
      });

      const savedUser = await user.save();
      expect(savedUser.password).not.toBe(plainPassword);
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      const savedUser = await user.save();
      const originalHash = savedUser.password;

      savedUser.name = 'Updated Name';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).toBe(originalHash);
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await user.save();
    });

    it('should compare password correctly', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should update last login', async () => {
      expect(user.lastLogin).toBeNull();
      
      await user.updateLastLogin();
      
      expect(user.lastLogin).toBeInstanceOf(Date);
      expect(user.lastLogin.getTime()).toBeCloseTo(Date.now(), -3); // Within 1 second
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      await User.create([
        {
          email: 'active@example.com',
          password: 'password123',
          name: 'Active User',
          isActive: true
        },
        {
          email: 'inactive@example.com',
          password: 'password123',
          name: 'Inactive User',
          isActive: false
        }
      ]);
    });

    it('should find user by email with password', async () => {
      const user = await User.findByEmailWithPassword('active@example.com');
      
      expect(user).toBeDefined();
      expect(user.email).toBe('active@example.com');
      expect(user.password).toBeDefined(); // Password should be included
    });

    it('should find only active users', async () => {
      const activeUsers = await User.findActiveUsers();
      
      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].email).toBe('active@example.com');
      expect(activeUsers[0].isActive).toBe(true);
    });
  });

  describe('JSON Transformation', () => {
    it('should exclude password and __v from JSON output', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      const savedUser = await user.save();
      const userJSON = savedUser.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.__v).toBeUndefined();
      expect(userJSON.email).toBeDefined();
      expect(userJSON.name).toBeDefined();
    });
  });
});