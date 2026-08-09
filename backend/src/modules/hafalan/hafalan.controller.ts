import { FastifyRequest, FastifyReply } from 'fastify';
import { HafalanService } from './hafalan.service';

const hafalanService = new HafalanService();

export class HafalanController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const data = req.body as any;

    const hafalan = await hafalanService.createHafalan(userId, data);

    return reply.status(201).send({
      success: true,
      message: 'Setoran hafalan berhasil dicatat',
      data: hafalan,
    });
  }

  static async getList(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { page = 1, limit = 10, santriId, surahNumber, predikat } = req.query as any;

    const result = await hafalanService.getHafalanList(
      userId,
      Number(page),
      Number(limit),
      santriId,
      surahNumber ? Number(surahNumber) : undefined,
      predikat
    );

    return reply.send({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }

  static async getById(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const hafalan = await hafalanService.getHafalanById(userId, id);

    return reply.send({
      success: true,
      data: hafalan,
    });
  }

  static async update(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const data = req.body as any;

    const hafalan = await hafalanService.updateHafalan(userId, id, data);

    return reply.send({
      success: true,
      message: 'Data hafalan berhasil diperbarui',
      data: hafalan,
    });
  }

  static async delete(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = await hafalanService.deleteHafalan(userId, id);

    return reply.send(result);
  }

  static async createBulk(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const data = req.body as { santriId: string, surahs: number[] };

    const result = await hafalanService.createBulkHafalan(userId, data);

    return reply.status(201).send({
      success: true,
      message: `${result.count} surat berhasil ditambahkan ke hafalan santri`,
      data: result,
    });
  }

  static async getRekapGlobal(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { page = 1, limit = 10, search, kelasId } = req.query as any;

    const result = await hafalanService.getRekapGlobal(
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
}
