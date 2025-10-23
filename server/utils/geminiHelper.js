import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback to direct REST API call
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export const geminiHelper = {
  /**
   * Extract title, content, and company name from pasted text
   */
  async extractUpdateInfo(text) {
    try {
      const prompt = `You are an AI assistant that extracts information from announcements.

Extract from this text:
1. Company Name (Google, Microsoft, Amazon, etc. If unclear, use "General")
2. Title (short, clear, max 100 characters)
3. Content (clean, formatted summary)

Return ONLY valid JSON (no markdown, no extra text):
{
  "companyName": "company or General",
  "title": "clear title",
  "content": "formatted content"
}

Text:
${text}`;

      let responseText;
      
      try {
        // Try SDK first
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (sdkError) {
        // Fallback to direct API
        console.log('SDK failed, using direct API...');
        responseText = await callGeminiAPI(prompt);
      }
      
      // Clean response
      let cleanedResponse = responseText.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const parsed = JSON.parse(cleanedResponse);
      
      return {
        success: true,
        data: {
          companyName: parsed.companyName || 'General',
          title: parsed.title || 'Update',
          content: parsed.content || text
        }
      };
    } catch (error) {
      console.error('Error extracting update info:', error);
      return {
        success: false,
        error: 'AI extraction failed. Please fill manually.',
        data: {
          companyName: 'General',
          title: '',
          content: text
        }
      };
    }
  },

  /**
   * Deep content moderation - check for inappropriate content
   */
  async moderateContent(text) {
    try {
      const prompt = `You are a content moderator for a student placement platform.

Check this text for:
1. Bad language about college/institution
2. Profanity or offensive language
3. Unprofessional content
4. Spam

Rules:
- Even mild college criticism = REJECT
- Any profanity = REJECT
- If clean and professional = APPROVE

Return ONLY valid JSON:
{
  "isApproved": true/false,
  "confidence": 0-100,
  "issues": ["list of issues or empty"],
  "reason": "explanation",
  "category": "SAFE/COLLEGE_CRITICISM/PROFANITY/UNPROFESSIONAL/SPAM"
}

Text:
${text}`;

      let responseText;
      
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } catch (sdkError) {
        // Fallback to direct API if SDK fails
        responseText = await callGeminiAPI(prompt);
      }
      
      // Clean response
      let cleanedResponse = responseText.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const parsed = JSON.parse(cleanedResponse);
      
      return {
        success: true,
        isApproved: parsed.isApproved,
        confidence: parsed.confidence || 0,
        issues: parsed.issues || [],
        reason: parsed.reason || 'No issues found',
        category: parsed.category || 'SAFE'
      };
    } catch (error) {
      console.error('Error moderating content:', error);
      // Fail-safe: Don't auto-approve if moderation fails
      return {
        success: false,
        isApproved: false,
        confidence: 0,
        issues: ['Moderation check failed'],
        reason: 'Unable to verify content safety',
        category: 'ERROR'
      };
    }
  },

  /**
   * Comprehensive check for auto-approval
   */
  async checkAutoApprovalEligibility(update) {
    const moderation = await this.moderateContent(update.content);
    
    // Strict criteria for auto-approval
    const isEligible = 
      moderation.success &&
      moderation.isApproved &&
      moderation.confidence >= 85 && // High confidence required
      moderation.category === 'SAFE' &&
      moderation.issues.length === 0;
    
    return {
      eligible: isEligible,
      moderation: moderation,
      message: isEligible 
        ? 'Content passed all safety checks - eligible for auto-approval'
        : `Auto-approval blocked: ${moderation.reason}`
    };
  }
};
