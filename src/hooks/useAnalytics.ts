import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

// Generate a unique session ID
const generateSessionId = () => {
  const existing = sessionStorage.getItem('sessionId');
  if (existing) return existing;
  
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
};

// Track page view
const trackPageView = async (page: string, userId?: string) => {
  try {
    const sessionId = generateSessionId();
    
    await fetch(`${API_ENDPOINTS.ANALYTICS}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        userId,
        sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Custom hook for tracking page views
export const usePageTracking = (userId?: string) => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, userId);
  }, [location.pathname, userId]);
};

// Get analytics stats
export const getAnalytics = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.ANALYTICS}/stats`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};

// Manual tracking function
export const trackView = (page: string, userId?: string) => {
  trackPageView(page, userId);
};
