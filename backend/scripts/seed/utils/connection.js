import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from the backend root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Establishes a standalone MongoDB connection for seed scripts.
 * Does NOT import app.js or server.js to avoid starting the HTTP server.
 */
export const connectForSeed = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the .env file.');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`\n🔗 MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Gracefully disconnects from MongoDB.
 */
export const disconnectAfterSeed = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.\n');
  } catch (error) {
    console.error('⚠️  Error during disconnect:', error.message);
  }
};
