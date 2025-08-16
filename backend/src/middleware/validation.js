import { body } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('geminiApiKey')
    .notEmpty()
    .withMessage('Gemini API key is required')
    .matches(/^AIza[0-9A-Za-z-_]{35}$/)
    .withMessage('Please provide a valid Gemini API key')
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for password change
 */
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for profile update
 */
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('geminiApiKey')
    .optional()
    .matches(/^AIza[0-9A-Za-z-_]{35}$/)
    .withMessage('Please provide a valid Gemini API key')
];

/**
 * Validation rules for forgot password
 */
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

/**
 * Validation rules for reset password
 */
export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

/**
 * Validation rules for creating a chat
 */
export const validateCreateChat = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('messages')
    .optional()
    .isArray()
    .withMessage('Messages must be an array'),
  
  body('messages.*.text')
    .if(body('messages').exists())
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message text must be between 1 and 5000 characters'),
  
  body('messages.*.isUser')
    .if(body('messages').exists())
    .isBoolean()
    .withMessage('isUser must be a boolean value')
];

/**
 * Validation rules for updating a chat
 */
export const validateUpdateChat = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean value'),
  
  body('messages')
    .optional()
    .isArray()
    .withMessage('Messages must be an array'),
  
  body('messages.*.text')
    .if(body('messages').exists())
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message text must be between 1 and 5000 characters'),
  
  body('messages.*.isUser')
    .if(body('messages').exists())
    .isBoolean()
    .withMessage('isUser must be a boolean value')
];

/**
 * Validation rules for adding a message to chat
 */
export const validateAddMessage = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message text must be between 1 and 5000 characters'),
  
  body('isUser')
    .optional()
    .isBoolean()
    .withMessage('isUser must be a boolean value')
];