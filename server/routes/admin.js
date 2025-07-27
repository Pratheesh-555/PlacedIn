import express from 'express';
import Experience from '../models/Experience.js';

const router = express.Router();

// Simple admin authentication middleware (in production, use proper JWT auth)
const authenticateAdmin = (req, res, next) => {
  // This is a simplified version - implement proper authentication
  const adminKey = req.headers['admin-key'];
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'admin123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all pending experiences
router.get('/pending-experiences', async (req, res) => {
  try {
    const experiences = await Experience.find({ isApproved: false })
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching pending experiences:', error);
    res.status(500).json({ error: 'Failed to fetch pending experiences' });
  }
});

// Get all experiences (approved and pending)
router.get('/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find({})
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching all experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Approve experience
router.put('/experiences/:id/approve', async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json({ message: 'Experience approved successfully', experience });
  } catch (error) {
    console.error('Error approving experience:', error);
    res.status(500).json({ error: 'Failed to approve experience' });
  }
});

// Reject/Delete experience
router.delete('/experiences/:id', async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalExperiences = await Experience.countDocuments();
    const approvedExperiences = await Experience.countDocuments({ isApproved: true });
    const pendingExperiences = await Experience.countDocuments({ isApproved: false });
    
    const placementCount = await Experience.countDocuments({ type: 'placement', isApproved: true });
    const internshipCount = await Experience.countDocuments({ type: 'internship', isApproved: true });
    
    // Get company distribution
    const companies = await Experience.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get yearly distribution
    const yearlyStats = await Experience.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      totalExperiences,
      approvedExperiences,
      pendingExperiences,
      placementCount,
      internshipCount,
      topCompanies: companies,
      yearlyDistribution: yearlyStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;