import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  logger.info(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

export default connectDB;
