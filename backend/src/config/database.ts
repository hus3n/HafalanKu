import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { env } from './env';

// PostgreSQL (Prisma) connection
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// MongoDB (Mongoose) connection
export async function connectMongoDB() {
  try {
    mongoose.set('strictQuery', true);
    const isDocker = require('fs').existsSync('/.dockerenv');
    const mongoUrl = (env.MONGODB_URL.includes('mongodb://mongo') && !isDocker) 
      ? 'mongodb://127.0.0.1:27017/hafalanku' 
      : env.MONGODB_URL;
    await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error: any) {
    console.warn('⚠️ MongoDB connection fallback (local mode active):', error.message || error);
  }
}

// Graceful shutdown helper
export async function disconnectDatabases() {
  await prisma.$disconnect();
  await mongoose.disconnect();
  console.log('💾 Disconnected from databases.');
}
