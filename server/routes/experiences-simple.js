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

    // Upload file to Cloudinary
    console.log('Uploading file to Cloudinary...');
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
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result?.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    // Create new experience with Cloudinary URL
    const experienceData = {
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      company: company.trim(),
      graduationYear: parseInt(graduationYear),
      experienceText: '', // Optional field, can be empty
      documentUrl: uploadResult.secure_url, // Store Cloudinary URL instead of buffer
      documentPublicId: uploadResult.public_id, // Store for deletion if needed
      documentName: req.file.originalname.trim(),
      type,
      postedBy: parsedPostedBy,
      isApproved: false // Normal workflow: requires admin approval
    };
    
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
    console.error('Request body:', req.body);
    console.error('Request file:', req.file ? { 
      originalname: req.file.originalname, 
      mimetype: req.file.mimetype, 
      size: req.file.size 
    } : 'No file');
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to submit experience' });
  }
});

export default router;
