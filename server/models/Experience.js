import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  graduationYear: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  experienceText: {
    type: String,
    required: true,
    minlength: 50,  // Minimum 50 characters for meaningful content
    maxlength: 10000  // Increased to 10,000 characters for detailed experiences
  },
  document: {
    data: Buffer,
    contentType: String
  },
  documentName: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['placement', 'internship']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  linkedinUrl: {
    type: String,
    trim: true,
    maxlength: 200
  },
  otherDiscussions: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  rounds: [{
    id: String,
    name: String,
    content: String
  }],
  isResubmission: {
    type: Boolean,
    default: false
  },
  originalExperienceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience'
  },
  version: {
    type: Number,
    default: 1
  },
  submissionCount: {
    type: Number,
    default: 1
  },
  postedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    googleId: {
      type: String,
      required: true
    },
    name: String,
    email: String,
    picture: String
  },
  approvedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    googleId: String,
    name: String,
    email: String,
    picture: String
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Enhanced indexes for high-concurrent access and performance
ExperienceSchema.index({ isApproved: 1, approvedAt: -1, createdAt: -1 }); // Primary query index
ExperienceSchema.index({ isApproved: 1, company: 1, createdAt: -1 }); // Company filter
ExperienceSchema.index({ isApproved: 1, graduationYear: 1, createdAt: -1 }); // Year filter
ExperienceSchema.index({ isApproved: 1, type: 1, createdAt: -1 }); // Type filter
ExperienceSchema.index({ 'postedBy.userId': 1, createdAt: -1 }); // User's experiences
ExperienceSchema.index({ 'postedBy.userId': 1, approvalStatus: 1, createdAt: -1 }); // User dashboard queries
ExperienceSchema.index({ 'postedBy.googleId': 1, createdAt: -1 }); // Backward compatibility
ExperienceSchema.index({ 'postedBy.googleId': 1, approvalStatus: 1, createdAt: -1 }); // Backward compatibility
ExperienceSchema.index({ email: 1 }); // Email lookups
ExperienceSchema.index({ company: 'text', studentName: 'text', experienceText: 'text' }); // Text search
ExperienceSchema.index({ originalExperienceId: 1 }); // Track resubmissions

// Additional performance optimizations
ExperienceSchema.index({ isApproved: 1, company: 1, graduationYear: 1, type: 1, createdAt: -1 }); // Complex filters

export default mongoose.model('Experience', ExperienceSchema);