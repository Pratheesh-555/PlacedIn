import Admin from '../models/Admin.js';

// Super admin email - hardcoded and always has access
const SUPER_ADMIN_EMAIL = 'pratheeshkrishnan595@gmail.com';

// Centralized admin configuration for server
export const ADMIN_CONFIG = {
  SUPER_ADMIN_EMAIL,
  
  // Function to check if an email is a super admin
  isSuperAdmin: (email) => {
    return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  },
  
  // Function to check if an email is an admin (checks database)
  isAdminEmail: async (email) => {
    if (!email) return false;
    
    const normalizedEmail = email.toLowerCase();
    
    // Super admin always has access
    if (normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
    
    // Check database for other admins
    try {
      const admin = await Admin.findOne({ 
        email: normalizedEmail, 
        isActive: true 
      });
      return !!admin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  // Synchronous check (for backwards compatibility, checks super admin only)
  isAdminEmailSync: (email) => {
    return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  },
  
  // Admin permissions
  PERMISSIONS: {
    VIEW_ADMIN_DASHBOARD: true,
    APPROVE_EXPERIENCES: true,
    DELETE_EXPERIENCES: true,
    VIEW_USER_ANALYTICS: true,
    MANAGE_USERS: true,
    MANAGE_ADMINS: true // Only super admin
  }
};

export default ADMIN_CONFIG;
