import { prisma } from '../../config/database';
import { AbsensiStatus } from '@prisma/client';

export class AbsensiService {
  async getAbsensiByDateAndKelas(date: Date, kelasId?: string) {
    const startObj = new Date(date);
    startObj.setHours(0, 0, 0, 0);

    const endObj = new Date(date);
    endObj.setHours(23, 59, 59, 999);

    const whereClause: any = {
      date: {
        gte: startObj,
        lte: endObj,
      }
    };

    if (kelasId) {
      whereClause.santri = { kelasId };
    }

    const absensiRecords = await prisma.absensi.findMany({
      where: whereClause,
      include: {
        santri: {
          select: { id: true, name: true, kelas: { select: { name: true } } }
        }
      }
    });

    return absensiRecords;
  }

  async upsertBulkAbsensi(
    userId: string, 
    date: Date, 
    records: Array<{ santriId: string, status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA', notes?: string }>
  ) {
    const dateQueryUtc = new Date(date);
    dateQueryUtc.setHours(0, 0, 0, 0);

    // Using transaction for bulk update
    const result = await prisma.$transaction(
      records.map(r => {
        return prisma.absensi.upsert({
          where: {
            santriId_date: {
              santriId: r.santriId,
              date: dateQueryUtc,
            }
          },
          update: {
            status: r.status as AbsensiStatus,
            notes: r.notes || null,
            userId: userId,
          },
          create: {
            santriId: r.santriId,
            date: dateQueryUtc,
            status: r.status as AbsensiStatus,
            notes: r.notes || null,
            userId: userId,
          }
        });
      })
    );

    return result;
  }
}
