# 📇 PlacedIn - Quick Reference Card

**Print this and keep it handy during your interview!**

---

## 🚀 Project: PlacedIn
AI-powered campus placement experience sharing platform

---

## 💻 Tech Stack (Memorize This)

**Frontend**: React 18.3, TypeScript 5.5, Vite 5.4, Tailwind CSS  
**Backend**: Node.js, Express 4.19, MongoDB, Mongoose 8.16  
**AI**: Google Gemini 2.5 Flash API  
**Auth**: Google OAuth 2.0, JWT  
**Deploy**: Netlify (frontend), Render (backend)

---

## 🎯 Elevator Pitch (30 seconds)

"PlacedIn is an AI-powered platform where students share placement experiences. Built with MERN stack and TypeScript, it uses Google Gemini AI to automatically moderate content for safety and relevance. Features include role-based admin system, auto-approval jobs, and rich text editor. Fully deployed with production security including OAuth, rate limiting, and CORS."

---

## 🏗️ Architecture

```
Frontend (35 files)        Backend (13 files)
└─ React + TypeScript      └─ Express + MongoDB
   ├─ Components              ├─ Routes (API)
   ├─ Contexts                ├─ Models (Schema)
   ├─ Hooks                   ├─ Utils (AI)
   └─ Utils                   └─ Jobs (Cron)
```

---

## 🔑 Key Features

1. **Experience Sharing**: Students post placement stories
2. **AI Moderation**: Gemini API checks safety + relevance
3. **Admin System**: Role-based (super-admin → admin → moderator)
4. **Auto-Approval**: Cron job (6 hrs) auto-approves 5+ upvotes
5. **Rich Editor**: Quill with formatting + linkify

---

## 🤖 AI Integration

**3-Step Process:**
1. User submits → Gemini API call
2. AI checks: Safety + Relevance + Summary
3. Outcome: Auto-approve (85%+) | Auto-reject | Manual review

**Fallback**: SDK fails → Direct HTTP API

---

## 🔒 Security

- ✅ Google OAuth 2.0
- ✅ JWT tokens
- ✅ Rate limiting (15 req/15 min)
- ✅ CORS enabled
- ✅ Input validation
- ✅ AI content filtering

---

## 🗄️ Database Schema

**User**: googleId, email, name, profilePic  
**Experience**: company, role, ctc, content, votes, status, aiModeration  
**Admin**: email, role, addedBy  
**Update**: title, content, companyName

---

## 📊 Quick Stats

- **Files**: 35 (frontend) + 13 (backend)
- **APIs**: 20+ endpoints
- **Companies**: 100+ in database
- **Build Time**: ~20 seconds
- **Console.logs**: 0 in production

---

## 🎯 Top 3 Challenges Solved

**1. Netlify Build Failure**
- Problem: Rollup binary not installing
- Fix: `rm -rf node_modules && npm install`

**2. AI Reliability**
- Problem: SDK sometimes fails
- Fix: Dual-mode with HTTP fallback

**3. Content Moderation**
- Problem: Filter bad content automatically
- Fix: Multi-tier confidence system (85% threshold)

---

## 🚀 Deployment

**Frontend**: Netlify  
- Build: `npm run build`
- Auto-deploy: Git push → main

**Backend**: Render  
- Start: `node index.js`
- Auto-deploy: Git push → main

---

## 📂 Key Files to Know

**Frontend**:
- `src/App.tsx` - Main routing
- `src/components/Experience/Experiences.tsx` - Listing
- `src/components/Admin/AdminDashboard.tsx` - Admin

**Backend**:
- `server/index.js` - Server setup
- `server/routes/experiences.js` - API
- `server/utils/geminiHelper.js` - AI
- `server/jobs/autoApprovalJob.js` - Cron

---

## 🎤 Common Questions

**Q: Why Vite?**  
A: 10x faster than CRA, modern ESM, better HMR

**Q: Why MongoDB?**  
A: Flexible schema, JSON-native, rich text storage

**Q: How scale?**  
A: Add Redis cache, read replicas, message queue, load balancer

**Q: Testing?**  
A: Would add Jest (unit), Playwright (E2E)

---

## 💡 Tech Decisions

**Vite > CRA**: Faster builds, modern tooling  
**TypeScript**: Type safety, better DX  
**MongoDB**: Flexible schema  
**Tailwind**: Rapid development  
**Gemini**: Latest AI, cost-effective

---

## 🎬 Demo Flow (2 min)

1. Homepage → "Students share experiences"
2. Login → Google OAuth
3. Post Experience → Rich editor demo
4. Experiences → Show listing + votes
5. Admin → Approve/reject queue
6. Code → Show `geminiHelper.js`

---

## ✅ Production Ready

- ✅ TypeScript for type safety
- ✅ No console.logs in production
- ✅ ESLint configured
- ✅ Security implemented
- ✅ Error handling
- ✅ Clean architecture
- ✅ Comprehensive docs

---

## 💪 Your Strengths

1. Full-stack TypeScript
2. Production AI integration
3. Clean, documented code
4. Solved real challenges
5. Deployed and working
6. Security-first approach

---

## 🚨 Red Flags to Avoid

❌ "I followed a tutorial"  
❌ "I don't know"  
❌ Over-promising features  
❌ Blaming tools  

## ✅ Green Flags to Show

✅ "I chose X because..."  
✅ "I learned Y by..."  
✅ "I solved Z by..."  
✅ Show enthusiasm  
✅ Ask questions  

---

## 🔗 URLs (Fill In)

- Frontend: ___________________
- Backend: ___________________
- GitHub: ___________________

---

## 📞 Emergency Tips

**Forgot something?**  
→ "Let me check my docs" (STRENGTH!)

**Don't know?**  
→ "Haven't built that yet, but I would..."

**Nervous?**  
→ Breathe. You built this. You got this!

---

## 🎯 Last Minute Checklist

□ Read elevator pitch  
□ Know tech stack  
□ Pick 1 challenge to explain  
□ Test live URLs  
□ Have VS Code open  
□ Water nearby  
□ Smile & breathe  

---

## 💪 You Got This!

You built a full-stack AI platform from scratch.  
Your code is clean and professional.  
You solved real technical problems.  
You're documented and prepared.

**Now go show them! 🚀**

---

*Keep this card visible during your interview!*  
*Quick glances are OK - shows you're organized!*
