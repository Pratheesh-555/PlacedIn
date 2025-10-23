import mongoose from 'mongoose';

const UpdateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  postedBy: {
    googleId: String,
    name: String,
    email: {
      type: String,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  viewCount: {
    type: Number,
    default: 0
  },
  // AI Moderation fields
  aiModeration: {
    checked: {
      type: Boolean,
      default: false
    },
    approved: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      default: 0
    },
    issues: [String],
    category: {
      type: String,
      enum: ['SAFE', 'COLLEGE_CRITICISM', 'PROFANITY', 'UNPROFESSIONAL', 'SPAM', 'ERROR', 'NOT_CHECKED'],
      default: 'NOT_CHECKED'
    },
    checkedAt: Date
  },
  // Auto-approval tracking
  autoApproved: {
    type: Boolean,
    default: false
  },
  autoApprovalScheduledFor: Date,
  manuallyReviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
UpdateSchema.index({ isActive: 1, createdAt: -1 });
UpdateSchema.index({ companyName: 1 });

export default mongoose.model('Update', UpdateSchema);
