# SASTRA Student Portal

A comprehensive web application for SASTRA University students to share and discover placement and internship experiences.

## Features

- **Experience Sharing**: Students can post detailed placement and internship experiences
- **Advanced Search & Filtering**: Search by company, student, year, and experience type
- **Admin Moderation**: Admin panel to review and approve submissions
- **Responsive Design**: Mobile-first design with SASTRA University branding
- **Real-time Experience Feed**: Latest experiences displayed in an engaging grid layout

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection string and other configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the React frontend (port 3000) and Express backend (port 5000).

### Database Setup

The application will automatically connect to MongoDB and create the necessary collections. Make sure your MongoDB instance is running.

For production, consider using MongoDB Atlas:
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Update the `MONGODB_URI` in your `.env` file

### Admin Access

To access the admin panel:
1. Set the `ADMIN_KEY` in your `.env` file
2. Navigate to `/admin`
3. Use the admin key for authentication

## Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Main navigation
│   ├── Home.tsx        # Landing page
│   ├── PostExperience.tsx # Experience submission form
│   ├── Experiences.tsx  # Experience listing with filters
│   ├── ExperienceModal.tsx # Full experience view
│   └── AdminPanel.tsx   # Admin moderation panel
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component

server/
├── models/            # Mongoose models
├── routes/            # Express routes
└── index.js          # Server entry point
```

## API Endpoints

### Public Endpoints
- `GET /api/experiences` - Get all approved experiences
- `POST /api/experiences` - Submit new experience
- `GET /api/experiences/:id` - Get specific experience

### Admin Endpoints
- `GET /api/admin/pending-experiences` - Get pending experiences
- `PUT /api/admin/experiences/:id/approve` - Approve experience
- `DELETE /api/admin/experiences/:id` - Delete experience
- `GET /api/admin/stats` - Get dashboard statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.