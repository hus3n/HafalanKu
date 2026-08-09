import { FastifyCorsOptions } from '@fastify/cors';
import { env } from './env';

export const corsConfig: FastifyCorsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return cb(null, true);
    
    const allowed = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost',
      'https://hafalanku.com',
      env.FRONTEND_URL,
    ];
    
    if (allowed.includes(origin) || env.NODE_ENV === 'development') {
      cb(null, true);
    } else {
      cb(null, true); // Allow origin in production/local container testing
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
};
