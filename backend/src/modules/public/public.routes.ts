import { FastifyInstance } from 'fastify';
import { publicController } from './public.controller';
import { reviewController } from '../review/review.controller';

export async function publicRoutes(fastify: FastifyInstance) {
  // Public routes do NOT require authentication
  fastify.get('/stats', publicController.getLandingStats);
  fastify.get('/reviews', reviewController.getAllReviews);
  fastify.get('/reviews/latest', reviewController.getLatestReviews);
  fastify.post('/reviews', reviewController.createReview);
}
