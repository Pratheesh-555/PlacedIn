import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  picture: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    graduationYear: {
      type: Number,
      min: 2020,
      max: 2035
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100
    },
    rollNumber: {
      type: String,
      trim: true,
      maxlength: 20
    },
    linkedinUrl: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  statistics: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    approvedSubmissions: {
      type: Number,
      default: 0
    },
    pendingSubmissions: {
      type: Number,
      default: 0
    },
    rejectedSubmissions: {
      type: Number,
      default: 0
    },
    lastSubmissionDate: {
      type: Date
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ 'profile.graduationYear': 1 });
UserSchema.index({ lastActiveAt: -1 });

// Update last active time on save
UserSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActiveAt = new Date();
  }
  next();
});

export default mongoose.model('User', UserSchema);
