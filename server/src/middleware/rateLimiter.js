import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  skip: (req) => process.env.NODE_ENV === 'test', // Skip rate limiting during testing
});

export default rateLimiter;
