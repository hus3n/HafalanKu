import ExcelJS from 'exceljs';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';

export class ReportService {
  async getRecapData(
    userId: string,
    month?: number,
    year?: number,
    kelasId?: string,
    santriId?: string,
    ustadzId?: string
  ) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, organizationId: true, name: true, organization: { select: { name: true } } }
    });

    let accessWhere: any = {};
    if (currentUser?.role === 'SUPERADMIN') {
      accessWhere = {};
    } else if (currentUser?.role === 'ADMIN' && currentUser.organizationId) {
      accessWhere = {
        santri: {
          user: { organizationId: currentUser.organizationId }
        }
      };
    } else {
      accessWhere = {
        OR: [
          { userId },
          { santri: { OR: [{ userId }, { kelas: { userId } }] } }
        ]
      };
    }

    const where: any = { ...accessWhere };

    if (santriId) {
      where.santriId = santriId;
    }

    if (kelasId) {
      where.santri = {
        ...(where.santri || {}),
        kelasId,
      };
    }

    if (ustadzId) {
      where.santri = {
        ...(where.santri || {}),
        kelas: {
          userId: ustadzId,
        }
      };
    }

    // Flexible Date Filtering (Month, Year, or Whole Year)
    if (year && month) {
      const startDate = new Date(year, month - 1, 1, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    } else if (year && !month) {
      const startDate = new Date(year, 0, 1, 0, 0, 0);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    } else if (!year && month) {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, month - 1, 1, 0, 0, 0);
      const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    }

    const hafalans = await prisma.hafalan.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        user: { select: { name: true } },
        santri: {
          select: { 
            id: true, 
            name: true, 
            parentName: true, 
            kelas: { 
              select: { 
                name: true,
                user: { select: { name: true } }
              } 
            } 
          }
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
      organizationName: currentUser?.organization?.name || 'HafalanKu',
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
    santriId?: string,
    ustadzId?: string
  ): Promise<Buffer> {
    const recap = await this.getRecapData(userId, month, year, kelasId, santriId, ustadzId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HafalanKu System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Rekapitulasi Hafalan');

    // Title and Metadata Header Rows
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REKAPITULASI LAPORAN HAFALAN SANTRI';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '065F46' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const periodText = month && year 
      ? `${monthNames[month - 1]} ${year}` 
      : (year ? `Tahun ${year}` : (month ? `Bulan ${monthNames[month - 1]}` : 'Semua Periode'));

    worksheet.mergeCells('A2:L2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `Lembaga: ${recap.organizationName} | Periode: ${periodText} | Diunduh: ${new Date().toLocaleDateString('id-ID')}`;
    subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFFFFF' } };
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '047857' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 22;

    // Blank row
    worksheet.addRow([]);

    // Table Header Row at Row 4
    const headerRow = worksheet.addRow([
      'No',
      'Tanggal',
      'Nama Santri',
      'Wali Murid',
      'Kelompok / Kelas',
      'Ustadz / Pembimbing',
      'Nama Surat',
      'Ayat Mulai',
      'Ayat Selesai',
      'Jumlah Ayat',
      'Predikat',
      'Catatan Ustadz'
    ]);
    headerRow.height = 24;
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });

    // Set Column Widths
    worksheet.columns = [
      { key: 'no', width: 6 },
      { key: 'date', width: 14 },
      { key: 'santriName', width: 26 },
      { key: 'parentName', width: 22 },
      { key: 'kelasName', width: 22 },
      { key: 'ustadzName', width: 22 },
      { key: 'surahName', width: 22 },
      { key: 'ayatStart', width: 12 },
      { key: 'ayatEnd', width: 12 },
      { key: 'totalAyat', width: 13 },
      { key: 'predikat', width: 16 },
      { key: 'notes', width: 32 },
    ];

    // Add Rows Data
    recap.records.forEach((h: any, index: number) => {
      const ustadz = h.santri?.kelas?.user?.name || h.user?.name || '-';
      const row = worksheet.addRow([
        index + 1,
        new Date(h.date).toLocaleDateString('id-ID'),
        h.santri?.name || '-',
        h.santri?.parentName || '-',
        h.santri?.kelas?.name || '-',
        ustadz,
        `QS. ${h.surahName} (${h.surahNumber})`,
        h.ayatStart,
        h.ayatEnd,
        h.ayatEnd - h.ayatStart + 1,
        h.predikat,
        h.notes || '-',
      ]);

      row.height = 20;

      // Cell formatting
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };

      // Highlight Predikat colors
      const predikatCell = row.getCell(11);
      if (h.predikat === 'MUMTAZ') {
        predikatCell.font = { color: { argb: '047857' }, bold: true };
      } else if (h.predikat === 'ULANG') {
        predikatCell.font = { color: { argb: 'B91C1C' }, bold: true };
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E5E7EB' } },
          left: { style: 'thin', color: { argb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
          right: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

