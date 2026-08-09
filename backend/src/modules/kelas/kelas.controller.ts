import { FastifyRequest, FastifyReply } from 'fastify';
import { KelasService } from './kelas.service';

const kelasService = new KelasService();

export class KelasController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const data = req.body as any;

    const kelas = await kelasService.createKelas(user, data);

    return reply.status(201).send({
      success: true,
      message: 'Kelas berhasil dibuat',
      data: kelas,
    });
  }

  static async getList(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { search } = req.query as { search?: string };

    const kelases = await kelasService.getKelasList(userId, search);

    return reply.send({
      success: true,
      data: kelases,
    });
  }

  static async getById(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const kelas = await kelasService.getKelasById(userId, id);

    return reply.send({
      success: true,
      data: kelas,
    });
  }

  static async update(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const data = req.body as any;

    const kelas = await kelasService.updateKelas(userId, id, data);

    return reply.send({
      success: true,
      message: 'Kelas berhasil diperbarui',
      data: kelas,
    });
  }

  static async delete(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = await kelasService.deleteKelas(userId, id);

    return reply.send(result);
  }

  static async assignSantri(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id: kelasId } = req.params as { id: string };
    const { santriId } = req.body as { santriId: string };

    const result = await kelasService.assignSantri(userId, kelasId, santriId);

    return reply.send(result);
  }

  static async unassignSantri(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id: kelasId, santriId } = req.params as { id: string; santriId: string };

    const result = await kelasService.unassignSantri(userId, kelasId, santriId);

    return reply.send(result);
  }
}
