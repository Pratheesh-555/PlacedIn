import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { Notification } from '../types';

// Custom hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from server
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new notification (admin)
  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'createdBy' | 'isActive'>) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (response.ok) {
        await fetchNotifications(); // Refresh notifications
        return true;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
    return false;
  };

  // Update notification
  const updateNotification = async (id: number, updates: Partial<Notification>) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchNotifications(); // Refresh notifications
        return true;
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
    return false;
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchNotifications(); // Refresh notifications
        return true;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
    return false;
  };

  // Fetch notifications on mount and set up polling for real-time updates
  useEffect(() => {
    fetchNotifications();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    loading,
    createNotification,
    updateNotification,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
