import express from 'express';
import mongoose from 'mongoose';    
import cors from 'cors';
import dotenv from 'dotenv';
import { generalApiLimit } from './middleware/rateLimiter.js';
import { startAutoApprovalJob } from './jobs/autoApprovalJob.js';

dotenv.config({ silent: true });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use((req, res, next) => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
  });

  app.use(cors({
    origin: [
      "https://krishh.me",
      "https://www.krishh.me",
      "https://placedin.netlify.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      /^http:\/\/192\.168\.\d+\.\d+:(5173|5174|5175)$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:(5173|5174|5175)$/,        /^http:\/\/172\.\d+\.\d+\.\d+:(5173|5174|5175)$/,     ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  
  app.options('*', cors());
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api', generalApiLimit);

  app.use((req, res, next) => {
    next();
  });

  const experiencesRouter = await import('./routes/experiences.js');
  const adminRouter = await import('./routes/admin.js');
  const userExperiencesRouter = await import('./routes/userExperiences.js');
  const updatesRouter = await import('./routes/updates.js');

  app.use('/api/experiences', experiencesRouter.default);
  app.use('/api/admin', adminRouter.default);
  app.use('/api/user-experiences', userExperiencesRouter.default);
  app.use('/api/updates', updatesRouter.default);

  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

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
    
    // Start auto-approval cron job
    startAutoApprovalJob();
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
