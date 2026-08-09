import Redis from 'ioredis';
import { env } from './env';

const isDocker = require('fs').existsSync('/.dockerenv');
const redisHost = (env.REDIS_URL.includes('redis://redis') && !isDocker) 
  ? 'redis://127.0.0.1:6379' 
  : env.REDIS_URL;

export const redis = new Redis(redisHost, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  retryStrategy(times) {
    if (times > 3) return null; // Stop retrying after 3 attempts in local dev
    return Math.min(times * 500, 2000);
  },
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully.');
});

redis.on('error', (err) => {
  console.warn('⚠️ Redis fallback active (Connection warning):', err.message);
});
