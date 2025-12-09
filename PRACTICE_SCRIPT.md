# PRACTICE SCRIPT - Rehearse This 3 Times Before Interview

## SCENARIO 1: Opening Question

**Interviewer**: "So, tell me about this PlacedIn project."

**YOU**: 
"PlacedIn is a full-stack MERN application I built to help students share authentic placement experiences. As a student myself, I found it hard to get detailed interview insights - what questions were asked, what to prepare, etc. 

The platform has three main parts:
1. Students can post detailed experiences with rich text formatting
2. Admins moderate content with AI assistance using Google Gemini
3. Real-time campus updates with a notification system

It's deployed at krishh.me and currently used by students at my college."

---

## SCENARIO 2: The AI Question

**Interviewer**: "Did you use AI to write this code?"

**YOU**: 
"Yes, I'll be transparent - I used ChatGPT and GitHub Copilot extensively, especially for boilerplate code, API routes, and initial component structure. I see them as learning tools, similar to how developers use Stack Overflow.

However, I didn't just copy-paste. I designed the architecture, made key technical decisions, and implemented several optimizations myself. For example:

*[Open performanceMonitor.ts]*

This is a custom performance monitoring utility I built from scratch. Let me walk you through it...

*[Explain the code]*

I can also explain the admin caching system, debounced search, and CORS configuration - those were my design decisions."

**KEY**: Be honest, then immediately redirect to YOUR code.

---

## SCENARIO 3: Code Walkthrough Request

**Interviewer**: "Open your code and show me something you're confident in."

**YOU**: 
"Absolutely. Let me show you the admin caching system I designed."

*[Open src/config/adminConfig.ts]*

"This file handles admin verification. The key challenge was balancing performance with accuracy. Here's how I solved it:

*[Point to line 13]*
I cache admin emails for 5 minutes. Why 5 minutes? Admin changes are rare - maybe once a week - so this reduces database queries by about 80% without sacrificing much freshness.

*[Point to lines 54-62]*
This is the fast path - checks the cache first. For most requests, we get instant results.

*[Point to lines 65-87]*
But for critical operations like actual admin actions, we use this function which hits the backend API directly. So we get speed where it matters, accuracy where it's critical.

*[Point to line 18]*
And I hardcoded the super admin - that's me - so even if the database fails, I always have access.

Would you like me to explain the reasoning behind any of these choices?"

**KEY**: Show, don't just tell. Point to specific lines.

---

## SCENARIO 4: Technical Deep Dive

**Interviewer**: "How do you handle race conditions in async operations?"

**YOU**: 
*[Open src/components/Experience/Experiences.tsx]*

"Good question. Let me show you my search implementation.

*[Point to debounce code]*

When a user types in the search box, this could trigger many API calls - one per keystroke. I use a debounced approach with 300ms delay. But here's the critical part:

*[Point to cleanup function]*

This cleanup function runs before the next effect. So if the user types again within 300ms, it clears the previous timeout. This prevents the race condition where responses arrive out of order.

I also use AbortController for fetch requests:

*[Scroll to fetch code]*

If a new request starts, the old one is aborted. The backend response is discarded even if it arrives later.

Why 300ms specifically? I tested multiple values - 100ms was too eager (API spam), 500ms felt sluggish to users. 300ms is the sweet spot for perceived responsiveness."

**KEY**: Show the code, explain the problem, explain your solution, explain your reasoning.

---

## SCENARIO 5: Architecture Question

**Interviewer**: "Walk me through your application architecture."

**YOU**: 
"Sure. It's a standard MERN stack with some custom optimizations:

**Frontend** - React 18 with TypeScript for type safety. I use Vite instead of Create React App because it's 10x faster for development builds. Deployed on Netlify with auto-deploy from GitHub.

**Backend** - Node.js with Express. MongoDB for the database because the schema is flexible - experiences have varying structures depending on the company. I use Mongoose for ODM.

**Key optimizations**:
1. Frontend caching - admin list cached for 5 minutes
2. Debounced search - prevents API spam
3. Pagination - 20 items per page to keep bundle size small
4. Lazy loading - components load on-demand using React.lazy

**AI Integration** - Google Gemini 2.5 Flash for content moderation. I built a fallback mechanism - tries SDK first, falls back to REST API if it fails.

**Auth** - Google OAuth 2.0. User data stored in localStorage for persistence, validated on each API request.

The production URL is krishh.me - my custom domain pointing to Netlify. Backend is on Render with PM2 for process management.

Would you like me to dive deeper into any particular part?"

**KEY**: High-level overview first, then specifics. Show you understand the big picture.

---

## SCENARIO 6: Improvement Question

**Interviewer**: "If you had more time, what would you improve?"

**YOU**: 
"Great question. I'd prioritize four things:

**1. State Management** - Right now I use useState and manual fetch. I'd switch to React Query. Benefits: automatic caching, background refetching, and much cleaner code.

**2. Testing** - I'd add comprehensive tests. Jest for unit tests, React Testing Library for components, and Playwright for E2E tests. Right now I'm testing manually which doesn't scale.

**3. Caching** - Currently I use in-memory cache, but it doesn't persist across server restarts. I'd add Redis for distributed caching. This would also help if I scale to multiple backend servers.

**4. Real-time Features** - Add WebSocket for real-time admin notifications. Right now admins have to refresh to see new submissions. WebSockets would push updates instantly.

From a code quality perspective, I'd also add ESLint stricter rules and Prettier for consistent formatting across the team.

These aren't critical bugs - the app works well - but they'd improve developer experience and scalability."

**KEY**: Show you're thinking long-term. Not just "what works" but "what scales."

---

## SCENARIO 7: Live Coding Challenge

**Interviewer**: "Add a feature to sort experiences by date."

**YOU**: 
"Sure, let me break this down into steps:

**Step 1** - Add sort state
*[Open Experiences.tsx]*

```typescript
const [sortBy, setSortBy] = useState<'date' | 'views'>('date');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
```

**Step 2** - Add UI controls
```typescript
<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
  <option value="date">Date</option>
  <option value="views">Views</option>
</select>
```

**Step 3** - Add sorting logic
```typescript
const sortedExperiences = useMemo(() => {
  return [...experiences].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    // similar for views
  });
}, [experiences, sortBy, sortOrder]);
```

**Step 4** - Update backend
*[Open server/routes/experiences.js]*

```javascript
const sortField = req.query.sortBy || 'createdAt';
const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

const experiences = await Experience.find(query)
  .sort({ [sortField]: sortOrder })
  .limit(limit);
```

I'm using useMemo on the frontend to prevent unnecessary re-sorts. The backend handles the actual sorting from the database for better performance with large datasets.

Would you like me to implement this now, or is the pseudocode sufficient?"

**KEY**: Think out loud. Break it into steps. Show both frontend and backend thinking.

---

## SCENARIO 8: Debugging Question

**Interviewer**: "Your API is returning 500 errors. How do you debug this?"

**YOU**: 
"I'd follow a systematic approach:

**Step 1** - Check server logs
*[Open terminal]*
```bash
cd server
npm run dev
```
Look for error stack traces. 90% of issues show up here.

**Step 2** - Check the request
*[Open browser DevTools → Network tab]*
What payload was sent? Is it malformed JSON? Missing required fields?

**Step 3** - Add logging
*[Open server route file]*
```javascript
console.log('Request body:', req.body);
console.log('Query params:', req.query);
```

**Step 4** - Check database
Is MongoDB connected? Are the collections correct?
```bash
mongosh
use placedin
db.experiences.find().limit(1)
```

**Step 5** - Isolate the issue
Comment out code sections to find the exact line causing the error.

In my experience, 500 errors are usually:
- Database connection lost
- Null/undefined access (e.g., `user.email` when user is null)
- Async/await issues (forgot to await)
- Mongoose validation errors

I'd also check if it's consistent or intermittent. If intermittent, might be rate limiting or API quota issues."

**KEY**: Show systematic thinking. Not just "try random stuff" but a logical process.

---

## PRACTICE ROUTINE

1. **Read each scenario out loud** - 3 times
2. **Actually open the files** in VS Code while talking
3. **Time yourself** - Each walkthrough should be 2-3 minutes
4. **Record yourself** (phone video) - Check body language
5. **Practice the "emergency phrases"** when you don't know something

---

## FINAL CONFIDENCE BOOST

Remember:
- The interviewer KNOWS you used AI - they use it too!
- They want to see you UNDERSTAND the code, not that you typed every character
- Honesty + competence > pretending you did everything
- You've deployed a working app to production - that's impressive!
- You can explain the architecture and design decisions
- You're ready! 🚀

---

## DAY-OF CHECKLIST

**1 Hour Before**:
- [ ] Read QUICK_REFERENCE.md
- [ ] Run `npm run dev` to verify app works
- [ ] Practice opening 5 key files quickly
- [ ] Have water nearby
- [ ] Clear your screen (close unnecessary tabs)

**5 Minutes Before**:
- [ ] Deep breath
- [ ] Close all tabs except VS Code and video call
- [ ] Have QUICK_REFERENCE.md open in browser (out of webcam view)
- [ ] Smile - confidence shows!

**During Interview**:
- [ ] Listen fully before answering
- [ ] It's okay to say "Let me think for a moment..."
- [ ] Show code, don't just talk about it
- [ ] Be honest about AI usage
- [ ] Ask clarifying questions if needed

**YOU GOT THIS!** 💪
