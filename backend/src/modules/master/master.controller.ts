import { FastifyRequest, FastifyReply } from 'fastify';
import { surahList } from 'shared';

export const predikatList = [
  { value: 'MUMTAZ', label: 'Mumtaz (Sangat Baik)', score: 5 },
  { value: 'JAYYID_JIDDAN', label: 'Jayyid Jiddan (Baik Sekali)', score: 4 },
  { value: 'JAYYID', label: 'Jayyid (Baik)', score: 3 },
  { value: 'MAQBUL', label: 'Maqbul (Cukup)', score: 2 },
  { value: 'ULANG', label: 'Ulang (Perlu Perbaikan)', score: 1 },
];

export class MasterController {
  public async getSurahs(_req: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      data: surahList,
      total: surahList.length,
    });
  }

  public async getPredikats(_req: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      data: predikatList,
    });
  }
}

export const masterController = new MasterController();
