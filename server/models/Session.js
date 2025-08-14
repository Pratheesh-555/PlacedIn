import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  googleId: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index for auto-cleanup
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
SessionSchema.index({ sessionId: 1, isActive: 1 });
SessionSchema.index({ userId: 1, isActive: 1, lastAccessedAt: -1 });
SessionSchema.index({ googleId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }); // For TTL cleanup

// Update last accessed time on save
SessionSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastAccessedAt = new Date();
  }
  next();
});

// Static method to cleanup expired sessions
SessionSchema.statics.cleanupExpired = function() {
  return this.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
};

// Static method to revoke all user sessions
SessionSchema.statics.revokeUserSessions = function(userId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

export default mongoose.model('Session', SessionSchema);
