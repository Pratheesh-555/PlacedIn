import express from 'express';
import mongoose from 'mongoose';    
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  console.log('Starting server...');

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

  console.log('Middleware configured, loading routes...');

  // Test route
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });

  try {
    // Routes - using dynamic imports for ES modules
    console.log('Loading experiences router...');
    const experiencesRouter = await import('./routes/experiences.js');
    app.use('/api/experiences', experiencesRouter.default);
    console.log('Experiences router loaded successfully');

    console.log('Loading admin router...');
    const adminRouter = await import('./routes/admin.js');
    app.use('/api/admin', adminRouter.default);
    console.log('Admin router loaded successfully');

    console.log('Loading notifications router...');
    const notificationsRouter = await import('./routes/notifications.js');
    app.use('/api/notifications', notificationsRouter.default);
    console.log('Notifications router loaded successfully');

  } catch (error) {
    console.error('Error loading routes:', error);
    process.exit(1);
  }

  // MongoDB connection
  console.log('Connecting to MongoDB...');
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Express error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
