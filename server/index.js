import express from 'express';
import mongoose from 'mongoose';    
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors({
    origin: [
      "https://placedin.netlify.app", // Production URL
      "http://localhost:5173",        // Local development
      "http://localhost:5174",        // Alternate local port
      "http://localhost:5175"         // Another alternate local port
    ],
    credentials: true
  }));
  app.use(express.json());

  // Routes - using dynamic imports for ES modules
  const experiencesRouter = await import('./routes/experiences.js');
  const adminRouter = await import('./routes/admin.js');
  const notificationsRouter = await import('./routes/notifications.js');

  app.use('/api/experiences', experiencesRouter.default);
  app.use('/api/admin', adminRouter.default);
  app.use('/api/notifications', notificationsRouter.default);

  // MongoDB connection
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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