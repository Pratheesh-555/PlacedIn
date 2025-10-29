import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from './models/Admin.js';

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const admins = await Admin.find({ isActive: true }).lean();
    
    if (admins.length === 0) {
      console.log('❌ No admins found in database\n');
      console.log('💡 To add admins, use the Admin Dashboard -> Manage Admins tab');
      console.log('   (You need to be logged in as super admin: pratheeshkrishnan595@gmail.com)\n');
    } else {
      console.log(`📋 Found ${admins.length} active admin(s):\n`);
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Super Admin: ${admin.isSuperAdmin ? 'Yes' : 'No'}`);
        console.log(`   Permissions:`);
        console.log(`     - Approve: ${admin.permissions.canApprove}`);
        console.log(`     - Delete: ${admin.permissions.canDelete}`);
        console.log(`     - Manage Admins: ${admin.permissions.canManageAdmins}`);
        console.log(`   Added by: ${admin.addedBy.email}`);
        console.log(`   Created: ${new Date(admin.createdAt).toLocaleString()}`);
        console.log('');
      });
    }
    
    console.log('✨ Done!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkAdmins();
