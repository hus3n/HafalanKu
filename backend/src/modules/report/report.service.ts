import ExcelJS from 'exceljs';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';

export class ReportService {
  async getRecapData(
    userId: string,
    month?: number,
    year?: number,
    kelasId?: string,
    santriId?: string
  ) {
    const where: any = { userId };

    if (santriId) {
      where.santriId = santriId;
    } else if (kelasId) {
      const santrisInKelas = await prisma.santri.findMany({
        where: { kelasId, userId, deletedAt: null },
        select: { id: true }
      });
      where.santriId = { in: santrisInKelas.map((s: any) => s.id) };
    }

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const hafalans = await prisma.hafalan.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        santri: {
          select: { id: true, name: true, parentName: true, kelas: { select: { name: true } } }
        }
      }
    });

    // Calculate Summary Stats
    const totalSetoran = hafalans.length;
    const predikatCount: Record<string, number> = {
      MUMTAZ: 0,
      JAYYID_JIDDAN: 0,
      JAYYID: 0,
      MAQBUL: 0,
      ULANG: 0,
    };

    hafalans.forEach((h: any) => {
      if (predikatCount[h.predikat] !== undefined) {
        predikatCount[h.predikat]++;
      }
    });

    return {
      summary: {
        totalSetoran,
        predikatCount,
      },
      records: hafalans,
    };
  }

  async generateExcelReport(
    userId: string,
    month?: number,
    year?: number,
    kelasId?: string,
    santriId?: string
  ): Promise<Buffer> {
    const recap = await this.getRecapData(userId, month, year, kelasId, santriId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HafalanKu System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Rekapitulasi Hafalan');

    // Define Columns
    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Tanggal', key: 'date', width: 14 },
      { header: 'Nama Santri', key: 'santriName', width: 24 },
      { header: 'Wali Murid', key: 'parentName', width: 22 },
      { header: 'Kelas', key: 'kelasName', width: 18 },
      { header: 'Nama Surat', key: 'surahName', width: 20 },
      { header: 'Ayat Mulai', key: 'ayatStart', width: 12 },
      { header: 'Ayat Selesai', key: 'ayatEnd', width: 12 },
      { header: 'Jumlah Ayat', key: 'totalAyat', width: 14 },
      { header: 'Predikat', key: 'predikat', width: 16 },
      { header: 'Catatan', key: 'notes', width: 30 },
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '059669' }, // Emerald-600
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Rows Data
    recap.records.forEach((h: any, index: number) => {
      const row = worksheet.addRow({
        no: index + 1,
        date: new Date(h.date).toLocaleDateString('id-ID'),
        santriName: h.santri?.name || '-',
        parentName: h.santri?.parentName || '-',
        kelasName: h.santri?.kelas?.name || '-',
        surahName: `QS. ${h.surahName} (${h.surahNumber})`,
        ayatStart: h.ayatStart,
        ayatEnd: h.ayatEnd,
        totalAyat: h.ayatEnd - h.ayatStart + 1,
        predikat: h.predikat,
        notes: h.notes || '-',
      });

      // Align numbers and dates
      row.getCell('no').alignment = { horizontal: 'center' };
      row.getCell('date').alignment = { horizontal: 'center' };
      row.getCell('ayatStart').alignment = { horizontal: 'center' };
      row.getCell('ayatEnd').alignment = { horizontal: 'center' };
      row.getCell('totalAyat').alignment = { horizontal: 'center' };
      row.getCell('predikat').alignment = { horizontal: 'center' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
