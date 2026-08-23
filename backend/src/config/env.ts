import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root workspace if available, or current dir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

// Enforce Asia/Jakarta timezone for date calculations and cron schedulers
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

const emptyStringToUndefined = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() === '') return undefined;
  return val;
}, z.string().optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL must be provided'),
  MONGODB_URL: z.string().min(1, 'MONGODB_URL must be provided'),
  REDIS_URL: z.string().min(1, 'REDIS_URL must be provided'),
  JWT_SECRET: z.string().default('default-jwt-secret-at-least-32-chars-long-development'),
  JWT_ACCESS_EXPIRY: z.string().default('1h'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  APP_SECRET: z.string().default('default-app-secret-at-least-32-chars-long-development'),
  TELEGRAM_BOT_TOKEN: emptyStringToUndefined,
  TELEGRAM_CHAT_ID: emptyStringToUndefined,
  SUPERADMIN_PHONE: emptyStringToUndefined,
  SMTP_HOST: emptyStringToUndefined,
  SMTP_PORT: z.preprocess((val) => {
    if (!val || val === '' || isNaN(Number(val)) || Number(val) === 0) return 587;
    return Number(val);
  }, z.number().default(587)),
  SMTP_SECURE: z.preprocess((val) => {
    if (val === 'true' || val === true || val === '1') return true;
    return false;
  }, z.boolean().default(false)),
  SMTP_USER: emptyStringToUndefined,
  SMTP_PASS: emptyStringToUndefined,
  SMTP_FROM_EMAIL: emptyStringToUndefined,
  SMTP_FROM_NAME: z.preprocess((val) => {
    if (!val || (typeof val === 'string' && val.trim() === '')) return 'HafalanKu';
    return val;
  }, z.string().default('HafalanKu')),
  GOOGLE_CLIENT_ID: emptyStringToUndefined,
  FRONTEND_URL: z.preprocess((val) => {
    if (!val || (typeof val === 'string' && val.trim() === '')) return 'http://localhost:3000';
    return val;
  }, z.string().default('http://localhost:3000')),
  PORT: z.preprocess((val) => {
    if (!val || val === '' || isNaN(Number(val))) return undefined;
    return Number(val);
  }, z.number().optional()),
  BACKEND_PORT: z.preprocess((val) => {
    if (!val || val === '' || isNaN(Number(val))) return 4000;
    return Number(val);
  }, z.number().default(4000)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.preprocess((val) => {
    if (!val || val === '' || isNaN(Number(val))) return 2097152;
    return Number(val);
  }, z.number().default(2097152)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
