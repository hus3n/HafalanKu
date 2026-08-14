import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportService } from './report.service';

const reportService = new ReportService();

export class ReportController {
  static async getRecap(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { month, year, kelasId, santriId, ustadzId } = req.query as any;

    const data = await reportService.getRecapData(
      userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      kelasId,
      santriId,
      ustadzId
    );

    return reply.send({
      success: true,
      data,
    });
  }

  static async downloadExcel(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { month, year, kelasId, santriId, ustadzId } = req.query as any;

    const buffer = await reportService.generateExcelReport(
      userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      kelasId,
      santriId,
      ustadzId
    );

    const fileName = `Rekap_Hafalan_${Date.now()}.xlsx`;

    reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', `attachment; filename="${fileName}"`)
      .send(buffer);
  }
}
