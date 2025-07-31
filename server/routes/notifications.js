import express from 'express';
const router = express.Router();

// In-memory storage for notifications (use database in production)
let notifications = [];
let notificationId = 1;

// Get all active notifications
router.get('/', async (req, res) => {
  try {
    const activeNotifications = notifications.filter(n => n.isActive);
    res.json(activeNotifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Create new notification (admin only)
router.post('/create', async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const newNotification = {
      id: notificationId++,
      title,
      message,
      type: type || 'info', // info, warning, success, error
      priority: priority || 'normal', // low, normal, high
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'admin' // In production, get from auth
    };

    notifications.push(newNotification);
    
    console.log(`📢 New notification created: ${title}`);
    
    res.json({ 
      success: true, 
      notification: newNotification,
      message: 'Notification created successfully' 
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Update notification
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, priority, isActive } = req.body;
    
    const notificationIndex = notifications.findIndex(n => n.id === parseInt(id));
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update notification
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      ...(title && { title }),
      ...(message && { message }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      notification: notifications[notificationIndex],
      message: 'Notification updated successfully' 
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notificationIndex = notifications.findIndex(n => n.id === parseInt(id));
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notifications.splice(notificationIndex, 1);
    
    res.json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get all notifications for admin (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    res.json(notifications);
  } catch (error) {
    console.error('Error getting admin notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

export default router;
