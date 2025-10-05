import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  addedBy: {
    email: {
      type: String,
      required: true
    },
    name: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canApprove: {
      type: Boolean,
      default: true
    },
    canDelete: {
      type: Boolean,
      default: true
    },
    canManageAdmins: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for fast lookups
AdminSchema.index({ email: 1 });
AdminSchema.index({ isActive: 1 });

export default mongoose.model('Admin', AdminSchema);
