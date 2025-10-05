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
      "https://krishh.me",            // Your custom domain (primary)
      "https://www.krishh.me",        // Your custom domain with www
      "https://placedin.netlify.app", // Backup production URL
      "http://localhost:5173",        // Local development
      "http://localhost:5174",        // Alternate local port
      "http://localhost:5175",        // Another alternate local port
      // Allow any IP address on local network for mobile testing
      /^http:\/\/192\.168\.\d+\.\d+:(5173|5174|5175)$/, // Local network IPs
      /^http:\/\/10\.\d+\.\d+\.\d+:(5173|5174|5175)$/,  // Local network IPs
      /^http:\/\/172\.\d+\.\d+\.\d+:(5173|5174|5175)$/, // Local network IPs
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
  const userExperiencesRouter = await import('./routes/userExperiences.js');
  const updatesRouter = await import('./routes/updates.js');

  app.use('/api/experiences', experiencesRouter.default);
  app.use('/api/admin', adminRouter.default);
  app.use('/api/user-experiences', userExperiencesRouter.default);
  app.use('/api/updates', updatesRouter.default);

  // Health check endpoint for monitoring and load balancers
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
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
    // Log errors without exposing sensitive information
    console.error('Server error occurred:', err.message);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`📱 Mobile access: Available on local network`);
  });
}

startServer().catch(console.error);
