import express from 'express';
import mongoose from 'mongoose';    
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ silent: true });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors({
    origin: [
      "https://placedin.netlify.app", // Production URL
      "https://krishh.me",            // Your custom domain
      "http://localhost:5173",        // Local development
      "http://localhost:5174",        // Alternate local port
      "http://localhost:5175"         // Another alternate local port
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  
  // Handle preflight requests
  app.options('*', cors());
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Use simplified routes
  const experiencesRouter = await import('./routes/experiences.js');
  const adminRouter = await import('./routes/admin.js');
  const notificationsRouter = await import('./routes/notifications.js');

  app.use('/api/experiences', experiencesRouter.default);
  app.use('/api/admin', adminRouter.default);
  app.use('/api/notifications', notificationsRouter.default);

  // Test route for debugging
  app.get('/api/test', async (req, res) => {
    try {
      const testCloudinary = await import('./utils/testCloudinary.js');
      const cloudinaryWorking = await testCloudinary.default();
      
      res.json({
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        cloudinary: {
          configured: cloudinaryWorking,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not set',
          apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
          apiSecretExists: !!process.env.CLOUDINARY_API_SECRET
        }
      });
    } catch (error) {
      console.error('Test route error:', error);
      res.status(500).json({ 
        error: 'Test failed', 
        message: error.message,
        stack: error.stack 
      });
    }
  });

  // MongoDB connection
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
