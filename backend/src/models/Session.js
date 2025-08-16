import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: [true, 'Refresh token is required'],
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expireAfterSeconds: 0 } // MongoDB TTL index for automatic cleanup
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.token; // Don't expose tokens in JSON
      delete ret.refreshToken;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1, isActive: 1 });
sessionSchema.index({ refreshToken: 1, isActive: 1 });

// Instance method to deactivate session
sessionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to check if session is expired
sessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Instance method to extend session expiration
sessionSchema.methods.extendExpiration = function(additionalTime = 7 * 24 * 60 * 60 * 1000) { // 7 days default
  this.expiresAt = new Date(Date.now() + additionalTime);
  return this.save();
};

// Static method to find active session by token
sessionSchema.statics.findActiveByToken = function(token) {
  return this.findOne({ 
    token, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId', 'name email isActive');
};

// Static method to find active session by refresh token
sessionSchema.statics.findActiveByRefreshToken = function(refreshToken) {
  return this.findOne({ 
    refreshToken, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId', 'name email isActive');
};

// Static method to find user's active sessions
sessionSchema.statics.findUserActiveSessions = function(userId) {
  return this.find({ 
    userId, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to deactivate all user sessions
sessionSchema.statics.deactivateUserSessions = async function(userId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpiredSessions = async function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Remove inactive sessions older than 30 days
    ]
  });
};

// Static method to get session statistics
sessionSchema.statics.getSessionStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$isActive', true] },
                  { $gt: ['$expiresAt', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        expiredSessions: {
          $sum: {
            $cond: [
              { $lt: ['$expiresAt', new Date()] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || { totalSessions: 0, activeSessions: 0, expiredSessions: 0 };
};

// Note: expiresAt is required, no default value set in pre-save

const Session = mongoose.model('Session', sessionSchema);

export default Session;