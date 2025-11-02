import express from 'express';
import Update from '../models/Update.js';
import { ADMIN_CONFIG } from '../config/adminConfig.js';
import { geminiHelper } from '../utils/geminiHelper.js';

const router = express.Router();

// Get all active updates (public route)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const updates = await Update.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .select('title content companyName createdAt viewCount')
      .lean();
    
    res.json(updates);
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Get single update by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    
    if (!update || !update.isActive) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    // Increment view count
    update.viewCount += 1;
    await update.save();
    
    res.json(update);
  } catch (error) {
    console.error('Error fetching update:', error);
    res.status(500).json({ error: 'Failed to fetch update' });
  }
});

// Admin: Get all updates (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const requestingUser = req.query.user ? JSON.parse(req.query.user) : null;
    
    // Check if user is admin
    const isAdmin = requestingUser && (
      ADMIN_CONFIG.isSuperAdmin(requestingUser.email) ||
      await ADMIN_CONFIG.isAdminEmail(requestingUser.email)
    );
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const updates = await Update.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(updates);
  } catch (error) {
    console.error('Error fetching all updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Admin: AI-powered extraction from pasted text
router.post('/extract', async (req, res) => {
  try {
    const { text, postedBy } = req.body;
    
    // Check if user is admin
    const isAdmin = postedBy && (
      ADMIN_CONFIG.isSuperAdmin(postedBy.email) ||
      await ADMIN_CONFIG.isAdminEmail(postedBy.email)
    );
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: false,
        message: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env file.',
        data: {
          companyName: '',
          title: '',
          content: text
        }
      });
    }
    
    // Use Gemini AI to extract information
    const extraction = await geminiHelper.extractUpdateInfo(text);
    
    if (!extraction.success) {
      return res.status(200).json({
        success: false,
        message: extraction.error,
        data: extraction.data
      });
    }
    
    res.json({
      success: true,
      data: extraction.data,
      message: 'Information extracted successfully'
    });
  } catch (error) {
    console.error('Error extracting update info:', error);
    res.status(500).json({ error: 'Failed to extract information' });
  }
});

// Admin: Create new update with AI moderation
router.post('/', async (req, res) => {
  try {
    const { title, content, companyName, postedBy, skipModeration } = req.body;
    
    // Check if user is admin
    const isAdmin = postedBy && (
      ADMIN_CONFIG.isSuperAdmin(postedBy.email) ||
      await ADMIN_CONFIG.isAdminEmail(postedBy.email)
    );
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Validate required fields
    if (!title || !content || !companyName) {
      return res.status(400).json({ error: 'Title, content, and company name are required' });
    }
    
    let moderationResult = null;
    let shouldAutoActivate = false;
    
    // Run AI moderation unless explicitly skipped OR if API key not configured
    if (!skipModeration && process.env.GEMINI_API_KEY) {
      moderationResult = await geminiHelper.moderateContent(content);
      
      // Auto-activate only if moderation passes with high confidence
      shouldAutoActivate = moderationResult.isApproved && 
                          moderationResult.confidence >= 85 &&
                          moderationResult.category === 'SAFE';
    }
    
    const newUpdate = new Update({
      title: title.trim(),
      content: content.trim(),
      companyName: companyName.trim(),
      postedBy: {
        googleId: postedBy.googleId,
        name: postedBy.name,
        email: postedBy.email
      },
      isActive: shouldAutoActivate || skipModeration,
      priority: req.body.priority || 0,
      aiModeration: moderationResult ? {
        checked: true,
        approved: moderationResult.isApproved,
        confidence: moderationResult.confidence,
        issues: moderationResult.issues,
        category: moderationResult.category,
        checkedAt: new Date()
      } : undefined,
      autoApprovalScheduledFor: !shouldAutoActivate && !skipModeration 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) 
        : undefined,
      manuallyReviewed: skipModeration
    });
    
    await newUpdate.save();
    
    res.status(201).json({
      message: 'Update created successfully',
      update: newUpdate,
      moderation: moderationResult ? {
        approved: moderationResult.isApproved,
        confidence: moderationResult.confidence,
        issues: moderationResult.issues,
        autoActivated: shouldAutoActivate
      } : null
    });
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// Admin: Create new update (old version for backward compatibility)
router.post('/legacy', async (req, res) => {
  try {
    const { title, content, companyName, postedBy } = req.body;
    
    // Check if user is admin
    const isAdmin = postedBy && (
      ADMIN_CONFIG.isSuperAdmin(postedBy.email) ||
      await ADMIN_CONFIG.isAdminEmail(postedBy.email)
    );
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Validate required fields
    if (!title || !content || !companyName) {
      return res.status(400).json({ error: 'Title, content, and company name are required' });
    }
    
    const newUpdate = new Update({
      title: title.trim(),
      content: content.trim(),
      companyName: companyName.trim(),
      postedBy: {
        googleId: postedBy.googleId,
        name: postedBy.name,
        email: postedBy.email
      },
      isActive: true,
      priority: req.body.priority || 0
    });
    
    await newUpdate.save();
    
    res.status(201).json({
      message: 'Update created successfully',
      update: newUpdate
    });
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// Admin: Update existing update
router.put('/:id', async (req, res) => {
  try {
    const { title, content, companyName, postedBy, isActive, priority } = req.body;
    
    // Check if user is admin
    const isAdmin = postedBy && (
      ADMIN_CONFIG.isSuperAdmin(postedBy.email) ||
      await ADMIN_CONFIG.isAdminEmail(postedBy.email)
    );
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (companyName) updateData.companyName = companyName.trim();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof priority === 'number') updateData.priority = priority;
    
    const updatedUpdate = await Update.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUpdate) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    res.json({
      message: 'Update updated successfully',
      update: updatedUpdate
    });
  } catch (error) {
    console.error('Error updating update:', error);
    res.status(500).json({ error: 'Failed to update update' });
  }
});

// Admin: Delete update (soft delete - set isActive to false)
router.delete('/:id', async (req, res) => {
  try {
    const requestingUser = req.body.postedBy || req.query.user;
    
    // Check if user is admin
    const isAdmin = requestingUser && (
      ADMIN_CONFIG.isSuperAdmin(requestingUser.email) ||
      await ADMIN_CONFIG.isAdminEmail(requestingUser.email)
    );
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const update = await Update.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// Admin: Permanently delete update
router.delete('/:id/permanent', async (req, res) => {
  try {
    const requestingUser = req.body.postedBy || req.query.user;
    
    // Check if user is admin
    const isAdmin = requestingUser && (
      ADMIN_CONFIG.isSuperAdmin(requestingUser.email) ||
      await ADMIN_CONFIG.isAdminEmail(requestingUser.email)
    );
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const update = await Update.findByIdAndDelete(req.params.id);
    
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    res.json({ message: 'Update permanently deleted' });
  } catch (error) {
    console.error('Error permanently deleting update:', error);
    res.status(500).json({ error: 'Failed to permanently delete update' });
  }
});

export default router;
