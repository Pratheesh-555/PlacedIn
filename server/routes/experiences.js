import express from 'express';
import Experience from '../models/Experience.js';

const router = express.Router();

// Get all approved experiences
router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Get experience by ID
router.get('/:id', async (req, res) => {
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

// Create new experience
router.post('/', async (req, res) => {
  try {
    const { studentName, email, company, year, experienceText, type } = req.body;

    // Validation
    if (!studentName || !email || !company || !year || !experienceText || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (experienceText.length < 100) {
      return res.status(400).json({ error: 'Experience text must be at least 100 characters' });
    }

    if (!['placement', 'internship'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either placement or internship' });
    }

    // Create new experience
    const experience = new Experience({
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      year: parseInt(year),
      experienceText: experienceText.trim(),
      type,
      isApproved: false // Requires admin approval
    });

    await experience.save();
    
    res.status(201).json({ 
      message: 'Experience submitted successfully. It will be reviewed and published soon.',
      experienceId: experience._id 
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to submit experience' });
  }
});

// Search experiences
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const experiences = await Experience.find({
      isApproved: true,
      $or: [
        { company: { $regex: query, $options: 'i' } },
        { studentName: { $regex: query, $options: 'i' } },
        { experienceText: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(experiences);
  } catch (error) {
    console.error('Error searching experiences:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;