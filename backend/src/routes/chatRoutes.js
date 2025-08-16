import express from 'express';
import {
  getChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  addMessage,
  archiveChat,
  unarchiveChat
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateCreateChat,
  validateUpdateChat,
  validateAddMessage
} from '../middleware/validation.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

/**
 * @desc    Get all user chats
 * @route   GET /api/chats
 * @access  Private
 */
router.get('/', getChats);

/**
 * @desc    Create new chat
 * @route   POST /api/chats
 * @access  Private
 */
router.post('/', validateCreateChat, createChat);

/**
 * @desc    Get specific chat by ID
 * @route   GET /api/chats/:id
 * @access  Private
 */
router.get('/:id', getChat);

/**
 * @desc    Update chat
 * @route   PUT /api/chats/:id
 * @access  Private
 */
router.put('/:id', validateUpdateChat, updateChat);

/**
 * @desc    Delete chat
 * @route   DELETE /api/chats/:id
 * @access  Private
 */
router.delete('/:id', deleteChat);

/**
 * @desc    Add message to chat
 * @route   POST /api/chats/:id/messages
 * @access  Private
 */
router.post('/:id/messages', validateAddMessage, addMessage);

/**
 * @desc    Archive chat
 * @route   POST /api/chats/:id/archive
 * @access  Private
 */
router.post('/:id/archive', archiveChat);

/**
 * @desc    Unarchive chat
 * @route   POST /api/chats/:id/unarchive
 * @access  Private
 */
router.post('/:id/unarchive', unarchiveChat);

export default router;