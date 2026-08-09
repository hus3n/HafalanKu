import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { redis } from '../config/redis';

async function rateLimitPlugin(fastify: FastifyInstance) {
  const isRedisReady = redis.status === 'ready' || redis.status === 'connecting';
  
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    ...(isRedisReady ? { redis: redis as any } : {}),
    keyGenerator: (request) => {
      // Limit by user ID if authenticated, else IP address
      return request.user?.userId || request.ip;
    },
    errorResponseBuilder: () => ({
      success: false,
      message: 'Terlalu banyak permintaan, silakan coba lagi nanti.',
    }),
  });
}

export default fp(rateLimitPlugin);
