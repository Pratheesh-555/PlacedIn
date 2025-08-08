import express from 'express';
import multer from 'multer';
import Experience from '../models/Experience.js';

const router = express.Router();

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

// Get all approved experiences with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const totalCount = await Experience.countDocuments({ isApproved: true });
    const experiences = await Experience.find({ isApproved: true })
      .sort({ approvedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-document')
      .lean();

    const response = {
      experiences,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        returned: experiences.length
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching approved experiences:', error);
    res.status(500).json({ 
      error: 'Failed to fetch experiences'
    });
  }
});

// Create new experience with Cloudinary upload
router.post('/', upload.single('document'), async (req, res) => {
  try {
    console.log('Received POST request to create experience');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? { 
      originalname: req.file.originalname, 
      mimetype: req.file.mimetype, 
      size: req.file.size 
    } : 'No file');
    
    const { 
      studentName, 
      email, 
      company, 
      graduationYear, 
      type,
      experienceText,
      postedBy 
    } = req.body;

    // Validation
    if (!studentName || !email || !company || !graduationYear || !type) {
      console.log('Missing required fields:', { studentName: !!studentName, email: !!email, company: !!company, graduationYear: !!graduationYear, type: !!type });
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if either experienceText or file is provided
    if (!experienceText && !req.file) {
      console.log('No experience text or file provided');
      return res.status(400).json({ error: 'Either experience text or document upload is required' });
    }

    // If experienceText is provided, validate minimum length
    if (experienceText && experienceText.trim().length < 50) {
      return res.status(400).json({ error: 'Experience text must be at least 50 characters long' });
    }

    if (!['placement', 'internship'].includes(type)) {
      console.log('Invalid type:', type);
      return res.status(400).json({ error: 'Type must be either placement or internship' });
    }

    // Parse postedBy if it's a string
    let parsedPostedBy = postedBy;
    if (typeof postedBy === 'string') {
      try {
        parsedPostedBy = JSON.parse(postedBy);
        console.log('Parsed postedBy:', parsedPostedBy);
      } catch (parseError) {
        console.error('Error parsing postedBy:', parseError);
        parsedPostedBy = null;
      }
    }

    // Handle file upload if present
    let documentUrl = null;
    let documentPublicId = null;
    
    // Handle file upload if present (store in MongoDB only)
    if (req.file) {
      try {
        console.log('Storing file in MongoDB...');
        documentUrl = null; // No Cloudinary, so no URL
        documentPublicId = null; // No Cloudinary, so no public ID
        console.log('Using MongoDB storage');
      } catch (error) {
        console.error('File processing failed:', error);
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
      console.log('Experience will use MongoDB storage');
    }
    
    console.log('Creating experience with data:', experienceData);
    
    const experience = new Experience(experienceData);
    await experience.save();
    console.log('Experience saved successfully with ID:', experience._id);
    
    res.status(201).json({ 
      message: 'Experience submitted successfully. It will be reviewed and published soon.',
      experienceId: experience._id 
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('Request body:', req.body);
    console.error('Request file:', req.file ? { 
      originalname: req.file.originalname, 
      mimetype: req.file.mimetype, 
      size: req.file.size 
    } : 'No file');
    
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
      console.log('Serving Cloudinary document for viewing:', experience.documentUrl);
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
      console.log('Serving document from MongoDB for viewing:', req.params.id);
      // Set headers for inline viewing instead of download
      res.set({
        'Content-Type': experience.document.contentType || 'application/pdf',
        'Content-Disposition': 'inline; filename="' + (experience.documentName || 'document.pdf') + '"',
        'Content-Length': experience.document.data.length
      });
      res.send(experience.document.data);
    } else {
      console.log('No document found for experience:', req.params.id);
      return res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

export default router;
