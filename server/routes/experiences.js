import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Experience from '../models/Experience.js';

const router = express.Router();

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

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

router.get('/:id/document', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience || !experience.document || !experience.document.data) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.contentType(experience.document.contentType);
    res.send(experience.document.data);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});


// Upload document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      documentUrl,
      documentName: req.file.originalname,
      message: 'Document uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Create new experience
router.post('/', async (req, res) => {
  try {
    const { 
      studentName, 
      email, 
      company, 
      graduationYear, 
      experienceText,  
      documentName,
      type,
      postedBy 
    } = req.body;

    // Validation
    if (!studentName || !email || !company || !graduationYear || !experienceText || !documentUrl || !documentName || !type) {
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
  graduationYear: parseInt(graduationYear),
  experienceText: experienceText.trim(),
  document: {
    data: req.file.buffer,
    contentType: req.file.mimetype
  },
  documentName: req.file.originalname.trim(),
  type,
  postedBy,
  isApproved: false
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

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(process.cwd(), 'uploads', filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;