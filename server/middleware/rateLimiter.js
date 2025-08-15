import rateLimit from 'express-rate-limit';

// Rate limiter for experience fetching - optimized for multiple users
export const experienceReadLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // Reduced from 120 to 60 requests per minute per IP
  message: {
    error: 'Too many requests. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for cached responses
    return req.headers['if-none-match'] !== undefined;
  }
});

// General API rate limiter - optimized for demo
export const generalApiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Reduced from 1000 to 500 requests per 15 minutes per IP
  message: {
    error: 'Too many API requests. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});
