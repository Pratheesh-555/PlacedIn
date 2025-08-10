import express from 'express';
import mongoose from 'mongoose';    
import cors from 'cors';
import dotenv from 'dotenv';
import { generalApiLimit } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config({ silent: true });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Request timeout handling to prevent hanging
  app.use((req, res, next) => {
    req.setTimeout(30000); // 30 second timeout
    res.setTimeout(30000);
    next();
  });

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

  // Apply rate limiting to all API routes for high concurrent access
  app.use('/api', generalApiLimit);

  // Simple request logging (only for errors and important requests)
  app.use((req, res, next) => {
    next();
  });

  // Use simplified routes
  const experiencesRouter = await import('./routes/experiences.js');
  const adminRouter = await import('./routes/admin.js');

  app.use('/api/experiences', experiencesRouter.default);
  app.use('/api/admin', adminRouter.default);

  // Health check endpoint for monitoring and load balancers
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });

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

  // MongoDB connection optimized for high concurrent users (10K+ views, 3K+ posts)
  const mongooseOptions = {
    maxPoolSize: 20, // Reduced from 50 - too high can cause bottlenecks
    minPoolSize: 5,  // Reduced from 10 - more efficient
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 10000, // Increased from 5000
    socketTimeoutMS: 30000, // Reduced from 45000
    connectTimeoutMS: 10000, // Added connection timeout
    heartbeatFrequencyMS: 10000, // Added heartbeat
    retryWrites: true, // Enable retry writes for better reliability
    w: 'majority' // Write concern for data consistency
  };

  mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

  // Handle MongoDB connection events
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
  });

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
