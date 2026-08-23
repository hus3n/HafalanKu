import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../utils/response';
import { publicService } from './public.service';

export class PublicController {
  async getLandingStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await publicService.getLandingStats();
    return reply.send(successResponse('Statistik publik landing page', stats));
  }
}

export const publicController = new PublicController();
