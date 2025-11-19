# PlacedIn

A full-stack web application for students to share campus placement experiences, interview questions, and preparation insights. Features AI-powered content moderation and admin tools.

## Features

- **Experience Sharing** - Post and browse placement experiences by company
- **Smart Search** - Filter by company, year, and experience type
- **AI Content Moderation** - Automatic safety checks using Google Gemini AI
- **Admin Dashboard** - Approve/reject submissions, manage updates
- **Dark Mode** - Theme support with system preference detection
- **Google OAuth** - Secure authentication

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**AI:** Google Gemini 2.5 Flash  
**Auth:** Google OAuth 2.0

## Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Google OAuth Client ID
- Gemini API Key

### Setup

1. Clone and install dependencies:
```bash
git clone https://github.com/Pratheesh-555/PlacedIn.git
cd PlacedIn
npm install
cd server && npm install && cd ..
```

2. Configure environment variables:

**Root `.env`:**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:5000
```

**`server/.env`:**
```env
MONGODB_URI=your_mongodb_uri
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

3. Start the application:
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

4. Access at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
PlacedIn/
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── config/           # API configuration
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── server/               # Express backend
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Express middleware
│   └── utils/           # Backend utilities
└── public/              # Static assets
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/experiences` | GET | Get all approved experiences |
| `/api/experiences` | POST | Submit new experience |
| `/api/admin/pending-experiences` | GET | Get pending approvals |
| `/api/admin/experiences/:id/approve` | PUT | Approve experience |
| `/api/updates` | GET | Get active updates |

## Deployment

**Frontend (Netlify):**
- Build command: `npm run build`
- Publish directory: `dist`

**Backend (Render/VPS):**
- Start command: `node index.js`
- Use PM2 for process management

## Scripts

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Development with nodemon
- `npm start` - Production server

## Author

**Pratheesh Krishnan**  
GitHub: [@Pratheesh-555](https://github.com/Pratheesh-555)  
Email: pratheeshkrishnan595@gmail.com

## License

MIT License - see [LICENSE](LICENSE) file for details
