import env from './config/env.js';
import app from './app.js';
import connectDB, { disconnectDB } from './config/db.js';
import { markReady, markShuttingDown } from './config/health.js';
import logger from './utils/logger.js';

// Register Uncaught Exception Handler
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception. Server is shutting down.', { error: err });
  process.exit(1);
});

let server;
let shutdownStarted = false;

const shutdown = async (signal, exitCode = 0) => {
  if (shutdownStarted) return;

  shutdownStarted = true;
  markShuttingDown();
  logger.info(`${signal} received. Starting graceful shutdown.`);

  const forceShutdownTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await disconnectDB();
    process.exit(exitCode);
  } catch (error) {
    logger.error('Graceful shutdown failed.', { error });
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      markReady();
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Application startup failed.', { error });
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection. Server is shutting down.', { error });
  shutdown('unhandledRejection', 1);
});

startServer();
