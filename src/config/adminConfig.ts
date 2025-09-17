// Centralized admin configuration
export const ADMIN_CONFIG = {
  // List of email addresses that have admin access
  ADMIN_EMAILS: [
    'poreddysaivaishnavi@gmail.com',
    'pratheeshkrishnan595@gmail.com',
  ],
  
  // Function to check if an email is an admin
  isAdminEmail: (email: string): boolean => {
    return ADMIN_CONFIG.ADMIN_EMAILS.includes(email?.toLowerCase() || '');
  },
  
  // Admin permissions
  PERMISSIONS: {
    VIEW_ADMIN_DASHBOARD: true,
    APPROVE_EXPERIENCES: true,
    DELETE_EXPERIENCES: true,
    VIEW_USER_ANALYTICS: true,
    MANAGE_USERS: true
  }
};

export default ADMIN_CONFIG;
