import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { apiLimiter, authLimiter } from './middlewares/rateLimiter.js';
import ApiError from './utils/apiError.js';
import { getHealthState } from './config/health.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Secure HTTP Headers
app.use(helmet());

// Cross-Origin Resource Sharing settings
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// API Request Logging using Morgan bound to Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Body parsers with size limit constraints
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser — needed for JWT cookie extraction
app.use(cookieParser());

// Sanitize inputs to protect against NoSQL Injection
app.use(mongoSanitize());

// Global rate limiter — applies to all routes
app.use(apiLimiter);

// Liveness confirms the Node.js process can serve HTTP.
app.get(['/health', '/health/live'], (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Readiness controls whether the process should receive application traffic.
app.get('/health/ready', (req, res) => {
  const health = getHealthState();
  const ready = health.ready && !health.shuttingDown;

  res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? 'READY' : 'NOT_READY',
    timestamp: new Date().toISOString()
  });
});

// Main routing welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the JobSprint API.'
  });
});

// API routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/users', profileRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/saved-jobs', savedJobRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Unhandled HTTP route parser
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl} on this server`));
});

// Global Error Handler registration
app.use(errorHandler);

export default app;
