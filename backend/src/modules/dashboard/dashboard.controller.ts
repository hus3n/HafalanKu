import { FastifyRequest, FastifyReply } from 'fastify';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  static async getStats(req: FastifyRequest, reply: FastifyReply) {
    const { userId, role, orgId } = req.user!;

    const stats = await dashboardService.getStats(userId, role, orgId);

    return reply.send({
      success: true,
      data: stats,
    });
  }
}
