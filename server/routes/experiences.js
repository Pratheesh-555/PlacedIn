import express from 'express';
import multer from 'multer';
import Experience from '../models/Experience.js';
import { experienceReadLimit, experiencePostLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

// Debug route to check database status
router.get('/debug', async (req, res) => {
  try {
    const totalExperiences = await Experience.countDocuments({});
    const approvedExperiences = await Experience.countDocuments({ isApproved: true });
    const pendingExperiences = await Experience.countDocuments({ isApproved: false });
    
    const sampleApproved = await Experience.findOne({ isApproved: true }).lean();
    
    res.json({
      total: totalExperiences,
      approved: approvedExperiences,
      pending: pendingExperiences,
      sampleApproved: sampleApproved ? {
        id: sampleApproved._id,
        studentName: sampleApproved.studentName,
        company: sampleApproved.company,
        isApproved: sampleApproved.isApproved
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure multer for memory storage (Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  }
});

// Get all approved experiences with optimized pagination and filtering
router.get('/', experienceReadLimit, async (req, res) => {
  try {
    // Sanitize and validate input parameters
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Reduced default for better performance
    const skip = (page - 1) * limit;
    
    // Build query for approved experiences
    const baseQuery = { isApproved: true };
    
    // Add optional filters
    const query = { ...baseQuery };
    if (req.query.company && req.query.company !== '') {
      query.company = new RegExp(req.query.company, 'i');
    }
    if (req.query.graduationYear && req.query.graduationYear !== '') {
      query.graduationYear = parseInt(req.query.graduationYear);
    }
    if (req.query.type && req.query.type !== '') {
      query.type = req.query.type;
    }
    if (req.query.search && req.query.search !== '') {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { studentName: searchRegex },
        { company: searchRegex },
        { experienceText: searchRegex }
      ];
    }

    // Execute optimized parallel queries with timeout
    const queryPromise = Promise.race([
      Promise.all([
        Experience.find(query)
          .sort({ approvedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('studentName email company graduationYear experienceText type isApproved createdAt approvedAt postedBy') // Only essential fields
          .lean() // Return plain objects for better performance
          .exec(),
        
        // Fast count for simple queries
        Object.keys(query).length === 1 && query.isApproved ? 
          Experience.estimatedDocumentCount() : 
          Experience.countDocuments(query).lean().exec()
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 15000) // 15 second timeout
      )
    ]);

    const [experiences, totalCount] = await queryPromise;

    // Simple performance headers for client caching
    res.set({
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=120', // Reduced cache times
      'X-Total-Count': totalCount.toString()
    });

    const response = {
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
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching approved experiences:', error);
    if (error.message === 'Query timeout') {
      return res.status(408).json({ error: 'Request timeout - please try again' });
    }
    res.status(500).json({ 
      error: 'Failed to fetch experiences'
    });
  }
});

// Create new experience with optimized processing
router.post('/', experiencePostLimit, upload.single('document'), async (req, res) => {
  try {
    const { 
      studentName, 
      email, 
      company, 
      graduationYear, 
      type,
      experienceText,
      postedBy 
    } = req.body;

    // Fast validation with early returns
    if (!studentName?.trim() || !email?.trim() || !company?.trim() || !graduationYear || !type) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!experienceText?.trim() && !req.file) {
      return res.status(400).json({ error: 'Either experience text or document upload is required' });
    }

    if (experienceText && experienceText.trim().length < 50) {
      return res.status(400).json({ error: 'Experience text must be at least 50 characters long' });
    }

    if (!['placement', 'internship'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either placement or internship' });
    }

    // Parse postedBy if it's a string
    let parsedPostedBy = postedBy;
    if (typeof postedBy === 'string') {
      try {
        parsedPostedBy = JSON.parse(postedBy);
      } catch (parseError) {
        parsedPostedBy = null;
      }
    }

    // Handle file upload if present
    let documentUrl = null;
    let documentPublicId = null;
    
    // Handle file upload if present (store in MongoDB only)
    if (req.file) {
      try {
        documentUrl = null; // No Cloudinary, so no URL
        documentPublicId = null; // No Cloudinary, so no public ID
      } catch (error) {
        return res.status(500).json({ error: 'File processing failed' });
      }
    }

    // Create new experience with flexible storage
    const experienceData = {
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      graduationYear: parseInt(graduationYear),
      experienceText: experienceText ? experienceText.trim() : '', // Handle text-based experiences
      type,
      postedBy: parsedPostedBy,
      isApproved: false // Normal workflow: requires admin approval
    };
    
    // Add file-related fields only if file was uploaded
    if (req.file) {
      experienceData.documentName = req.file.originalname.trim();
      
      // Store file in MongoDB
      experienceData.document = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    const experience = new Experience(experienceData);
    await experience.save();
    
    res.status(201).json({ 
      message: 'Experience submitted successfully. It will be reviewed and published soon.',
      experienceId: experience._id 
    });
  } catch (error) {
    console.error('Error creating experience:', error.message);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    // Provide more specific error messages
    if (error.message.includes('Cloudinary')) {
      return res.status(500).json({ 
        error: 'File upload service is currently unavailable. Please try again later.',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit experience',
      details: error.message
    });
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

// Serve document by experience ID
router.get('/:id/document', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Only allow access to approved experiences or admin users
    if (!experience.isApproved) {
      return res.status(403).json({ error: 'Document access denied. Experience not yet approved.' });
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
        console.error('Error fetching Cloudinary document:', fetchError);
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
    console.error('Error serving document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

export default router;
