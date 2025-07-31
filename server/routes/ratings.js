import express from 'express';
import Rating from '../models/Rating.js';

const router = express.Router();

// Submit a rating
router.post('/submit', async (req, res) => {
  try {
    const { rating, label } = req.body;
    
    const newRating = new Rating({
      rating,
      label,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });
    
    await newRating.save();
    
    res.status(201).json({ 
      message: 'Rating submitted successfully',
      rating: newRating 
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get all ratings (admin only)
router.get('/all', async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ timestamp: -1 });
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Get rating statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Rating.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
          label: { $first: '$label' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totalRatings = await Rating.countDocuments();
    const averageRating = await Rating.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    
    res.json({
      stats,
      totalRatings,
      averageRating: averageRating[0]?.avgRating || 0
    });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    res.status(500).json({ error: 'Failed to fetch rating statistics' });
  }
});

export default router;
