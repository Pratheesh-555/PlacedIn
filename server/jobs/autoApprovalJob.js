import cron from 'node-cron';
import Update from '../models/Update.js';
import { geminiHelper } from '../utils/geminiHelper.js';

/**
 * Auto-approval job - runs every hour
 * Checks for updates created 24+ hours ago that haven't been manually reviewed
 */
export const startAutoApprovalJob = () => {
  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ Gemini API key not configured - Auto-approval job disabled');
    console.warn('📝 Add GEMINI_API_KEY to .env to enable AI-powered auto-approval');
    return;
  }
  
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🤖 Running auto-approval check...');
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Find updates that:
      // 1. Are inactive (not yet approved)
      // 2. Created more than 24 hours ago
      // 3. Not manually reviewed
      // 4. Not already auto-approved
      const pendingUpdates = await Update.find({
        isActive: false,
        createdAt: { $lte: oneDayAgo },
        manuallyReviewed: false,
        autoApproved: false
      });

      console.log(`Found ${pendingUpdates.length} updates pending auto-approval`);

      for (const update of pendingUpdates) {
        try {
          // Check if AI moderation was already done
          if (!update.aiModeration?.checked) {
            // Run AI moderation
            const moderationResult = await geminiHelper.moderateContent(update.content);
            
            update.aiModeration = {
              checked: true,
              approved: moderationResult.isApproved,
              confidence: moderationResult.confidence,
              issues: moderationResult.issues,
              category: moderationResult.category,
              checkedAt: new Date()
            };
            
            await update.save();
          }

          // Check eligibility for auto-approval
          const eligibility = await geminiHelper.checkAutoApprovalEligibility(update);
          
          if (eligibility.eligible) {
            // Auto-approve
            update.isActive = true;
            update.autoApproved = true;
            await update.save();
            
            console.log(`✅ Auto-approved update: ${update._id} - ${update.title}`);
          } else {
            console.log(`⚠️ Update ${update._id} not eligible: ${eligibility.message}`);
          }
        } catch (error) {
          console.error(`Error processing update ${update._id}:`, error);
        }
      }
      
      console.log('✅ Auto-approval check completed');
    } catch (error) {
      console.error('❌ Error in auto-approval job:', error);
    }
  });

  console.log('✅ Auto-approval cron job started (runs every hour)');
};
