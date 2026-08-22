import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { apiLimiter, authLimiter } from './middlewares/rateLimiter.js';
import ApiError from './utils/apiError.js';
import { getHealthState } from './config/health.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import jobAlertRoutes from './routes/jobAlertRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import emailTemplateRoutes from './routes/emailTemplateRoutes.js';
import talentPoolRoutes from './routes/talentPoolRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewPrepRoutes from './routes/interviewPrepRoutes.js';
import activityFeedRoutes from './routes/activityFeedRoutes.js';
import companyReviewRoutes from './routes/companyReviewRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import outreachRoutes from './routes/outreachRoutes.js';
import kanbanRoutes from './routes/kanbanRoutes.js';
import salaryInsightRoutes from './routes/salaryInsightRoutes.js';
import endorsementRoutes from './routes/endorsementRoutes.js';
import scheduledInterviewRoutes from './routes/scheduledInterviewRoutes.js';
import comparisonRoutes from './routes/comparisonRoutes.js';
import aiAnalyzerRoutes from './routes/aiAnalyzerRoutes.js';
import mockInterviewRoutes from './routes/mockInterviewRoutes.js';
import offerEvaluatorRoutes from './routes/offerEvaluatorRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import talentRadarRoutes from './routes/talentRadarRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Secure HTTP Headers
app.use(helmet());

// Cross-Origin Resource Sharing settings
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/users', profileRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/saved-jobs', savedJobRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminUserRoutes);
app.use('/api/v1/job-alerts', jobAlertRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/email-templates', emailTemplateRoutes);
app.use('/api/v1/talent-pool', talentPoolRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interview-prep', interviewPrepRoutes);
app.use('/api/v1/feed', activityFeedRoutes);
app.use('/api/v1/companies/:companyId/reviews', companyReviewRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/outreach', outreachRoutes);
app.use('/api/v1/kanban', kanbanRoutes);
app.use('/api/v1/salary-insights', salaryInsightRoutes);
app.use('/api/v1/endorsements', endorsementRoutes);
app.use('/api/v1/interviews', scheduledInterviewRoutes);
app.use('/api/v1/comparisons', comparisonRoutes);
app.use('/api/v1/ai-analyzer', aiAnalyzerRoutes);
app.use('/api/v1/mock-interviews', mockInterviewRoutes);
app.use('/api/v1/offer-evaluator', offerEvaluatorRoutes);
app.use('/api/v1/mentorship', mentorshipRoutes);
app.use('/api/v1/talent-radar', talentRadarRoutes);

// Unhandled HTTP route parser
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl} on this server`));
});

// Global Error Handler registration
app.use(errorHandler);

export default app;
