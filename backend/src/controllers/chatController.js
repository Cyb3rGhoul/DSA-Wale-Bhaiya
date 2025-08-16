import { validationResult } from 'express-validator';
import Chat from '../models/Chat.js';
import { sendSuccess, sendError } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get all user chats
 * @route   GET /api/chats
 * @access  Private
 */
export const getChats = asyncHandler(async (req, res) => {
  try {
    const { archived = 'false', limit = 50 } = req.query;
    const isArchived = archived === 'true';
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 chats

    let chats;
    if (archived === 'all') {
      chats = await Chat.findUserChats(req.user._id, limitNum);
    } else if (isArchived) {
      chats = await Chat.findUserArchivedChats(req.user._id);
    } else {
      chats = await Chat.findUserActiveChats(req.user._id);
    }

    // Transform chats for response
    const chatData = chats.map(chat => ({
      _id: chat._id,
      title: chat.title,
      messageCount: chat.getMessageCount(),
      lastMessage: chat.getLastMessage(),
      isArchived: chat.isArchived,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    sendSuccess(res, { 
      chats: chatData,
      total: chatData.length 
    }, 'Chats retrieved successfully');

  } catch (error) {
    logger.error('Get chats error:', error.message);
    sendError(res, 'Failed to retrieve chats', 500);
  }
});

/**
 * @desc    Get specific chat by ID
 * @route   GET /api/chats/:id
 * @access  Private
 */
export const getChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findOne({ 
      _id: id, 
      userId: req.user._id 
    }).populate('userId', 'name email');

    if (!chat) {
      return sendError(res, 'Chat not found', 404);
    }

    sendSuccess(res, { chat }, 'Chat retrieved successfully');

  } catch (error) {
    logger.error('Get chat error:', error.message);
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid chat ID', 400);
    }
    sendError(res, 'Failed to retrieve chat', 500);
  }
});

/**
 * @desc    Create new chat
 * @route   POST /api/chats
 * @access  Private
 */
export const createChat = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  try {
    const { title, messages = [] } = req.body;

    const chat = new Chat({
      userId: req.user._id,
      title: title || 'New Chat',
      messages: messages.map(msg => ({
        id: msg.id || new Date().getTime().toString(),
        text: msg.text,
        isUser: msg.isUser,
        timestamp: msg.timestamp || new Date()
      }))
    });

    await chat.save();

    sendSuccess(res, { chat }, 'Chat created successfully', 201);

  } catch (error) {
    logger.error('Create chat error:', error.message);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return sendError(res, 'Validation failed', 400, validationErrors);
    }
    sendError(res, 'Failed to create chat', 500);
  }
});

/**
 * @desc    Update chat
 * @route   PUT /api/chats/:id
 * @access  Private
 */
export const updateChat = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  try {
    const { id } = req.params;
    const { title, isArchived, messages } = req.body;

    const chat = await Chat.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!chat) {
      return sendError(res, 'Chat not found', 404);
    }

    // Update allowed fields
    if (title !== undefined) {
      chat.title = title;
    }
    if (isArchived !== undefined) {
      chat.isArchived = isArchived;
    }
    if (messages !== undefined) {
      chat.messages = messages;
    }

    await chat.save();

    sendSuccess(res, { chat }, 'Chat updated successfully');

  } catch (error) {
    logger.error('Update chat error:', error.message);
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid chat ID', 400);
    }
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return sendError(res, 'Validation failed', 400, validationErrors);
    }
    sendError(res, 'Failed to update chat', 500);
  }
});

/**
 * @desc    Delete chat
 * @route   DELETE /api/chats/:id
 * @access  Private
 */
export const deleteChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!chat) {
      return sendError(res, 'Chat not found', 404);
    }

    await Chat.findByIdAndDelete(id);

    sendSuccess(res, null, 'Chat deleted successfully');

  } catch (error) {
    logger.error('Delete chat error:', error.message);
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid chat ID', 400);
    }
    sendError(res, 'Failed to delete chat', 500);
  }
});

/**
 * @desc    Add message to chat
 * @route   POST /api/chats/:id/messages
 * @access  Private
 */
export const addMessage = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }

  try {
    const { id } = req.params;
    const { text, isUser = true } = req.body;

    const chat = await Chat.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!chat) {
      return sendError(res, 'Chat not found', 404);
    }

    // Add message using the model method
    const messageData = {
      id: new Date().getTime().toString(),
      text,
      isUser,
      timestamp: new Date()
    };

    await chat.addMessage(messageData);

    // Return the updated chat with the new message
    const updatedChat = await Chat.findById(id).populate('userId', 'name email');

    sendSuccess(res, { 
      chat: updatedChat,
      message: messageData 
    }, 'Message added successfully', 201);

  } catch (error) {
    logger.error('Add message error:', error.message);
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid chat ID', 400);
    }
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return sendError(res, 'Validation failed', 400, validationErrors);
    }
    sendError(res, 'Failed to add message', 500);
  }
});

/**
 * @desc    Archive chat
 * @route   POST /api/chats/:id/archive
 * @access  Private
 */
export const archiveChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!chat) {
      return sendError(res, 'Chat not found', 404);
    }

    await chat.archive();

    sendSuccess(res, { chat }, 'Chat archived successfully');

  } catch (error) {
    logger.error('Archive chat error:', error.message);
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid chat ID', 400);
    }
    sendError(res, 'Failed to archive chat', 500);
  }
});

/**
 * @desc    Unarchive chat
 * @route   POST /api/chats/:id/unarchive
 * @access  Private
 */
export const unarchiveChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!chat) {
      return sendError(res, 'Chat not found', 404);
    }

    await chat.unarchive();

    sendSuccess(res, { chat }, 'Chat unarchived successfully');

  } catch (error) {
    logger.error('Unarchive chat error:', error.message);
    if (error.name === 'CastError') {
      return sendError(res, 'Invalid chat ID', 400);
    }
    sendError(res, 'Failed to unarchive chat', 500);
  }
});