import { FastifyInstance } from 'fastify';
import { reviewController } from './review.controller';

export async function reviewRoutes(fastify: FastifyInstance) {
  // Review endpoints
  fastify.get('/', reviewController.getAllReviews);
  fastify.get('/latest', reviewController.getLatestReviews);
  fastify.post('/', reviewController.createReview);
}
