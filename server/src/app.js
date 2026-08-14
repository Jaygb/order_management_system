import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimiter from './middleware/rateLimiter.js';
import router from './routes/index.js';
import errorHandler, { AppError } from './middleware/errorHandler.js';

const app = express();

// Enable Helmet for security headers
app.use(helmet());

// Configure CORS
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Apply Rate Limiter
app.use('/api', rateLimiter);

// Express Body Parser
app.use(express.json());

// Register API Routes
app.use('/api/v1', router);

// Catch-all route handler for undefined endpoints
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
