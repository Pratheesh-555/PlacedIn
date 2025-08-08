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
  postedBy: {
    googleId: String,
    name: String,
    email: String,
    picture: String
  },
  approvedBy: {
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

// Enhanced indexes for better query performance and scalability
ExperienceSchema.index({ company: 1 });
ExperienceSchema.index({ graduationYear: -1 });
ExperienceSchema.index({ type: 1 });
ExperienceSchema.index({ isApproved: 1, createdAt: -1 }); // Compound index for approved experiences
ExperienceSchema.index({ createdAt: -1 });
ExperienceSchema.index({ 'postedBy.googleId': 1, createdAt: -1 }); // Compound index for user experiences
ExperienceSchema.index({ 'approvedBy.googleId': 1 });
ExperienceSchema.index({ email: 1 }); // Index for email lookups
ExperienceSchema.index({ isApproved: 1, type: 1 }); // Compound index for filtering

export default mongoose.model('Experience', ExperienceSchema);