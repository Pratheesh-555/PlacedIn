import express from 'express';
const router = express.Router();

// In-memory storage for demonstration (use database in production)
let analytics = {
  totalViews: 0,
  uniqueVisitors: new Set(),
  dailyViews: {},
  pageViews: {
    '/': 0,
    '/experiences': 0,
    '/post': 0,
    '/admin': 0
  },
  userAgents: {},
  referrers: {}
};

// Track page view
router.post('/track', async (req, res) => {
  try {
    const { 
      page, 
      userId, 
      userAgent, 
      referrer, 
      timestamp = new Date(),
      sessionId 
    } = req.body;

    // Increment total views
    analytics.totalViews++;

    // Track unique visitors (by sessionId or userId)
    const visitorId = userId || sessionId;
    if (visitorId) {
      analytics.uniqueVisitors.add(visitorId);
    }

    // Track daily views
    const today = new Date().toISOString().split('T')[0];
    analytics.dailyViews[today] = (analytics.dailyViews[today] || 0) + 1;

    // Track page-specific views
    if (analytics.pageViews.hasOwnProperty(page)) {
      analytics.pageViews[page]++;
    }

    // Track user agents
    if (userAgent) {
      analytics.userAgents[userAgent] = (analytics.userAgents[userAgent] || 0) + 1;
    }

    // Track referrers
    if (referrer) {
      analytics.referrers[referrer] = (analytics.referrers[referrer] || 0) + 1;
    }

    console.log(`📊 Page view tracked: ${page} | Total: ${analytics.totalViews}`);

    res.json({ 
      success: true, 
      totalViews: analytics.totalViews,
      uniqueVisitors: analytics.uniqueVisitors.size
    });

  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Get analytics data
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalViews: analytics.totalViews,
      uniqueVisitors: analytics.uniqueVisitors.size,
      dailyViews: analytics.dailyViews,
      pageViews: analytics.pageViews,
      topUserAgents: Object.entries(analytics.userAgents)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topReferrers: Object.entries(analytics.referrers)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      todayViews: analytics.dailyViews[new Date().toISOString().split('T')[0]] || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Reset analytics (admin only)
router.post('/reset', async (req, res) => {
  try {
    analytics = {
      totalViews: 0,
      uniqueVisitors: new Set(),
      dailyViews: {},
      pageViews: {
        '/': 0,
        '/experiences': 0,
        '/post': 0,
        '/admin': 0
      },
      userAgents: {},
      referrers: {}
    };

    res.json({ success: true, message: 'Analytics reset successfully' });
  } catch (error) {
    console.error('Error resetting analytics:', error);
    res.status(500).json({ error: 'Failed to reset analytics' });
  }
});

export default router;
