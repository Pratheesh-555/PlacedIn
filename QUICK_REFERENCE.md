# QUICK REFERENCE - Keep Open During Interview

## FILES TO SHOW (In Order)

1. **src/utils/performanceMonitor.ts** - YOUR custom utility
2. **src/config/adminConfig.ts** - Cache system (5 min, two-tier)
3. **src/components/Experience/Experiences.tsx** - Debounce (300ms)
4. **server/index.js** - CORS (regex for mobile)
5. **server/utils/geminiHelper.js** - AI fallback (SDK → REST)

---

## KEY NUMBERS TO REMEMBER

- **5 minutes** - Admin cache duration
- **300ms** - Debounce delay
- **100ms** - Performance warning threshold
- **20 items** - Pagination per page
- **10 seconds** - API timeout
- **100+ companies** - Manually curated

---

## TALKING POINTS (30 seconds each)

### Performance Monitor
"Custom utility I built. Tracks API times. Warns if >100ms. Development only."

### Admin Cache
"5-minute cache reduces DB load. Two-tier: cache for speed, backend for accuracy."

### Debounced Search
"300ms delay prevents API spam. Tested multiple values. Cleanup prevents memory leaks."

### CORS Config
"Supports production (krishh.me), dev (localhost), and mobile (regex for IPs)."

### Gemini Fallback
"SDK sometimes fails. Falls back to REST API. Cleans markdown from response."

---

## IF ASKED "WHAT DID YOU WRITE?"

"I used AI for boilerplate, but I designed and implemented:
1. Admin caching system
2. Debounced search with cleanup
3. CORS for multi-environment
4. Performance monitoring utility
5. Company data curation (100+ companies)
6. AI fallback mechanism"

---

## IF ASKED "HOW WOULD YOU IMPROVE?"

1. React Query instead of manual fetch
2. Redis for distributed caching
3. WebSocket for real-time updates
4. Virtual scrolling for large lists
5. Comprehensive testing (Jest + Playwright)

---

## TECH STACK (Memorize)

**Frontend**: React 18, TypeScript, Vite, Tailwind
**Backend**: Node, Express, MongoDB, Mongoose
**AI**: Google Gemini 2.5 Flash
**Deploy**: Netlify (frontend), Render (backend)
**Auth**: Google OAuth 2.0

---

## PROJECT STORY (1 minute)

"As a student, I struggled to find authentic placement insights. PlacedIn solves this - students share detailed interview experiences, filtered by company and year. I added AI moderation to ensure quality and reduce admin burden. It's deployed at krishh.me and used by students at my college."

---

## CONFIDENCE LEVELS

**HIGH** (Lead with these):
- Admin caching
- Debounced search  
- Performance monitor
- CORS config

**MEDIUM** (Can explain):
- Gemini integration
- Pagination logic
- Company data

**LOW** (Be honest):
- Initial React setup
- Some UI components
- Schema design

---

## EMERGENCY PHRASES

- "Let me open that file to refresh..."
- "This was AI-assisted, but I understand the logic..."
- "Great question - let me think through trade-offs..."
- "I'd need to review exact syntax, but concept is..."

---

## BODY LANGUAGE

✅ Confident, not arrogant
✅ "Let me SHOW you" (open files)
✅ Explain reasoning ("I chose X because...")
✅ Honest about AI usage

❌ Don't claim you wrote everything
❌ Don't get defensive
❌ Don't say "I don't know" (say "Let me walk through...")

---

## LAST-MINUTE CHECKLIST

- [ ] Open VS Code to project
- [ ] Run `npm run dev` (verify it works)
- [ ] Have MY_CONTRIBUTIONS.md open in browser
- [ ] Practice navigating to 5 key files (30 sec each)
- [ ] Deep breath - you got this! 🚀
