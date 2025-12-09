import express from 'express';
import multer from 'multer';
import Experience from '../models/Experience.js';
import User from '../models/User.js';

const router = express.Router();

//Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.get('/user/:googleId', async (req, res) => {
  try {
    const { googleId } = req.params;
    
    const experiences = await Experience.find({ 
      'postedBy.googleId': googleId,
      $or: [
        { isSuperseded: { $exists: false } },
        { isSuperseded: false }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(3); // Allow fetching up to 3 for display, but limit submission to 2
    
    const submissionCount = experiences.length;
    const maxSubmissions = 2;
    const canSubmitMore = submissionCount < maxSubmissions;
    
    res.json({
      experiences,
      submissionStats: {
        count: submissionCount,
        canSubmitMore,
        maxSubmissions
      }
    });
    
  } catch (error) {
    console.error('Error fetching user experiences:', error);
    res.status(500).json({ error: 'Failed to fetch user experiences' });
  }
});

router.put('/:id', upload.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateData = {
      studentName: req.body.studentName,
      email: req.body.email,
      company: req.body.company,
      graduationYear: parseInt(req.body.graduationYear),
      type: req.body.type,
      experienceText: req.body.experienceText,
      linkedinUrl: req.body.linkedinUrl || '',
      otherDiscussions: req.body.otherDiscussions || '',
      rounds: req.body.rounds ? JSON.parse(req.body.rounds) : [],
      postedBy: req.body.postedBy ? JSON.parse(req.body.postedBy) : {}
    };
    
    const existingExp = await Experience.findById(id);
    if (!existingExp) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    if (existingExp.postedBy.googleId !== updateData.postedBy.googleId) {
      return res.status(403).json({ error: 'Not authorized to edit this experience' });
    }

    let user = await User.findOne({ googleId: updateData.postedBy.googleId });
    if (!user) {
      user = new User({
        googleId: updateData.postedBy.googleId,
        name: updateData.postedBy.name,
        email: updateData.postedBy.email,
        picture: updateData.postedBy.picture
      });
      await user.save();
    }

    updateData.postedBy.userId = user._id;
    
    const updateFields = {
      ...updateData,
      submissionCount: (existingExp.submissionCount || 1) + 1,
      updatedAt: new Date()
    };

    if (existingExp.approvalStatus === 'rejected' || existingExp.approvalStatus === 'pending') {
      updateFields.version = existingExp.version || 1;
      updateFields.approvalStatus = 'pending';
    } else if (existingExp.approvalStatus === 'approved') {
      updateFields.version = (existingExp.version || 1) + 1;
      updateFields.approvalStatus = 'approved';
      updateFields.approvedAt = existingExp.approvedAt; // Keep original approval date
      updateFields.approvedBy = existingExp.approvedBy; // Keep original approver
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      message: 'Experience updated successfully',
      experience: updatedExperience 
    });
    
  } catch (error) {
    console.error('Error updating experience:', error);
    console.error('Request body:', req.body);
    console.error('Request params:', req.params);
    res.status(500).json({ error: 'Failed to update experience', details: error.message });
  }
});

export default router;
