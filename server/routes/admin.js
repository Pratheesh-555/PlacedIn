import express from 'express';
import Experience from '../models/Experience.js';
import axios from 'axios';

const router = express.Router();

// Google OAuth admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  // Check if user is authenticated via Google OAuth
  // Look for user in different places: body, query, or headers
  const user = req.body.postedBy || req.query.user || req.body.user || req.headers['x-user'];
  
  // Admin emails that have access
  const adminEmails = [
    'poreddysaivaishnavi@gmail.com',
    'pratheeshkrishnan595@gmail.com'
  ];
  
  // For now, allow all requests to pass through since frontend auth is handled separately
  // In production, you'd want proper JWT token validation here
  
  // Skip authentication for now - frontend handles admin checking
  next();
};

// Get all pending experiences with optimization
router.get('/pending-experiences', async (req, res) => {
  try {
    const experiences = await Experience.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .select('studentName email company graduationYear experienceText type isApproved createdAt postedBy') // Only essential fields
      .lean() // Better performance
      .limit(100) // Limit to prevent huge loads
      .exec();
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching pending experiences:', error);
    res.status(500).json({ error: 'Failed to fetch pending experiences' });
  }
});

// Get all experiences (approved and pending) with optimized pagination
router.get('/experiences', async (req, res) => {
  try {
    // Get pagination parameters - optimized limits for admin
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Reduced for better performance
    const skip = (page - 1) * limit;
    
    // Execute parallel queries with timeout for better performance
    const queryPromise = Promise.race([
      Promise.all([
        Experience.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('studentName email company graduationYear experienceText type isApproved createdAt approvedAt postedBy') // Only essential fields
          .lean()
          .exec(),
        Experience.countDocuments({}).exec()
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000) // 10 second timeout
      )
    ]);

    const [experiences, totalCount] = await queryPromise;
    
    // Return with pagination metadata
    res.json({
      experiences,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        returned: experiences.length,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all experiences:', error);
    if (error.message === 'Query timeout') {
      return res.status(408).json({ error: 'Request timeout - please try again' });
    }
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Approve experience
router.put('/experiences/:id/approve', async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: true,
        approvedBy: req.body.postedBy,
        approvedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json({ 
      message: 'Experience approved successfully', 
      experience
    });
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

// Get experience by ID for detailed review
router.get('/experiences/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
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
    
    // Get yearly distribution (using graduationYear)
    const yearlyStats = await Experience.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSubmissions = await Experience.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      totalExperiences,
      approvedExperiences,
      pendingExperiences,
      placementCount,
      internshipCount,
      recentSubmissions,
      topCompanies: companies,
      yearlyDistribution: yearlyStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get experiences by user (for admin to see user's submissions)
router.get('/user-experiences/:googleId', async (req, res) => {
  try {
    const experiences = await Experience.find({
      'postedBy.googleId': req.params.googleId
    }).sort({ createdAt: -1 });
    
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching user experiences:', error);
    res.status(500).json({ error: 'Failed to fetch user experiences' });
  }
});

// Admin route to access any document (approved or pending)
router.get('/document/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Check if we have a Cloudinary URL (new system) or old document data
    if (experience.documentUrl) {
      // Instead of redirect, fetch and serve with proper headers for inline viewing
      try {
        const response = await axios.get(experience.documentUrl, {
          responseType: 'arraybuffer'
        });
        
        const contentType = response.headers['content-type'] || 'application/pdf';
        const buffer = Buffer.from(response.data);
        
        // Set headers for inline viewing instead of download
        res.set({
          'Content-Type': contentType,
          'Content-Disposition': 'inline; filename="' + (experience.documentName || 'document.pdf') + '"',
          'Content-Length': buffer.length
        });
        
        res.send(buffer);
      } catch (fetchError) {
        console.error('Error fetching Cloudinary document for admin:', fetchError);
        return res.status(404).json({ error: 'Document could not be loaded' });
      }
    } else if (experience.document && experience.document.data) {
      // Set headers for inline viewing instead of download
      res.set({
        'Content-Type': experience.document.contentType || 'application/pdf',
        'Content-Disposition': 'inline; filename="' + (experience.documentName || 'document.pdf') + '"',
        'Content-Length': experience.document.data.length
      });
      res.send(experience.document.data);
    } else {
      return res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error serving admin document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

export default router;