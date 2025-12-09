# ROUND 2 TECHNICAL INTERVIEW - PREPARATION SCRIPT
**Interview Date: [Next Round]**
**Company: [Interviewer's Company]**

---

## OPENING STATEMENT (If asked about AI usage)

**Script:**
"I want to be transparent - I used AI tools like ChatGPT and GitHub Copilot throughout this project, similar to how developers use Stack Overflow or documentation. I see them as learning accelerators.

However, I didn't just copy-paste. I designed the architecture, made key technical decisions, and implemented several optimizations myself. Let me show you the parts I'm most confident in."

---

## CODE WALKTHROUGH PLAN (5-10 minutes)

### 1. Start with Performance Monitor (YOUR custom code)
**File**: `src/utils/performanceMonitor.ts`

**What to say**:
"This is a custom utility I built to track API response times and component render performance. Let me explain the design..."

**Walk through**:
- Line 13: Singleton pattern - why? (Global access, one instance)
- Line 21-26: `start()` method - stores timestamp
- Line 33-48: `end()` method - calculates duration, warns if > 100ms
- Why 100ms? Industry standard for "fast" UX

**Expected questions**:
- Q: "Why singleton?" 
  - A: "Need global access across components, avoid multiple instances"
- Q: "Why 100ms threshold?"
  - A: "Research shows users perceive <100ms as instant"

---

### 2. Admin Caching System
**File**: `src/config/adminConfig.ts`

**What to say**:
"This is my admin verification system. I designed it with a two-tier cache to balance performance and accuracy."

**Walk through**:
- Line 13: 5-minute cache - explain reasoning
- Line 18-21: Super admin hardcoded - why?
- Line 24-42: `fetchAdminList()` - cache invalidation strategy
- Line 54-62: `isAdminEmail()` - fast cache check
- Line 65-87: `checkAdminStatus()` - accurate backend check

**Expected questions**:
- Q: "Why 5 minutes?"
  - A: "Admins rarely change, so 5 min reduces DB load. If urgent, we have force refresh."
- Q: "What if cache is stale?"
  - A: "Critical operations use checkAdminStatus() which hits the backend"

---

### 3. Debounced Search
**File**: `src/components/Experience/Experiences.tsx` (Lines 27-35)

**What to say**:
"I implemented debounced search with cleanup to prevent API spam when users type."

**Walk through**:
- Line 28-31: setTimeout with 300ms delay
- Line 33: Cleanup function - prevents memory leaks
- Line 35: Dependency array - re-runs on searchInput change

**Expected questions**:
- Q: "Why 300ms?"
  - A: "I tested 100ms (too eager), 500ms (felt sluggish). 300ms is the sweet spot."
- Q: "What's the cleanup function for?"
  - A: "If user types again before 300ms, it clears the old timeout. Prevents stale updates."

---

### 4. CORS Configuration
**File**: `server/index.js` (Lines 24-38)

**What to say**:
"I configured CORS to support production, development, and mobile testing."

**Walk through**:
- Lines 26-28: My custom domain (krishh.me)
- Line 29: Localhost for dev
- Lines 33-35: Regex patterns for local network IPs

**Expected questions**:
- Q: "Why regex for IPs?"
  - A: "When testing on mobile, my local IP changes. Regex matches 192.168.x.x dynamically."
- Q: "Why credentials: true?"
  - A: "Needed for cookies and authentication headers"

---

### 5. Gemini AI Fallback
**File**: `server/utils/geminiHelper.js` (Lines 6-28, 45-60)

**What to say**:
"I built a fallback mechanism for the Gemini API because the SDK sometimes fails."

**Walk through**:
- Lines 6-28: Direct REST API call
- Lines 49-55: Try SDK first
- Lines 56-59: Catch error, fall back to REST
- Lines 63-64: Clean markdown from response

**Expected questions**:
- Q: "Why not just use SDK?"
  - A: "SDK has intermittent failures. REST API is more reliable."
- Q: "What's the cleaning for?"
  - A: "Gemini wraps JSON in ```json markers. I strip those for parsing."

---

## TECHNICAL DEEP-DIVE QUESTIONS (Prepare answers)

### Q: "Explain your caching strategy"
**A**: "I use in-memory caching with time-based invalidation. Admin list cached for 5 minutes to reduce DB load. For critical operations, I bypass cache and hit backend directly. Future improvement: Use Redis for distributed caching."

### Q: "How do you handle race conditions in async operations?"
**A**: "In my fetch logic, I use AbortController with timeout. If a new request starts, the old one is aborted. I also use useCallback to memoize functions and prevent unnecessary re-renders."

### Q: "What's your error handling strategy?"
**A**: "Three-tier: 
1. Try-catch for async operations
2. Fallback mechanisms (like Gemini SDK → REST)
3. User-friendly error messages (not raw server errors)"

### Q: "How would you optimize this for scale?"
**A**: 
- "Frontend: Implement virtual scrolling for large lists, use React.memo for expensive components"
- "Backend: Add Redis caching, database indexing on frequently queried fields (company, graduationYear)"
- "Infrastructure: CDN for static assets, load balancer for API servers"

### Q: "Explain your TypeScript usage"
**A**: "I use interfaces for type safety (Experience, GoogleUser, FilterOptions). Prevents runtime errors. Example: If I try to access experience.companyName (doesn't exist), TypeScript catches it at compile time."

### Q: "What would you change if you rebuilt this?"
**A**:
1. "Use React Query for API state management instead of manual fetch + useState"
2. "Server-side pagination instead of loading all data"
3. "Implement WebSocket for real-time admin notifications"
4. "Add comprehensive unit tests (Jest) and E2E tests (Playwright)"

---

## IF THEY ASK TO MODIFY CODE LIVE

### Scenario 1: "Add a feature to filter by salary range"

**Steps**:
1. Open `src/types/index.ts` - add salary fields to Experience interface
2. Open `src/components/Experience/Experiences.tsx` - add salary inputs to filters
3. Open `server/routes/experiences.js` - add salary query params
4. Explain: "I'd add min/max salary to filters state, update UI with two number inputs, and pass to backend as query params"

**Code**:
```typescript
// types/index.ts
export interface Experience {
  // ... existing fields
  salary?: {
    min: number;
    max: number;
  };
}

// Experiences.tsx
const [filters, setFilters] = useState({
  // ... existing filters
  salaryMin: '',
  salaryMax: ''
});

// Add to query params
if (filters.salaryMin) params.append('salaryMin', filters.salaryMin);
if (filters.salaryMax) params.append('salaryMax', filters.salaryMax);
```

### Scenario 2: "Optimize this component for performance"

**Steps**:
1. Identify expensive operations (filters, search)
2. Add React.memo for child components
3. Use useMemo for filtered results
4. Explain: "I'd wrap expensive computations in useMemo and child components in React.memo"

**Code**:
```typescript
// Memoize filtered results
const filteredExperiences = useMemo(() => {
  return experiences.filter(exp => {
    // filtering logic
  });
}, [experiences, filters]);

// Wrap child component
const ExperienceCard = React.memo(({ experience }) => {
  // component logic
});
```

---

## BODY LANGUAGE & DELIVERY

✅ **DO**:
- Speak clearly and confidently about YOUR parts
- Say "Let me show you" and open the file
- Explain your reasoning ("I chose 300ms because...")
- Admit when AI helped ("AI generated the boilerplate, I customized the logic")

❌ **DON'T**:
- Claim you wrote everything
- Get defensive about AI usage
- Fumble through code you don't understand
- Say "I don't know" - say "Let me walk through this to recall..."

---

## FINAL CHECKLIST

Before Round 2:
- [ ] Review MY_CONTRIBUTIONS.md
- [ ] Practice explaining each file (15 min each)
- [ ] Open VS Code, navigate to files quickly
- [ ] Prepare 1-2 "improvements" you'd make
- [ ] Test running the app (npm run dev)
- [ ] Have a story for "Why this project?" 

**Your Story**:
"As a student, I experienced the struggle of finding authentic placement insights. Seniors don't share experiences systematically. I built PlacedIn to solve this - a platform where students can share detailed interview experiences, filtered by company and year. I added AI moderation to ensure quality and reduce admin burden. It's now used by students at my college."

---

## TIME MANAGEMENT

- **Opening statement**: 1 min
- **Code walkthrough**: 8-10 min (2 min per file)
- **Questions**: 10-15 min
- **Live coding**: 10-15 min (if asked)

**Total**: 30-40 min interview

---

## EMERGENCY PHRASES

If stuck:
- "Let me navigate to that file to refresh my memory..."
- "This part was more AI-assisted, but I understand it works by..."
- "I'd need to review the exact implementation, but the concept is..."
- "That's a great question - let me think through the trade-offs..."

---

## CONFIDENCE BOOSTERS

Remember:
1. You INTEGRATED multiple technologies (React, Node, MongoDB, Gemini AI)
2. You DEPLOYED to production (Netlify + custom domain)
3. You UNDERSTAND the architecture even if AI wrote boilerplate
4. You've USED the app and know the user flow
5. You're HONEST about AI usage (shows integrity)

**You got this! 🚀**
