import express from 'express';
import multer from 'multer';
import Experience from '../models/Experience.js';
import cloudinary from '../config/cloudinary.js';

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
      postedBy 
    } = req.body;

    // Validation
    if (!studentName || !email || !company || !graduationYear || !type) {
      console.log('Missing required fields:', { studentName: !!studentName, email: !!email, company: !!company, graduationYear: !!graduationYear, type: !!type });
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'Document upload is required' });
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

    // Temporary fallback: Store in MongoDB if Cloudinary fails
    let documentUrl = null;
    let documentPublicId = null;
    
    try {
      // Try Cloudinary upload first
      console.log('Uploading file to Cloudinary...');
      console.log('Cloudinary config check:', {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not set',
        apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
        apiSecretExists: !!process.env.CLOUDINARY_API_SECRET
      });
      
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "raw", // For PDFs and other documents
            folder: "placedin_documents",
            public_id: `${studentName.replace(/\s+/g, '_')}_${company.replace(/\s+/g, '_')}_${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              console.log('Cloudinary upload success:', result?.secure_url);
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });
      
      documentUrl = uploadResult.secure_url;
      documentPublicId = uploadResult.public_id;
      console.log('Using Cloudinary storage');
      
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, falling back to MongoDB storage:', cloudinaryError.message);
      // Don't throw error, continue with MongoDB storage
    }

    // Create new experience with flexible storage
    const experienceData = {
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      graduationYear: parseInt(graduationYear),
      experienceText: '', // Optional field, can be empty
      documentName: req.file.originalname.trim(),
      type,
      postedBy: parsedPostedBy,
      isApproved: false // Normal workflow: requires admin approval
    };
    
    // Add Cloudinary fields if upload was successful
    if (documentUrl && documentPublicId) {
      experienceData.documentUrl = documentUrl;
      experienceData.documentPublicId = documentPublicId;
      console.log('Experience will use Cloudinary storage');
    } else {
      // Fallback to MongoDB storage
      experienceData.document = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      console.log('Experience will use MongoDB storage (fallback)');
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
      console.log('Redirecting to Cloudinary URL:', experience.documentUrl);
      // Redirect to Cloudinary URL
      res.redirect(experience.documentUrl);
    } else if (experience.document && experience.document.data) {
      console.log('Serving document from MongoDB for experience:', req.params.id);
      // Legacy support for old documents stored in MongoDB
      res.contentType(experience.document.contentType || 'application/pdf');
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
