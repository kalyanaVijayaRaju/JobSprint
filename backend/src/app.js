import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorMiddleware.js';
import ApiError from './utils/apiError.js';
import { getHealthState } from './config/health.js';

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

// Sanitize inputs to protect against NoSQL Injection
app.use(mongoSanitize());

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

// Unhandled HTTP route parser
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl} on this server`));
});

// Global Error Handler registration
app.use(errorHandler);

export default app;
