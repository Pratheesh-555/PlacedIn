import mongoose from 'mongoose';

const AdminActivitySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'experience_approved',
      'experience_rejected', 
      'experience_deleted',
      'user_promoted',
      'user_demoted',
      'user_suspended',
      'user_reactivated',
      'bulk_approval',
      'bulk_rejection',
      'system_maintenance'
    ]
  },
  targetType: {
    type: String,
    required: true,
    enum: ['experience', 'user', 'system']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  details: {
    experienceTitle: String,
    userName: String,
    userEmail: String,
    reason: String,
    previousStatus: String,
    newStatus: String,
    bulkCount: Number
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for admin reporting and auditing
AdminActivitySchema.index({ adminId: 1, createdAt: -1 });
AdminActivitySchema.index({ action: 1, createdAt: -1 });
AdminActivitySchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AdminActivitySchema.index({ createdAt: -1 }); // For recent activity

export default mongoose.model('AdminActivity', AdminActivitySchema);
