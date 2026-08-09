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
}
