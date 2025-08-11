// API configuration for different environments
// For mobile compatibility, use the computer's IP address instead of localhost
const getApiUrl = () => {
  // Check if we're in development and on a mobile device accessing the dev server
  if (import.meta.env.DEV) {
    // Try to detect if we're accessing from a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isMobile && !isLocalhost) {
      // Mobile device accessing the development server via network
      // Use the same host as the frontend but with port 5000
      return `http://${window.location.hostname}:5000`;
    }
    // Regular localhost development
    return 'http://localhost:5000';
  }
  // Production
  return 'https://placedin.onrender.com';
};

const API_BASE_URL = import.meta.env.VITE_API_URL || getApiUrl();

export const API_ENDPOINTS = {
  EXPERIENCES: `${API_BASE_URL}/api/experiences`,
  ADMIN: `${API_BASE_URL}/api/admin`,
};

export default API_BASE_URL; 