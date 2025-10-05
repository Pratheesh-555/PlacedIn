import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const SUPER_ADMIN_EMAIL = 'pratheeshkrishnan595@gmail.com';

async function initializeSuperAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placedin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ email: SUPER_ADMIN_EMAIL });

    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', SUPER_ADMIN_EMAIL);
      
      // Ensure super admin flag is set
      if (!existingSuperAdmin.isSuperAdmin) {
        existingSuperAdmin.isSuperAdmin = true;
        existingSuperAdmin.permissions.canManageAdmins = true;
        await existingSuperAdmin.save();
        console.log('✅ Updated super admin permissions');
      }
    } else {
      // Create super admin
      const superAdmin = new Admin({
        email: SUPER_ADMIN_EMAIL,
        isSuperAdmin: true,
        addedBy: {
          email: 'system',
          name: 'System'
        },
        isActive: true,
        permissions: {
          canApprove: true,
          canDelete: true,
          canManageAdmins: true
        }
      });

      await superAdmin.save();
      console.log('✅ Super admin created successfully:', SUPER_ADMIN_EMAIL);
    }

    // Display all current admins
    const allAdmins = await Admin.find({ isActive: true }).select('email isSuperAdmin');
    console.log('\n📋 Current active admins:');
    allAdmins.forEach(admin => {
      console.log(`  - ${admin.email}${admin.isSuperAdmin ? ' (Super Admin)' : ''}`);
    });

    console.log('\n✅ Initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing super admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run initialization
initializeSuperAdmin();
