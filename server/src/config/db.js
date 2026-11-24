import mongoose from 'mongoose';
import { initPostgres, getIsPostgresConnected } from './postgres.js';

let isMongoConnected = false;

export const connectDB = async () => {
  // 1. Try PostgreSQL if configured
  const pgSuccess = await initPostgres();

  // 2. Try MongoDB if configured
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
      isMongoConnected = true;
    } catch (error) {
      console.warn(`[Database] MongoDB connection failed (${error.message}).`);
      isMongoConnected = false;
    }
  }

  // 3. Fallback info
  if (!pgSuccess && !isMongoConnected) {
    console.log('[Database] Running in Resilient Local Storage Engine (Zero-Config Development Mode).');
    console.log('           Supports PostgreSQL (DATABASE_URL), MongoDB (MONGODB_URI), or Local JSON.');
  }

  return { postgres: pgSuccess, mongo: isMongoConnected };
};

export const getIsMongoConnected = () => isMongoConnected;
export { getIsPostgresConnected };
