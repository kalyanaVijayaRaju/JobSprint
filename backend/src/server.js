import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

// Load Environment Configuration
dotenv.config();

// Register Uncaught Exception Handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Server is shutting down...', err);
  process.exit(1);
});

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

// Start Server Listener
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Register Unhandled Rejection Handler
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Server is shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});
