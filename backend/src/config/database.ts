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
    await mongoose.connect(env.MONGODB_URL, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error: any) {
    console.warn('⚠️ MongoDB connection notice:', error.message || error);
  }
}

// Graceful shutdown helper
export async function disconnectDatabases() {
  await prisma.$disconnect();
  await mongoose.disconnect();
  console.log('💾 Disconnected from databases.');
}
