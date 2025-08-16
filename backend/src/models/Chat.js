import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  isUser: {
    type: Boolean,
    required: true,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  _id: false // Disable _id for subdocuments
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Chat title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: 'New Chat'
  },
  messages: {
    type: [messageSchema],
    default: [],
    validate: {
      validator: function(messages) {
        return messages.length <= 1000; // Limit messages per chat
      },
      message: 'Chat cannot have more than 1000 messages'
    }
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for efficient user chat queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isArchived: 1 });

// Instance method to add a message
chatSchema.methods.addMessage = function(messageData) {
  const message = {
    id: messageData.id || new mongoose.Types.ObjectId().toString(),
    text: messageData.text,
    isUser: messageData.isUser,
    timestamp: messageData.timestamp || new Date()
  };
  
  this.messages.push(message);
  return this.save();
};

// Instance method to get message count
chatSchema.methods.getMessageCount = function() {
  return this.messages.length;
};

// Instance method to get last message
chatSchema.methods.getLastMessage = function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
};

// Instance method to archive chat
chatSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Instance method to unarchive chat
chatSchema.methods.unarchive = function() {
  this.isArchived = false;
  return this.save();
};

// Static method to find user's active chats
chatSchema.statics.findUserActiveChats = function(userId) {
  return this.find({ userId, isArchived: false })
    .sort({ updatedAt: -1 })
    .populate('userId', 'name email');
};

// Static method to find user's archived chats
chatSchema.statics.findUserArchivedChats = function(userId) {
  return this.find({ userId, isArchived: true })
    .sort({ updatedAt: -1 })
    .populate('userId', 'name email');
};

// Static method to find all user chats
chatSchema.statics.findUserChats = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

// Pre-save middleware to update title based on first message if not set
chatSchema.pre('save', function(next) {
  if (this.isNew && this.title === 'New Chat' && this.messages.length > 0) {
    const firstMessage = this.messages[0];
    if (firstMessage.isUser && firstMessage.text) {
      // Use first 50 characters of first user message as title
      this.title = firstMessage.text.substring(0, 50).trim();
      if (firstMessage.text.length > 50) {
        this.title += '...';
      }
    }
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;