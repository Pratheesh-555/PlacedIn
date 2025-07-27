// API configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://your-backend-url.com');

export const API_ENDPOINTS = {
  EXPERIENCES: `${API_BASE_URL}/api/experiences`,
  ADMIN: `${API_BASE_URL}/api/admin`,
};

export default API_BASE_URL; 