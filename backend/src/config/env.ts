import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root workspace if available, or current dir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

// Enforce Asia/Jakarta timezone for date calculations and cron schedulers
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  MONGODB_URL: z.string().url('MONGODB_URL must be a valid MongoDB connection string'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis connection string'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('1h'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  APP_SECRET: z.string().min(32, 'APP_SECRET must be at least 32 characters'),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  SUPERADMIN_PHONE: z.string().optional(),
  WA_GATEWAY_URL: z.string().url('WA_GATEWAY_URL must be a valid URL').optional(),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3000'),
  BACKEND_PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(2097152),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
