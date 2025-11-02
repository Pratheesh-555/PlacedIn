# PlacedIn - Interview Preparation Guide

## 🎯 Project Overview
**PlacedIn** is an AI-powered campus placement experience sharing platform that enables students to share, discover, and learn from real placement experiences across various companies.

---

## 📊 Technical Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript 5.5.4
- **Build Tool**: Vite 5.4.2 (Fast, modern bundler)
- **Styling**: Tailwind CSS 3.4.16
- **Routing**: React Router DOM 6.27.0
- **Authentication**: Google OAuth 2.0 (@react-oauth/google)
- **HTTP Client**: Axios 1.7.7
- **Rich Text**: Quill 2.0.2 (WYSIWYG editor)
- **Deployment**: Netlify

### **Backend**
- **Runtime**: Node.js with Express 4.19.2
- **Database**: MongoDB with Mongoose 8.16.5
- **Authentication**: JWT (jsonwebtoken 9.0.2), Google OAuth
- **AI Integration**: Google Gemini 2.5 Flash API (@google/generative-ai 0.21.0)
- **File Upload**: Multer 1.4.5-lts.1
- **Security**: CORS, Helmet, Express Rate Limit
- **Scheduled Jobs**: Node-cron 3.0.3
- **Deployment**: Render

---

## 🏗️ Architecture

### **Frontend Structure** (35 files)
```
src/
├── components/
│   ├── Admin/              # Admin dashboard & management
│   ├── Experience/         # Experience sharing features
│   ├── Home/              # Landing page & navigation
│   ├── RichTextArea/      # Text editor component
│   ├── ThemeToggle/       # Dark/Light mode
│   └── User/              # User profile & submissions
├── config/                # API & admin config
├── contexts/              # React Context (Theme)
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Text formatting & linkify utilities
```

### **Backend Structure** (13 core files)
```
server/
├── config/                # Admin configuration
├── jobs/                  # Scheduled jobs (auto-approval)
├── middleware/            # Rate limiting middleware
├── models/                # Mongoose schemas (User, Experience, Update, Admin)
├── routes/                # API endpoints (4 route files)
├── scripts/               # Database migration & admin initialization
└── utils/                 # Gemini AI helper functions
```

---

## 🚀 Key Features

### **1. Experience Sharing**
- Students can post placement experiences with company details
- Rich text editor for detailed content
- Company selector with 100+ pre-loaded companies
- Upvote/Downvote system for quality filtering
- Status: Pending → Approved → Published

### **2. AI-Powered Moderation** (Gemini 2.5 Flash)
- **Content Moderation**: Checks for inappropriate content
- **Relevance Checking**: Verifies placement-related content
- **Auto-Summarization**: Generates experience summaries
- **Smart Updates**: AI-generated campus placement news

### **3. Admin Dashboard**
- Experience approval/rejection workflow
- Admin role management (Super Admin, Admin, Moderator)
- Bulk actions support
- Update management system

### **4. User Features**
- Google OAuth authentication
- Personal dashboard
- Track submitted experiences
- View approval status
- Edit/Delete own submissions

### **5. Smart Features**
- **Auto-Approval Job**: Cron job runs every 6 hours to auto-approve high-quality content (5+ upvotes, 0 downvotes)
- **Rate Limiting**: Prevents spam (15 requests/15 minutes)
- **Theme Toggle**: Dark/Light mode with persistent preference
- **Responsive Design**: Mobile-first approach

---

## 🔑 API Endpoints

### **Experiences** (`/api/experiences`)
- `GET /` - Fetch all approved experiences (with pagination)
- `POST /` - Submit new experience
- `PUT /:id/vote` - Upvote/Downvote experience
- `GET /user/:userId` - Get user's experiences
- `DELETE /:id` - Delete experience

### **User Experiences** (`/api/user-experiences`)
- `GET /` - Get current user's submissions
- `PUT /:id` - Update experience
- `DELETE /:id` - Delete experience

### **Admin** (`/api/admin`)
- `GET /pending` - Get pending experiences
- `POST /approve/:id` - Approve experience
- `POST /reject/:id` - Reject experience
- `GET /admins` - List all admins
- `POST /admins` - Add new admin
- `DELETE /admins/:id` - Remove admin
- `PUT /admins/:id/role` - Update admin role

### **Updates** (`/api/updates`)
- `GET /` - Fetch all updates
- `POST /` - Create new update
- `PUT /:id` - Edit update
- `DELETE /:id` - Delete update

---

## 🧠 AI Integration Details

### **Gemini API Usage**
```javascript
// Content Moderation
moderationResult = {
  category: "SAFE" | "INAPPROPRIATE" | "SPAM",
  confidence: 0-100,
  explanation: "Reason for classification"
}

// Relevance Check
relevanceResult = {
  isRelevant: true | false,
  confidence: 0-100,
  explanation: "Relevance explanation"
}

// Auto-Summarization
summary: "AI-generated 2-3 sentence summary"
```

### **Moderation Thresholds**
- **Auto-Approve**: Confidence ≥ 85% + Category "SAFE"
- **Auto-Reject**: Category "INAPPROPRIATE" or "SPAM"
- **Manual Review**: Confidence < 85%

---

## 🗄️ Database Schema

### **User Model**
```javascript
{
  googleId: String (unique),
  email: String (required),
  name: String,
  profilePic: String,
  createdAt: Date
}
```

### **Experience Model**
```javascript
{
  companyName: String (required),
  role: String (required),
  ctc: String,
  experience: String (required, rich text),
  postedBy: { userId, email, name },
  upvotes/downvotes: [userId],
  status: "pending" | "approved" | "rejected",
  aiModeration: { category, confidence, explanation },
  summary: String (AI-generated),
  createdAt: Date
}
```

### **Update Model**
```javascript
{
  title: String,
  content: String,
  companyName: String,
  postedBy: { userId, email, name },
  createdAt: Date
}
```

### **Admin Model**
```javascript
{
  email: String (unique),
  role: "super-admin" | "admin" | "moderator",
  addedBy: userId,
  createdAt: Date
}
```

---

## 🔒 Security Features

1. **Authentication**
   - Google OAuth 2.0 integration
   - JWT token-based session management
   - Protected routes (frontend + backend)

2. **Authorization**
   - Role-based access control (Super Admin > Admin > Moderator)
   - Only post owners can edit/delete their content
   - Admin routes protected with middleware

3. **Rate Limiting**
   - 15 requests per 15 minutes per IP
   - Prevents spam and DDoS attacks

4. **Data Validation**
   - Mongoose schema validation
   - Required field checks
   - Email format validation

5. **AI Content Moderation**
   - Automatic filtering of inappropriate content
   - Spam detection
   - Relevance verification

---

## ⚡ Performance Optimizations

1. **Frontend**
   - Code splitting with Vite
   - Lazy loading of components
   - Efficient React re-renders with proper hooks
   - CSS optimization with Tailwind's purge

2. **Backend**
   - MongoDB indexing on frequently queried fields
   - Pagination for large data sets
   - Efficient Mongoose queries
   - Connection pooling

3. **Deployment**
   - CDN distribution via Netlify (frontend)
   - Serverless backend on Render
   - Environment-based configurations

---

## 🧪 Testing & Quality

### **Code Quality**
- ✅ TypeScript for type safety
- ✅ ESLint configuration
- ✅ No console.logs in production code
- ✅ Clean, modular code structure
- ✅ Consistent naming conventions

### **Production Readiness**
- ✅ Environment variables for secrets
- ✅ Error handling throughout
- ✅ Graceful fallbacks (e.g., AI API failures)
- ✅ CORS configuration
- ✅ Rate limiting enabled

---

## 📝 Key Files to Review Before Interview

### **Frontend**
1. `src/App.tsx` - Main app structure & routing
2. `src/components/Experience/Experiences.tsx` - Core experience listing
3. `src/components/Experience/PostExperience_NEW.tsx` - Experience submission form
4. `src/components/Admin/AdminDashboard.tsx` - Admin interface
5. `src/config/api.ts` - API base configuration

### **Backend**
1. `server/index.js` - Server setup, middleware, routes
2. `server/routes/experiences.js` - Experience CRUD operations
3. `server/routes/admin.js` - Admin operations
4. `server/utils/geminiHelper.js` - AI integration
5. `server/jobs/autoApprovalJob.js` - Scheduled job logic
6. `server/models/Experience.js` - Main data model

---

## 🎤 Interview Talking Points

### **Technical Decisions**

**Q: Why Vite over Create React App?**
- **A**: Faster build times (native ESM), better HMR, modern tooling, smaller bundle sizes

**Q: Why MongoDB over SQL?**
- **A**: Flexible schema for evolving requirements, easy JSON handling, horizontal scalability, rich text storage (experiences)

**Q: How does AI moderation work?**
- **A**: We use Gemini 2.5 Flash API with custom prompts to check content safety, relevance, and quality. Multi-tier confidence system ensures accurate moderation with manual review fallback.

**Q: How do you handle authentication?**
- **A**: Google OAuth 2.0 for user auth + JWT tokens for session management. Admin system uses email-based role assignment.

### **Challenges Solved**

1. **Rich Text Handling**
   - Implemented Quill editor with custom toolbar
   - HTML sanitization for security
   - Linkify utility for auto-linking URLs

2. **AI Integration**
   - Dual-mode API calls (SDK + direct HTTP fallback)
   - Retry logic for network failures
   - Cost optimization with targeted prompts

3. **Scalability**
   - Pagination for large datasets
   - Auto-approval job reduces admin workload
   - Rate limiting prevents abuse

4. **Deployment Issues**
   - Solved Netlify Rollup build errors (native binary issues)
   - Environment variable management across platforms
   - Database connection pooling

---

## 🚀 Deployment

### **Frontend (Netlify)**
- **Build Command**: `rm -rf node_modules package-lock.json && npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`

### **Backend (Render)**
- **Start Command**: `node index.js`
- **Auto-deploy**: Enabled on main branch push
- **Environment Variables**: MongoDB URI, JWT Secret, Gemini API Key, Google OAuth credentials

---

## 📊 Project Metrics

- **Total Files**: 35 (frontend) + 13 (backend core)
- **Lines of Code**: ~4,000+ (excluding dependencies)
- **API Endpoints**: 20+
- **Companies Database**: 100+ pre-loaded
- **AI Models Used**: Google Gemini 2.5 Flash
- **Deployment Time**: ~3 minutes (frontend), ~5 minutes (backend)

---

## 🎓 Learning Outcomes

1. **Full-Stack Development**: End-to-end MERN + TypeScript application
2. **AI/ML Integration**: Production-ready AI API implementation
3. **Authentication**: OAuth 2.0 + JWT implementation
4. **DevOps**: CI/CD with Netlify + Render
5. **Database Design**: MongoDB schema design & optimization
6. **Security**: Rate limiting, CORS, data validation
7. **Code Quality**: TypeScript, ESLint, clean code principles

---

## 🔗 Important Links

- **Frontend Repo**: [Your GitHub URL]
- **Backend Repo**: [Your GitHub URL]
- **Live Demo**: [Netlify URL]
- **API Base URL**: [Render URL]

---

## ⚙️ Local Setup

### **Frontend**
```bash
cd D:\Projects\PlacedIn
npm install
npm run dev  # Runs on localhost:5173
```

### **Backend**
```bash
cd D:\Projects\PlacedIn\server
npm install
node index.js  # Runs on localhost:5000
```

### **Environment Variables Required**
```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Backend (.env)
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=development
```

---

## 🎯 Future Enhancements (Good to Mention)

1. **Advanced Analytics**: Experience view tracking, popular companies dashboard
2. **Email Notifications**: Status updates, weekly digests
3. **Search & Filters**: Full-text search, advanced filtering
4. **Interview Prep Resources**: Company-wise interview questions
5. **Mobile App**: React Native version
6. **Social Features**: Comments, bookmarks, user profiles
7. **Gamification**: Points for quality contributions

---

## 📚 Additional Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **MongoDB Docs**: https://docs.mongodb.com
- **Google Gemini API**: https://ai.google.dev/docs
- **Tailwind CSS**: https://tailwindcss.com

---

**Last Updated**: November 2, 2025  
**Prepared for Interview**: [Your Name]

---

## ✅ Pre-Interview Checklist

- [ ] Review all key files listed above
- [ ] Test local setup (both frontend & backend)
- [ ] Check live deployments are working
- [ ] Review this guide thoroughly
- [ ] Prepare examples of challenges solved
- [ ] Practice explaining AI integration
- [ ] Be ready to discuss tech stack choices
- [ ] Have GitHub repo open for code walkthrough

**Good luck with your interview! 🚀**
