import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../utils/response';
import { reviewService } from './review.service';
import { createReviewSchema } from './review.schema';

export class ReviewController {
  async createReview(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = createReviewSchema.parse(request.body);
    const userId = (request as any).user?.id;
    const review = await reviewService.createReview(validatedData, userId);
    return reply.status(201).send(successResponse('Ulasan Anda berhasil dikirim. Terima kasih banyak atas masukan Anda!', review));
  }

  async getLatestReviews(request: FastifyRequest, reply: FastifyReply) {
    const limit = (request.query as any)?.limit ? parseInt((request.query as any).limit) : 3;
    const reviews = await reviewService.getLatestReviews(limit);
    return reply.send(successResponse('3 ulasan terbaru', reviews));
  }

  async getAllReviews(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const page = query?.page ? parseInt(query.page) : 1;
    const limit = query?.limit ? parseInt(query.limit) : 10;
    const result = await reviewService.getAllReviews(page, limit);
    return reply.send(successResponse('Daftar ulasan', result));
  }
}

export const reviewController = new ReviewController();
