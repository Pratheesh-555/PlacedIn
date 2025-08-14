import express from 'express';
import Experience from '../models/Experience.js';

const router = express.Router();

// Get user's submissions (latest versions only, max 3)
router.get('/user/:googleId', async (req, res) => {
  try {
    const { googleId } = req.params;
    
    const experiences = await Experience.aggregate([
      {
        $match: { 
          'postedBy.googleId': googleId,
          // Get only the latest version of each original experience
          $or: [
            { originalExperienceId: { $exists: false } }, // Original experiences
            { 
              $expr: { 
                $eq: [
                  '$version',
                  { $max: { $ifNull: ['$version', 1] } }
                ]
              }
            }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 3 },
      {
        $project: {
          company: 1,
          approvalStatus: 1,
          rejectionReason: 1,
          version: 1,
          submissionCount: 1,
          createdAt: 1,
          updatedAt: 1,
          rounds: 1,
          otherDiscussions: 1,
          linkedinUrl: 1,
          type: 1,
          graduationYear: 1,
          studentName: 1,
          email: 1,
          experienceText: 1
        }
      }
    ]);
    
    const submissionCount = experiences.length;
    const canSubmitMore = submissionCount < 3;
    
    res.json({
      experiences,
      submissionCount,
      canSubmitMore,
      maxSubmissions: 3
    });
    
  } catch (error) {
    console.error('Error fetching user experiences:', error);
    res.status(500).json({ error: 'Failed to fetch user experiences' });
  }
});

// Update/Edit experience (creates new version)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Verify ownership
    const existingExp = await Experience.findById(id);
    if (!existingExp) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    if (existingExp.postedBy.googleId !== updateData.postedBy.googleId) {
      return res.status(403).json({ error: 'Not authorized to edit this experience' });
    }
    
    // Create new version
    const newVersion = new Experience({
      ...updateData,
      isResubmission: true,
      originalExperienceId: existingExp.originalExperienceId || existingExp._id,
      version: (existingExp.version || 1) + 1,
      submissionCount: (existingExp.submissionCount || 1) + 1,
      approvalStatus: 'pending' // Reset to pending for review
    });
    
    await newVersion.save();
    
    // Hide old version by marking it as superseded
    await Experience.findByIdAndUpdate(id, { 
      supersededBy: newVersion._id,
      isSuperseded: true 
    });
    
    res.status(201).json({ 
      message: 'Experience updated successfully',
      experience: newVersion 
    });
    
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

export default router;
