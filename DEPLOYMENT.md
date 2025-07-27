# Deployment Guide

## Frontend Deployment (Netlify)

### 1. Build the Frontend
```bash
npm run build
```

### 2. Deploy to Netlify
- Connect your GitHub repository to Netlify
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variables in Netlify dashboard:
  - `VITE_API_URL`: Your backend URL (e.g., `https://your-backend.herokuapp.com`)

### 3. Update netlify.toml
Replace `https://your-backend-url.com` in `netlify.toml` with your actual backend URL.

## Backend Deployment Options

### Option 1: Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new app: `heroku create your-app-name`
4. Add MongoDB addon: `heroku addons:create mongolab`
5. Deploy: `git push heroku main`

### Option 2: Railway
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `ADMIN_KEY`: Your admin key
   - `PORT`: Railway will set this automatically

### Option 3: Render
1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm run server`
6. Add environment variables

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add it to your environment variables

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/sastra_portal`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sastra_portal
ADMIN_KEY=your-secure-admin-key
```

## Testing Deployment

1. Test your backend API endpoints
2. Test your frontend with the new API URL
3. Verify all functionality works in production

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure your backend allows requests from your frontend domain
2. **MongoDB connection**: Verify your connection string and network access
3. **Environment variables**: Ensure all variables are set correctly in your hosting platform 