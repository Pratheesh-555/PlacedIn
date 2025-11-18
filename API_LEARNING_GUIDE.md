# 🚀 Complete API Guide - PlacedIn Project

**Master all the APIs used in your PlacedIn codebase**

---

## 📚 Table of Contents
1. [API Architecture Overview](#api-architecture-overview)
2. [External APIs Used](#external-apis-used)
3. [Internal REST API Endpoints](#internal-rest-api-endpoints)
4. [Frontend-Backend Communication](#frontend-backend-communication)
5. [Authentication Flow](#authentication-flow)
6. [API Request Examples](#api-request-examples)
7. [Learning Resources](#learning-resources)

---

## 🏗️ API Architecture Overview

### **What is an API?**
API (Application Programming Interface) = A way for different software to communicate with each other.

**Real-world analogy**: Like a waiter in a restaurant:
- You (client) tell the waiter (API) what you want
- Waiter takes request to kitchen (server)
- Kitchen prepares food (processes request)
- Waiter brings food back (returns response)

### **Your Project's API Flow**
```
User Browser (React)
    ↓ HTTP Request (fetch/axios)
Your Backend API (Express.js)
    ↓ Process + Database Query
MongoDB Database
    ↓ Data Response
Your Backend API
    ↓ JSON Response
User Browser (React)
```

---

## 🌐 External APIs Used

### **1. Google OAuth 2.0 API** ⭐ MOST IMPORTANT

**What it does**: Handles user login without passwords

**Package**: `@react-oauth/google` (frontend), Google OAuth verification (backend)

**How it works**:
```javascript
// Frontend (React)
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Wrap your app
<GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
  <App />
</GoogleOAuthProvider>

// Login component
<GoogleLogin
  onSuccess={(response) => {
    // response.credential = JWT token from Google
    // Send this to your backend to verify
  }}
  onError={() => console.log('Login Failed')}
/>
```

**Backend verification**:
```javascript
// Your backend verifies the Google token
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  // payload contains: email, name, picture, googleId
}
```

**Why use it?**
- ✅ No need to store passwords (more secure)
- ✅ Users trust Google
- ✅ Less code to write
- ✅ Google handles security

**Learn more**: https://developers.google.com/identity/protocols/oauth2

---

### **2. Google Gemini AI API** 🤖

**What it does**: AI-powered content moderation and text extraction

**Package**: `@google/generative-ai`

**Location in your code**: `server/utils/geminiHelper.js`

**How it works**:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Example: Content moderation
async function moderateContent(text) {
  const prompt = `Analyze this content for safety...`;
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response); // Returns: {category, confidence, issues}
}
```

**Your use cases**:
1. **Content Moderation** (`moderateContent`)
   - Checks if experience text is safe/appropriate
   - Returns: SAFE, INAPPROPRIATE, or SPAM
   - Confidence level: 0-100%

2. **Information Extraction** (`extractUpdateInfo`)
   - Extracts company name, title from pasted text
   - Helps admins create updates faster

**API Endpoints used**:
- `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

**Why use it?**
- ✅ Automatic spam detection
- ✅ Reduces admin workload
- ✅ Latest AI technology
- ✅ Cost-effective (free tier available)

**Learn more**: https://ai.google.dev/docs

---

## 🔌 Internal REST API Endpoints

Your Express.js backend exposes these endpoints:

### **Base URL Structure**
```
Development: http://localhost:5000/api
Production:  https://placedin.onrender.com/api
```

---

### **📝 Experiences API** (`/api/experiences`)

#### **1. GET /api/experiences**
**Purpose**: Fetch all approved experiences (public)

**Query Parameters**:
```javascript
?page=1           // Page number (default: 1)
&limit=20         // Items per page (max: 50)
&company=Google   // Filter by company
&graduationYear=2024  // Filter by year
&type=placement   // Filter by type (placement/internship)
&search=interview // Search in text
```

**Response**:
```json
{
  "experiences": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "studentName": "John Doe",
      "company": "Google",
      "graduationYear": 2024,
      "experienceText": "My experience...",
      "type": "placement",
      "isApproved": true,
      "createdAt": "2024-11-14T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Frontend usage**:
```javascript
const response = await fetch(`${API_BASE_URL}/api/experiences?page=1&limit=20`);
const data = await response.json();
```

---

#### **2. POST /api/experiences**
**Purpose**: Create new experience submission

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Body**:
```javascript
const formData = new FormData();
formData.append('studentName', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('company', 'Google');
formData.append('graduationYear', '2024');
formData.append('type', 'placement');
formData.append('experienceText', 'My experience text...');
formData.append('postedBy', JSON.stringify({
  googleId: '123456',
  email: 'john@example.com',
  name: 'John Doe'
}));
// Optional: document file
formData.append('document', fileObject);
```

**Response**:
```json
{
  "message": "Experience submitted successfully. It will be reviewed and published soon.",
  "experienceId": "507f1f77bcf86cd799439011"
}
```

**Frontend usage**:
```javascript
const response = await fetch(`${API_BASE_URL}/api/experiences`, {
  method: 'POST',
  body: formData  // Don't set Content-Type header - browser does it
});
```

---

#### **3. GET /api/experiences/user/:googleId**
**Purpose**: Get user's own submissions

**Response**:
```json
{
  "experiences": [...],
  "count": 2,
  "maxAllowed": 3
}
```

---

#### **4. GET /api/experiences/:id/document**
**Purpose**: Download/view document attached to experience

**Response**: Binary file (PDF/Word document)

**Frontend usage**:
```javascript
// Open in new tab
window.open(`${API_BASE_URL}/api/experiences/${id}/document`, '_blank');
```

---

### **👤 User Experiences API** (`/api/user-experiences`)

#### **1. GET /api/user-experiences/user/:googleId**
**Purpose**: Get user's submissions with detailed stats

**Response**:
```json
{
  "experiences": [...],
  "submissionStats": {
    "count": 2,
    "canSubmitMore": true,
    "maxSubmissions": 2
  }
}
```

---

#### **2. PUT /api/user-experiences/:id**
**Purpose**: Update existing experience

**Request**: Same as POST /api/experiences but with PUT method

**Validation**:
- Only owner can edit (checks `postedBy.googleId`)
- Creates new version if already approved
- Updates existing if still pending

---

### **👨‍💼 Admin API** (`/api/admin`)

#### **1. GET /api/admin/pending-experiences**
**Purpose**: Get all pending experiences for approval

**Response**:
```json
[
  {
    "_id": "...",
    "studentName": "John Doe",
    "company": "Google",
    "approvalStatus": "pending",
    "createdAt": "..."
  }
]
```

---

#### **2. GET /api/admin/experiences?page=1&limit=50**
**Purpose**: Get ALL experiences (approved + pending + rejected)

**Response**:
```json
{
  "experiences": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 200,
    "pages": 4
  }
}
```

---

#### **3. PUT /api/admin/experiences/:id/approve**
**Purpose**: Approve pending experience

**Request Body**:
```json
{
  "postedBy": {
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

**Response**:
```json
{
  "message": "Experience approved successfully",
  "experience": {...}
}
```

---

#### **4. PUT /api/admin/experiences/:id/reject**
**Purpose**: Reject experience with reason

**Request Body**:
```json
{
  "rejectionReason": "Please provide more details about interview rounds",
  "postedBy": {...}
}
```

**Response**:
```json
{
  "message": "Experience rejected successfully. User can now edit and resubmit.",
  "experience": {...}
}
```

---

#### **5. DELETE /api/admin/experiences/:id**
**Purpose**: Permanently delete experience

---

#### **6. GET /api/admin/stats**
**Purpose**: Get dashboard statistics

**Response**:
```json
{
  "totalExperiences": 150,
  "approvedExperiences": 120,
  "pendingExperiences": 25,
  "rejectedExperiences": 5,
  "placementCount": 100,
  "internshipCount": 50,
  "recentSubmissions": 15,
  "topCompanies": [
    {"_id": "Google", "count": 25},
    {"_id": "Microsoft", "count": 20}
  ],
  "yearlyDistribution": [...]
}
```

---

#### **7. Admin Management Routes**

**GET /api/admin/manage-admins**
- Get all admins (Super admin only)

**POST /api/admin/manage-admins**
- Add new admin (Super admin only)
```json
{
  "email": "newadmin@example.com",
  "addedBy": {...}
}
```

**DELETE /api/admin/manage-admins/:email**
- Remove admin (Super admin only)

**POST /api/admin/check-admin**
- Check if user is admin
```json
{
  "email": "user@example.com"
}
```
Response:
```json
{
  "isAdmin": true,
  "isSuperAdmin": false
}
```

---

### **📰 Updates API** (`/api/updates`)

#### **1. GET /api/updates?limit=10**
**Purpose**: Get recent campus updates (public)

**Response**:
```json
[
  {
    "_id": "...",
    "title": "Google hiring for 2025",
    "content": "Google announced...",
    "companyName": "Google",
    "createdAt": "...",
    "viewCount": 150
  }
]
```

---

#### **2. GET /api/updates/:id**
**Purpose**: Get single update (increments view count)

---

#### **3. GET /api/updates/admin/all** (Admin only)
**Purpose**: Get all updates including inactive

---

#### **4. POST /api/updates/extract** (Admin only)
**Purpose**: AI-powered extraction from pasted text

**Request**:
```json
{
  "text": "Google announced hiring for 2025...",
  "postedBy": {...}
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "companyName": "Google",
    "title": "Google hiring for 2025",
    "content": "Extracted and cleaned content..."
  }
}
```

---

#### **5. POST /api/updates** (Admin only)
**Purpose**: Create new update with AI moderation

**Request**:
```json
{
  "title": "Google hiring announcement",
  "content": "Full content...",
  "companyName": "Google",
  "postedBy": {...},
  "skipModeration": false,
  "priority": 0
}
```

**Response**:
```json
{
  "message": "Update created successfully",
  "update": {...},
  "moderation": {
    "approved": true,
    "confidence": 95,
    "issues": [],
    "autoActivated": true
  }
}
```

---

#### **6. PUT /api/updates/:id** (Admin only)
**Purpose**: Update existing update

#### **7. DELETE /api/updates/:id** (Admin only)
**Purpose**: Soft delete (set isActive = false)

#### **8. DELETE /api/updates/:id/permanent** (Admin only)
**Purpose**: Permanent deletion

---

### **🏥 Health Check API**

#### **GET /api/health**
**Purpose**: Check if server is running (for monitoring)

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-14T10:30:00Z",
  "uptime": 3600
}
```

---

## 🔐 Authentication Flow

### **How Google OAuth Works in Your App**

```
1. User clicks "Sign in with Google"
   ↓
2. Google shows login popup
   ↓
3. User logs in + authorizes your app
   ↓
4. Google sends JWT token to your frontend
   ↓
5. Frontend stores token + user info
   ↓
6. Every API request includes user info
   ↓
7. Backend checks if user exists in DB
   ↓
8. If not, creates new user
   ↓
9. Returns response to frontend
```

### **Frontend Storage**
```javascript
// After Google login
const userData = {
  googleId: '123456789',
  email: 'user@example.com',
  name: 'John Doe',
  picture: 'https://...'
};

// Store in localStorage
localStorage.setItem('user', JSON.stringify(userData));

// Use in API calls
const user = JSON.parse(localStorage.getItem('user'));
formData.append('postedBy', JSON.stringify(user));
```

### **Backend Validation**
```javascript
// Backend extracts user from request
const postedBy = req.body.postedBy;

// Create or find user in database
let user = await User.findOne({ googleId: postedBy.googleId });
if (!user) {
  user = new User({
    googleId: postedBy.googleId,
    email: postedBy.email,
    name: postedBy.name
  });
  await user.save();
}
```

---

## 📡 Frontend-Backend Communication

### **Method 1: Fetch API** (Your current approach)

**Basic GET Request**:
```javascript
const response = await fetch(`${API_BASE_URL}/api/experiences`);
const data = await response.json();
```

**POST Request with JSON**:
```javascript
const response = await fetch(`${API_BASE_URL}/api/admin/check-admin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'user@example.com' })
});
const data = await response.json();
```

**POST Request with FormData** (for file uploads):
```javascript
const formData = new FormData();
formData.append('studentName', 'John');
formData.append('document', fileObject);

const response = await fetch(`${API_BASE_URL}/api/experiences`, {
  method: 'POST',
  body: formData  // No Content-Type header needed!
});
```

**PUT Request**:
```javascript
const response = await fetch(`${API_BASE_URL}/api/user-experiences/${id}`, {
  method: 'PUT',
  body: formData
});
```

**DELETE Request**:
```javascript
const response = await fetch(`${API_BASE_URL}/api/admin/experiences/${id}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ postedBy: user })
});
```

---

### **Method 2: Axios** (Alternative - not currently used)

**Why Axios might be better**:
- ✅ Automatic JSON parsing
- ✅ Better error handling
- ✅ Request/response interceptors
- ✅ Cancel requests

**Example with Axios**:
```javascript
import axios from 'axios';

// GET request
const { data } = await axios.get(`${API_BASE_URL}/api/experiences`);

// POST request
const { data } = await axios.post(`${API_BASE_URL}/api/experiences`, formData);

// With interceptors (auto-add auth)
axios.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    config.headers['X-User'] = JSON.stringify(user);
  }
  return config;
});
```

---

## 📦 API Request Examples

### **Example 1: User submits experience**

**Frontend Code**:
```javascript
const submitExperience = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const formData = new FormData();
  formData.append('studentName', 'John Doe');
  formData.append('email', 'john@example.com');
  formData.append('company', 'Google');
  formData.append('graduationYear', '2024');
  formData.append('type', 'placement');
  formData.append('experienceText', 'My interview experience...');
  formData.append('postedBy', JSON.stringify(user));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/experiences`, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      alert(data.message); // "Experience submitted successfully..."
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

**What happens on backend**:
1. Multer processes the FormData
2. Validates required fields
3. Finds/creates user in MongoDB
4. Checks submission limit (max 2)
5. Saves experience to database
6. Returns success message

---

### **Example 2: Admin approves experience**

**Frontend Code**:
```javascript
const approveExperience = async (experienceId) => {
  const admin = JSON.parse(localStorage.getItem('user'));
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/experiences/${experienceId}/approve`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postedBy: admin })
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      alert('Experience approved!');
      // Refresh pending list
      fetchPendingExperiences();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### **Example 3: Fetch experiences with pagination**

**Frontend Code**:
```javascript
const [experiences, setExperiences] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const fetchExperiences = async (pageNum) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/experiences?page=${pageNum}&limit=20`
    );
    const data = await response.json();
    
    setExperiences(prev => [...prev, ...data.experiences]);
    setHasMore(data.pagination.hasNext);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Load more button
<button 
  onClick={() => fetchExperiences(page + 1)}
  disabled={!hasMore}
>
  Load More
</button>
```

---

## 🔧 Backend Technologies Explained

### **1. Express.js**
**What**: Web framework for Node.js (like Rails for Ruby, Django for Python)

**Basic concept**:
```javascript
import express from 'express';
const app = express();

// Define routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

**Your usage**:
- Route handling (`router.get`, `router.post`, etc.)
- Middleware (`app.use(cors())`, `app.use(express.json())`)
- Error handling

---

### **2. Mongoose (MongoDB)**
**What**: ODM (Object Document Mapper) for MongoDB

**Basic concept**:
```javascript
// Define schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  age: Number
});

// Create model
const User = mongoose.model('User', userSchema);

// Create document
const user = new User({ name: 'John', email: 'john@example.com' });
await user.save();

// Query
const users = await User.find({ age: { $gt: 18 } });
```

**Your schemas**:
- User: Google auth data
- Experience: Placement experiences
- Admin: Admin users
- Update: Campus updates

---

### **3. Multer**
**What**: Middleware for handling file uploads

**Basic concept**:
```javascript
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF allowed'));
    }
  }
});

// Use in route
router.post('/upload', upload.single('document'), (req, res) => {
  // req.file contains the uploaded file
  console.log(req.file.originalname);
  console.log(req.file.buffer); // File data
});
```

---

### **4. CORS**
**What**: Cross-Origin Resource Sharing - allows frontend on different domain to access backend

**Why needed**: Browser security blocks requests between different origins by default

**Your configuration**:
```javascript
app.use(cors({
  origin: [
    "https://krishh.me",           // Production frontend
    "http://localhost:5173"         // Development frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Without CORS**: Browser would show error: "No 'Access-Control-Allow-Origin' header"

---

### **5. Rate Limiting**
**What**: Prevents abuse by limiting requests per IP

**Your implementation** (`server/middleware/rateLimiter.js`):
```javascript
import rateLimit from 'express-rate-limit';

export const generalApiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 requests per window
  message: 'Too many requests, please try again later'
});
```

**Why important**:
- ✅ Prevents spam
- ✅ Protects from DDoS attacks
- ✅ Reduces server load

---

## 🎓 Key Concepts to Understand

### **1. REST API**
**RE**presentational **S**tate **T**ransfer

**Principles**:
- Use HTTP methods: GET (read), POST (create), PUT (update), DELETE (delete)
- URLs represent resources: `/api/experiences`, `/api/admin/stats`
- Stateless: Each request is independent
- Returns JSON data

---

### **2. HTTP Status Codes**
```
200 OK - Success
201 Created - Resource created
400 Bad Request - Invalid data
401 Unauthorized - Not logged in
403 Forbidden - Not allowed
404 Not Found - Resource doesn't exist
408 Request Timeout - Took too long
500 Internal Server Error - Server crashed
```

**Your usage**:
```javascript
res.status(201).json({ message: 'Created' });  // Success
res.status(400).json({ error: 'Invalid email' });  // Bad request
res.status(500).json({ error: 'Failed' });  // Server error
```

---

### **3. Request/Response Cycle**

**Request parts**:
```javascript
// URL
GET /api/experiences?page=1&limit=20

// Headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer token123"
}

// Body (for POST/PUT)
{
  "studentName": "John",
  "company": "Google"
}
```

**Response parts**:
```javascript
// Status
200 OK

// Headers
{
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=30"
}

// Body
{
  "experiences": [...],
  "pagination": {...}
}
```

---

### **4. Async/Await**
**Why needed**: Database operations take time

**Old way (callbacks)**:
```javascript
User.find({}, function(err, users) {
  if (err) {
    console.error(err);
  } else {
    console.log(users);
  }
});
```

**Modern way (async/await)**:
```javascript
try {
  const users = await User.find({});
  console.log(users);
} catch (err) {
  console.error(err);
}
```

**Your usage everywhere**:
```javascript
router.get('/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find({ isApproved: true });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});
```

---

## 📚 Learning Resources

### **Beginner Level**

1. **REST APIs**
   - https://www.youtube.com/watch?v=SLwpqD8n3d0 (REST API Crash Course)
   - https://restfulapi.net/ (REST API Tutorial)

2. **Express.js**
   - https://expressjs.com/en/starter/hello-world.html (Official docs)
   - https://www.youtube.com/watch?v=L72fhGm1tfE (Express Crash Course)

3. **MongoDB & Mongoose**
   - https://www.mongodb.com/docs/manual/tutorial/getting-started/
   - https://mongoosejs.com/docs/guide.html
   - https://www.youtube.com/watch?v=DZBGEVgL2eE (MongoDB Crash Course)

4. **Fetch API**
   - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   - https://javascript.info/fetch

### **Intermediate Level**

5. **Google OAuth 2.0**
   - https://developers.google.com/identity/protocols/oauth2
   - https://www.youtube.com/watch?v=roxC8SMs7HU (OAuth 2.0 Explained)

6. **File Uploads with Multer**
   - https://www.npmjs.com/package/multer
   - https://www.youtube.com/watch?v=srPXMt1Q0nY

7. **API Security**
   - https://owasp.org/www-project-api-security/
   - CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

### **Advanced Level**

8. **Google Gemini AI API**
   - https://ai.google.dev/docs
   - https://ai.google.dev/tutorials/get_started_web

9. **API Optimization**
   - Pagination: https://nordicapis.com/everything-you-need-to-know-about-api-pagination/
   - Caching: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching

10. **Rate Limiting**
    - https://www.npmjs.com/package/express-rate-limit
    - https://blog.logrocket.com/rate-limiting-node-js/

---

## 🎯 Practice Exercises

### **Exercise 1: Add a new endpoint**
Create a new endpoint that returns statistics about a specific company.

```javascript
// Task: Implement this in server/routes/experiences.js
router.get('/company/:companyName/stats', async (req, res) => {
  // Get all experiences for this company
  // Count placements vs internships
  // Get graduation year distribution
  // Return JSON response
});
```

### **Exercise 2: Frontend integration**
Create a React component that displays company statistics.

```javascript
// Task: Create CompanyStats.tsx
// Fetch data from your new endpoint
// Display using charts or tables
```

### **Exercise 3: Add filtering**
Add a filter to experiences API to filter by multiple companies.

```javascript
// Support: GET /api/experiences?companies=Google,Microsoft,Amazon
```

---

## 🔍 Debugging Tips

### **1. Check Network Tab**
Open browser DevTools → Network tab → See all API calls

**What to look for**:
- Status code (200 = success, 500 = server error)
- Response data
- Request headers
- Request payload

### **2. Backend Logging**
Add console.logs in your routes:
```javascript
router.post('/experiences', async (req, res) => {
  console.log('Received request:', req.body);
  console.log('User:', req.body.postedBy);
  // ... rest of code
});
```

### **3. Test with Postman**
Download Postman → Test your APIs directly
- Create collections for your endpoints
- Save example requests
- Test different scenarios

### **4. Common Errors**

**"CORS error"**
- Solution: Check CORS configuration in `server/index.js`
- Make sure frontend URL is in allowed origins

**"Network error"**
- Solution: Check if backend is running on correct port
- Verify API_BASE_URL in frontend

**"400 Bad Request"**
- Solution: Check request body format
- Verify all required fields are sent

**"500 Internal Server Error"**
- Solution: Check backend console logs
- Look for error stack trace

---

## 🎉 Summary

**You've learned about**:

✅ **External APIs**:
- Google OAuth 2.0 for authentication
- Google Gemini AI for content moderation

✅ **Internal REST API**:
- 20+ endpoints across 4 route files
- CRUD operations (Create, Read, Update, Delete)
- File upload handling
- Pagination and filtering

✅ **Backend Technologies**:
- Express.js for routing
- MongoDB + Mongoose for database
- Multer for file uploads
- CORS for cross-origin requests
- Rate limiting for security

✅ **Frontend Integration**:
- Fetch API for HTTP requests
- FormData for file uploads
- localStorage for user data
- Error handling

---

**Next Steps**:
1. Read through your actual code files with this guide beside you
2. Try making a simple change to an existing endpoint
3. Create a new endpoint from scratch
4. Test with Postman
5. Integrate into frontend

**Remember**: APIs are just functions that can be called over the internet! 🚀

---

*Last updated: November 14, 2025*  
*Created for: PlacedIn Project Interview Prep*
