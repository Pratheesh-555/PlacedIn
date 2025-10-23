# 🎯 PlacedIn

> **Your Ultimate Platform for Sharing Campus Placement Experiences & Interview Insights**

PlacedIn is a modern, AI-powered web application that connects students through authentic placement experiences, interview questions, and campus updates. Built with cutting-edge technology to make job preparation easier and more collaborative.

---

## ✨ Features

### 🎓 For Students
- **Share Your Journey** - Post detailed placement experiences with company-wise categorization
- **Interview Questions Bank** - Access real interview questions asked by top companies
- **Live Updates** - Get instant notifications about campus placements and opportunities
- **Smart Search** - Find experiences by company, role, or keywords
- **Dark Mode** - Easy on the eyes, day or night

### 🤖 AI-Powered Admin Tools
- **Smart Content Extraction** - Paste announcements, AI extracts company, title, and content automatically
- **AI Content Moderation** - Automatic safety checks and quality assurance
- **Auto-Approval System** - Schedule posts with intelligent timing
- **Spam Detection** - Keep the platform clean and relevant

### 🔐 Secure & Private
- Google OAuth authentication
- Role-based access control (User/Admin/Super Admin)
- Protected routes and API endpoints
- Secure data validation

---

## 🚀 Tech Stack

### Frontend
- **React 18** + **TypeScript** - Type-safe, modern UI
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Beautiful, responsive design
- **Lucide Icons** - Clean, professional icons
- **React Router** - Seamless navigation

### Backend
- **Node.js** + **Express** - Robust REST API
- **MongoDB** + **Mongoose** - Scalable NoSQL database
- **Google Gemini AI** - Advanced content processing
- **Node-cron** - Automated scheduling
- **JWT** + **OAuth 2.0** - Secure authentication

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Google OAuth Client ID
- Gemini AI API Key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pratheesh-555/PlacedIn.git
   cd PlacedIn
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   ```

3. **Configure environment variables**

   **Frontend** - Create `.env` in root:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_BASE_URL=http://localhost:5000
   ```

   **Backend** - Create `server/.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

4. **Start the application**

   **Development mode:**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   npm run dev
   ```

   **Production mode:**
   ```bash
   # Build frontend
   npm run build

   # Start with PM2 (from root directory)
   pm2 start ecosystem.config.json
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 🎨 Key Features in Detail

### 📝 Experience Sharing
Students can share comprehensive placement experiences including:
- Company name and role
- Interview rounds (Technical, HR, Aptitude)
- Questions asked in each round
- Tips and preparation strategies
- Salary packages and offers
- Timeline of the process

### 🔔 Smart Updates System
Admins can post announcements that appear as:
- Floating notification bell on homepage
- Real-time updates panel
- Categorized by company
- View count tracking
- Active/inactive toggle

### 🤖 AI Content Processing
Powered by Google Gemini 2.5 Flash:
- Extracts structured data from unformatted text
- Identifies company names automatically
- Generates clear, concise titles
- Formats content professionally
- Moderates for inappropriate content
- Assigns safety confidence scores

### 👥 User Roles
1. **Students** - Post & view experiences
2. **Admins** - Approve content, post updates
3. **Super Admins** - Full system control, manage admins

---

## 📱 Screenshots

### Homepage
Modern, clean interface with gradient accents and smooth animations

### Experience Feed
Browse authentic placement experiences with smart filtering

### Admin Dashboard
Powerful tools for content management and analytics

### AI Extraction
One-click content parsing from raw announcements

---

## 🛠️ Development

### Project Structure
```
PlacedIn/
├── src/                      # Frontend React app
│   ├── components/          # Reusable UI components
│   │   ├── Admin/          # Admin dashboard & tools
│   │   ├── Experience/     # Experience sharing features
│   │   ├── Home/           # Homepage components
│   │   └── User/           # User dashboard
│   ├── config/             # Configuration files
│   ├── contexts/           # React contexts (Theme)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
├── server/                  # Backend Express API
│   ├── config/             # Server configuration
│   ├── jobs/               # Cron jobs
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   └── utils/              # Helper functions
└── public/                 # Static assets
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

---

## 🌐 Deployment

### Frontend (Netlify)
- Automatic deploys from `main` branch
- Environment variables configured in Netlify dashboard
- Custom domain support

### Backend (VPS/Cloud)
- Deployed using PM2 process manager
- Nginx reverse proxy recommended
- MongoDB Atlas for database
- Auto-restart on failures
- Log management with PM2

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Pratheesh Krishnan**
- GitHub: [@Pratheesh-555](https://github.com/Pratheesh-555)
- Email: pratheeshkrishnan595@gmail.com

---

## 🙏 Acknowledgments

- Google Gemini AI for intelligent content processing
- MongoDB for robust data storage
- The open-source community for amazing tools and libraries

---

## 📞 Support

For support, email pratheeshkrishnan595@gmail.com or open an issue on GitHub.

---

<div align="center">

**Built with ❤️ for students, by students**

⭐ Star us on GitHub if this project helped you!

[Report Bug](https://github.com/Pratheesh-555/PlacedIn/issues) · [Request Feature](https://github.com/Pratheesh-555/PlacedIn/issues)

</div>
