import API_BASE_URL from './api';

// Super admin email - hardcoded
const SUPER_ADMIN_EMAIL = 'pratheeshkrishnan595@gmail.com';

// Centralized admin configuration
export const ADMIN_CONFIG = {
  SUPER_ADMIN_EMAIL,
  
  // Cache for admin emails (fetched from backend)
  _adminCache: new Set<string>([SUPER_ADMIN_EMAIL.toLowerCase()]),
  _lastFetch: 0,
  _cacheDuration: 5 * 60 * 1000, // 5 minutes
  
  // Function to check if an email is super admin
  isSuperAdmin: (email: string): boolean => {
    return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  },
  
  // Function to fetch admin list from backend
  fetchAdminList: async (): Promise<void> => {
    const now = Date.now();
    
    // Use cache if recent
    if (now - ADMIN_CONFIG._lastFetch < ADMIN_CONFIG._cacheDuration) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/manage-admins`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const admins = await response.json();
        ADMIN_CONFIG._adminCache = new Set(
          admins.map((admin: { email: string }) => admin.email.toLowerCase())
        );
        ADMIN_CONFIG._lastFetch = now;
      }
    } catch (error) {
      console.error('Error fetching admin list:', error);
      // Keep existing cache on error
    }
  },
  
  // Function to check if an email is an admin (uses cache)
  isAdminEmail: (email: string): boolean => {
    if (!email) return false;
    
    // Super admin is always an admin
    if (ADMIN_CONFIG.isSuperAdmin(email)) {
      return true;
    }
    
    return ADMIN_CONFIG._adminCache.has(email.toLowerCase());
  },
  
  // Function to check admin status from backend (for critical operations)
  checkAdminStatus: async (email: string): Promise<{ isAdmin: boolean; isSuperAdmin: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/check-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update cache if user is admin
        if (result.isAdmin) {
          ADMIN_CONFIG._adminCache.add(email.toLowerCase());
        }
        
        return result;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
    
    return { isAdmin: false, isSuperAdmin: false };
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
