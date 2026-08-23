import { FastifyRequest, FastifyReply } from 'fastify';
import { SantriService } from './santri.service';

const santriService = new SantriService();

export class SantriController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const data = req.body as any;
    const user = req.user!;
    
    const santri = await santriService.createSantri(user, data);
    
    return reply.status(201).send({
      success: true,
      message: 'Data santri berhasil ditambahkan',
      data: santri,
    });
  }

  static async getList(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { page = 1, limit = 10, search, kelasId } = req.query as any;

    const result = await santriService.getSantriList(
      user,
      Number(page),
      Number(limit),
      search,
      kelasId
    );

    return reply.send({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }

  static async getById(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { id } = req.params as { id: string };

    const santri = await santriService.getSantriById(user, id);

    return reply.send({
      success: true,
      data: santri,
    });
  }

  static async update(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { id } = req.params as { id: string };
    const data = req.body as any;

    const santri = await santriService.updateSantri(user, id, data);

    return reply.send({
      success: true,
      message: 'Data santri berhasil diperbarui',
      data: santri,
    });
  }

  static async delete(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { id } = req.params as { id: string };

    const result = await santriService.softDeleteSantri(user, id);

    return reply.send({
      success: true,
      message: result.message,
    });
  }

  static async downloadTemplate(req: FastifyRequest, reply: FastifyReply) {
    const buffer = await santriService.generateImportTemplate();

    return reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', 'attachment; filename="Template_Import_HafalanKu.xlsx"')
      .send(buffer);
  }

  static async previewImport(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { fileBase64 } = req.body as { fileBase64: string };

    if (!fileBase64) {
      return reply.status(400).send({
        success: false,
        message: 'File Excel (base64) wajib disertakan.',
      });
    }

    const result = await santriService.previewBulkImport(user, fileBase64);

    return reply.send({
      success: true,
      message: 'Pratinjau impor berhasil diproses.',
      data: result,
    });
  }

  static async executeImport(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { rows, mode = 'MERGE' } = req.body as { rows: any[]; mode?: 'MERGE' | 'REPLACE' };

    const result = await santriService.executeBulkImport(user, rows, mode);

    return reply.send({
      success: true,
      message: result.message,
      data: result.stats,
    });
  }

  static async exportFull(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { kelasId } = req.query as { kelasId?: string };

    const buffer = await santriService.exportFullSantriData(user, kelasId);

    return reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', `attachment; filename="Data_Lengkap_Santri_HafalanKu_${Date.now()}.xlsx"`)
      .send(buffer);
  }
}
