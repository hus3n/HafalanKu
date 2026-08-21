import ExcelJS from 'exceljs';
import { prisma } from '../../config/database';
import { 
  CreateSantriInput, 
  UpdateSantriInput, 
  BulkImportRow, 
  surahList, 
  parseHafalanNotation, 
  compressHafalanNotation 
} from 'shared';
import { encrypt, decrypt } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';
import { DashboardService } from '../dashboard/dashboard.service';

export class SantriService {
  async createSantri(currentUser: { userId: string; role: string; orgId?: string | null }, data: CreateSantriInput) {
    if (currentUser.role === 'USER' && !currentUser.orgId) {
      const MAX_SANTRI_PERORANGAN = 20;
      const count = await prisma.santri.count({
        where: { userId: currentUser.userId, deletedAt: null }
      });
      if (count >= MAX_SANTRI_PERORANGAN) {
        throw new AppError(`Batas maksimal ${MAX_SANTRI_PERORANGAN} santri untuk pengguna perorangan telah tercapai.`, 403);
      }
    }

    // Encrypt parent phone
    const encryptedPhone = encrypt(data.parentPhone);

    const santri = await prisma.santri.create({
      data: {
        name: data.name,
        parentName: data.parentName,
        parentPhone: encryptedPhone,
        kelasId: data.kelasId || null,
        userId: currentUser.userId,
      },
    });

    return {
      ...santri,
      parentPhone: data.parentPhone, // Return unencrypted for the immediate response
    };
  }

  private buildAccessWhere(user: { userId: string; role: string; orgId?: string | null }) {
    if (user.role === 'SUPERADMIN') return {};
    if (user.role === 'USER') {
      return {
        OR: [
          { userId: user.userId },
          { kelas: { userId: user.userId } }
        ]
      };
    }
    if (user.orgId) {
      return {
        user: { organizationId: user.orgId }
      };
    }
    return { userId: user.userId };
  }

  async getSantriList(user: { userId: string; role: string; orgId?: string | null }, page: number, limit: number, search?: string, kelasId?: string) {
    const skip = (page - 1) * limit;

    const accessWhere = this.buildAccessWhere(user);

    const where: any = {
      ...accessWhere,
      deletedAt: null, // BR-06: Soft delete
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (kelasId) {
      where.kelasId = kelasId;
    }

    const [total, santris] = await Promise.all([
      prisma.santri.count({ where }),
      prisma.santri.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          kelas: {
            select: { id: true, name: true }
          }
        }
      }),
    ]);

    // Decrypt phones
    const decryptedSantris = santris.map((s: any) => {
      let phone = s.parentPhone;
      try {
        phone = decrypt(phone);
      } catch (e) {
        // Fallback if not encrypted or bad format
      }
      return { ...s, parentPhone: phone };
    });

    return {
      data: decryptedSantris,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSantriById(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildAccessWhere(user);
    
    const santri = await prisma.santri.findFirst({
      where: {
        id,
        ...accessWhere,
        deletedAt: null,
      },
      include: {
        kelas: {
          select: { id: true, name: true }
        }
      }
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    let phone = santri.parentPhone;
    try {
      phone = decrypt(phone);
    } catch (e) {
      // Ignore
    }

    return { ...santri, parentPhone: phone };
  }

  async updateSantri(user: { userId: string; role: string; orgId?: string | null }, id: string, data: UpdateSantriInput) {
    const accessWhere = this.buildAccessWhere(user);

    const existing = await prisma.santri.findFirst({
      where: { id, ...accessWhere, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    const updateData: any = { ...data };
    
    if (data.parentPhone) {
      updateData.parentPhone = encrypt(data.parentPhone);
    }

    const updated = await prisma.santri.update({
      where: { id },
      data: updateData,
    });

    // Decrypt phone for response
    let phone = updated.parentPhone;
    try {
      phone = decrypt(phone);
    } catch (e) {
      // Ignore
    }

    return { ...updated, parentPhone: phone };
  }

  async softDeleteSantri(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildAccessWhere(user);

    const existing = await prisma.santri.findFirst({
      where: { id, ...accessWhere, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    await prisma.santri.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Santri berhasil dihapus (soft delete)' };
  }

  // ==========================================
  // BULK IMPORT & EXPORT EXCEL FEATURES
  // ==========================================

  /**
   * Menghasilkan file Excel template impor 5 kolom resmi dengan panduan pengisian
   */
  async generateImportTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HafalanKu System';
    workbook.created = new Date();

    // Sheet 1: Data Santri & Hafalan
    const sheetData = workbook.addWorksheet('Data Santri & Hafalan');

    // Header 5 Kolom Ringkas
    const headers = [
      'Nama Santri (Wajib)',
      'Nama Wali (Wajib)',
      'No HP / WA Wali (Wajib)',
      'Kelas / Kelompok (Opsional)',
      'Capaian Hafalan (Opsional)'
    ];

    const headerRow = sheetData.addRow(headers);
    headerRow.height = 28;
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0E8991' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });

    // Set Column Widths
    sheetData.columns = [
      { key: 'namaSantri', width: 28 },
      { key: 'namaWali', width: 24 },
      { key: 'noHpWali', width: 22 },
      { key: 'namaKelas', width: 26 },
      { key: 'capaianHafalan', width: 38 },
    ];

    // Contoh data variatif
    const sampleRows = [
      ['Ahmad Fauzi', 'Bapak Rahmat', '081234567890', 'Kelas Abu Bakar', 'Juz 30'],
      ['Zaidan Al-Farisi', 'Ibu Fatimah', '085712345678', 'Kelas Umar bin Khattab', 'Juz 30, Al-Mulk - Al-Qalam 21'],
      ['Maryam Salsabila', 'Bapak Hendra', '082198765432', 'Kelas Aisyah', 'An-Naba 11'],
      ['Bilal Al-Habasyi', 'Ibu Aminah', '081345678901', 'Kelas Abu Bakar', 'Juz 29, Juz 30'],
    ];

    sampleRows.forEach((r) => {
      const row = sheetData.addRow(r);
      row.height = 20;
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'E5E7EB' } },
          left: { style: 'thin', color: { argb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
          right: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
      row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Sheet 2: Panduan & Contoh Notasi
    const sheetGuide = workbook.addWorksheet('Panduan Notasi');
    sheetGuide.columns = [
      { width: 6 },
      { width: 32 },
      { width: 50 },
    ];

    sheetGuide.addRow(['No', 'Format Notasi', 'Penjelasan & Contoh']).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheetGuide.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0C313A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const guides = [
      [1, 'Juz 30', 'Otomatis mencatat seluruh 37 surat di Juz 30 dari ayat pertama sampai akhir.'],
      [2, 'Juz 29, Juz 30', 'Otomatis mencatat seluruh surat di Juz 29 dan Juz 30.'],
      [3, 'An-Naba 11', 'Mencatat Surat An-Naba dari ayat 1 sampai ayat 11.'],
      [4, 'Al-Mulk - Al-Qalam 21', 'Mencatat Surat Al-Mulk penuh (ayat 1-30) sampai Surat Al-Qalam ayat 21.'],
      [5, 'Juz 30, Al-Mulk - Al-Qalam 21', 'Mencatat seluruh Juz 30 + Surat Al-Mulk penuh + Surat Al-Qalam ayat 1-21.'],
      [6, 'Kosongkan Capaian Hafalan', 'Jika hanya ingin mendaftarkan identitas santri & kelas tanpa setoran hafalan awal.'],
    ];

    guides.forEach((g) => {
      const row = sheetGuide.addRow(g);
      row.height = 22;
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).font = { bold: true, color: { argb: '0E8991' } };
    });

    // Sheet 3: Daftar Surat Al-Quran
    const sheetSurah = workbook.addWorksheet('Daftar Surat Al-Quran');
    sheetSurah.columns = [
      { width: 8 },
      { width: 26 },
      { width: 20 },
      { width: 14 },
    ];

    sheetSurah.addRow(['No', 'Nama Surat (Latin)', 'Nama Surat (Arab)', 'Jumlah Ayat']).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheetSurah.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0E8991' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    surahList.forEach((s) => {
      const row = sheetSurah.addRow([s.number, s.latinName, s.name, s.numberOfAyah]);
      row.height = 18;
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Parse & Preview file Excel sebelum eksekusi impor
   */
  async previewBulkImport(
    user: { userId: string; role: string; orgId?: string | null },
    fileBase64: string
  ) {
    const buffer = Buffer.from(fileBase64, 'base64');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new AppError('File Excel tidak memiliki lembar kerja (worksheet) yang valid.', 400);
    }

    const rows: Array<{
      rowNumber: number;
      namaSantri: string;
      namaWali: string;
      noHpWali: string;
      namaKelas: string;
      capaianHafalan: string;
      parsedHafalanCount: number;
      parsedSurahsSummary: string;
      isValid: boolean;
      errorMessage?: string;
    }> = [];

    const distinctSantriNames = new Set<string>();
    const distinctKelasNames = new Set<string>();
    let totalHafalanRecords = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const namaSantri = String(row.getCell(1).value || '').trim();
      const namaWali = String(row.getCell(2).value || '').trim();
      let noHpWali = String(row.getCell(3).value || '').trim();
      const namaKelas = String(row.getCell(4).value || '').trim();
      const capaianHafalan = String(row.getCell(5).value || '').trim();

      // Skip completely empty rows
      if (!namaSantri && !namaWali && !noHpWali && !namaKelas && !capaianHafalan) {
        return;
      }

      // Sanitasi nomor HP: Ubah 08xxx menjadi 628xxx jika perlu
      if (noHpWali.startsWith('0')) {
        noHpWali = '62' + noHpWali.slice(1);
      }
      noHpWali = noHpWali.replace(/[^0-9+]/g, '');

      const parsedHafalan = parseHafalanNotation(capaianHafalan);
      totalHafalanRecords += parsedHafalan.length;

      let isValid = true;
      const errorMessages: string[] = [];

      if (!namaSantri || namaSantri.length < 2) {
        isValid = false;
        errorMessages.push('Nama santri minimal 2 karakter');
      }
      if (!namaWali || namaWali.length < 2) {
        isValid = false;
        errorMessages.push('Nama wali minimal 2 karakter');
      }
      if (!noHpWali || noHpWali.length < 6) {
        isValid = false;
        errorMessages.push('No HP/WA wali tidak valid');
      }

      if (namaSantri) distinctSantriNames.add(namaSantri.toLowerCase());
      if (namaKelas) distinctKelasNames.add(namaKelas.toLowerCase());

      const summaryText = parsedHafalan.length > 0
        ? `${parsedHafalan.length} surat (${parsedHafalan.slice(0, 2).map(s => s.surahName).join(', ')}${parsedHafalan.length > 2 ? ', ...' : ''})`
        : 'Tanpa catatan hafalan';

      rows.push({
        rowNumber,
        namaSantri,
        namaWali,
        noHpWali,
        namaKelas,
        capaianHafalan,
        parsedHafalanCount: parsedHafalan.length,
        parsedSurahsSummary: summaryText,
        isValid,
        errorMessage: errorMessages.length > 0 ? errorMessages.join(', ') : undefined,
      });
    });

    if (rows.length === 0) {
      throw new AppError('File Excel tidak memiliki data baris santri.', 400);
    }

    // Cek kuota santri perorangan
    let currentSantriCount = 0;
    let remainingQuota = 9999;
    let isQuotaExceeded = false;

    if (user.role === 'USER' && !user.orgId) {
      const MAX_SANTRI_PERORANGAN = 20;
      currentSantriCount = await prisma.santri.count({
        where: { userId: user.userId, deletedAt: null }
      });
      remainingQuota = Math.max(0, MAX_SANTRI_PERORANGAN - currentSantriCount);
      if (distinctSantriNames.size > remainingQuota) {
        isQuotaExceeded = true;
      }
    }

    return {
      summary: {
        totalRows: rows.length,
        validRows: rows.filter((r) => r.isValid).length,
        invalidRows: rows.filter((r) => !r.isValid).length,
        totalSantri: distinctSantriNames.size,
        totalKelas: distinctKelasNames.size,
        totalHafalanRecords,
        currentSantriCount,
        remainingQuota,
        isQuotaExceeded,
      },
      rows,
    };
  }

  /**
   * Eksekusi penyimpanan data impor massal ke Prisma DB
   */
  async executeBulkImport(
    user: { userId: string; role: string; orgId?: string | null },
    rows: BulkImportRow[]
  ) {
    if (!rows || rows.length === 0) {
      throw new AppError('Data impor tidak boleh kosong.', 400);
    }

    // 1. Cek Kuota
    if (user.role === 'USER' && !user.orgId) {
      const MAX_SANTRI_PERORANGAN = 20;
      const currentCount = await prisma.santri.count({
        where: { userId: user.userId, deletedAt: null }
      });
      const newSantriNames = new Set(rows.map(r => r.namaSantri.trim().toLowerCase()));
      if (currentCount + newSantriNames.size > MAX_SANTRI_PERORANGAN) {
        throw new AppError(`Impor ${newSantriNames.size} santri melebihi batas kuota (${MAX_SANTRI_PERORANGAN} santri). Sisa kuota: ${Math.max(0, MAX_SANTRI_PERORANGAN - currentCount)}`, 403);
      }
    }

    let createdKelasCount = 0;
    let createdSantriCount = 0;
    let createdHafalanCount = 0;

    // Eksekusi Transaction
    await prisma.$transaction(async (tx) => {
      // A. Kumpulkan dan Buat Kelas jika belum ada
      const kelasCache = new Map<string, string>(); // lowercase name -> id

      // Cari kelas yang sudah ada
      const existingKelas = await tx.kelas.findMany({
        where: { userId: user.userId },
        select: { id: true, name: true }
      });
      existingKelas.forEach(k => kelasCache.set(k.name.trim().toLowerCase(), k.id));

      for (const row of rows) {
        const kName = row.namaKelas?.trim();
        if (kName) {
          const kKey = kName.toLowerCase();
          if (!kelasCache.has(kKey)) {
            const newKelas = await tx.kelas.create({
              data: {
                name: kName,
                userId: user.userId,
              }
            });
            kelasCache.set(kKey, newKelas.id);
            createdKelasCount++;
          }
        }
      }

      // B. Kumpulkan dan Buat/Update Santri
      const santriCache = new Map<string, string>(); // lowercase name -> id

      // Cari santri yang sudah ada
      const existingSantri = await tx.santri.findMany({
        where: { userId: user.userId, deletedAt: null },
        select: { id: true, name: true }
      });
      existingSantri.forEach(s => santriCache.set(s.name.trim().toLowerCase(), s.id));

      const hafalanRecordsToCreate: Array<{
        santriId: string;
        surahNumber: number;
        surahName: string;
        ayatStart: number;
        ayatEnd: number;
        predikat: any;
        date: Date;
        isHafalanAwal: boolean;
        userId: string;
      }> = [];

      for (const row of rows) {
        const santriKey = row.namaSantri.trim().toLowerCase();
        let santriId = santriCache.get(santriKey);

        let kelasId: string | null = null;
        if (row.namaKelas?.trim()) {
          kelasId = kelasCache.get(row.namaKelas.trim().toLowerCase()) || null;
        }

        let cleanPhone = row.noHpWali.trim();
        if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
        cleanPhone = cleanPhone.replace(/[^0-9+]/g, '');

        if (!santriId) {
          const newSantri = await tx.santri.create({
            data: {
              name: row.namaSantri.trim(),
              parentName: row.namaWali.trim(),
              parentPhone: encrypt(cleanPhone),
              kelasId,
              userId: user.userId,
            }
          });
          santriId = newSantri.id;
          santriCache.set(santriKey, santriId);
          createdSantriCount++;
        }

        // Parse & siapkan hafalan
        if (row.capaianHafalan?.trim()) {
          const parsedList = parseHafalanNotation(row.capaianHafalan);
          const now = new Date();

          for (const item of parsedList) {
            hafalanRecordsToCreate.push({
              santriId,
              surahNumber: item.surahNumber,
              surahName: item.surahName,
              ayatStart: item.ayatStart,
              ayatEnd: item.ayatEnd,
              predikat: 'JAYYID',
              date: now,
              isHafalanAwal: true,
              userId: user.userId,
            });
          }
        }
      }

      // C. Insert Hafalan Records (Cegah duplikat)
      if (hafalanRecordsToCreate.length > 0) {
        // Find existing to avoid exact duplicate surahs for santri
        const santriIds = Array.from(new Set(hafalanRecordsToCreate.map(h => h.santriId)));
        const existingHafalan = await tx.hafalan.findMany({
          where: { santriId: { in: santriIds } },
          select: { santriId: true, surahNumber: true }
        });
        const existingSet = new Set(existingHafalan.map(h => `${h.santriId}_${h.surahNumber}`));

        const finalHafalan = hafalanRecordsToCreate.filter(
          h => !existingSet.has(`${h.santriId}_${h.surahNumber}`)
        );

        if (finalHafalan.length > 0) {
          await tx.hafalan.createMany({
            data: finalHafalan,
          });
          createdHafalanCount = finalHafalan.length;
        }
      }
    });

    // Invalidate Redis dashboard cache
    await DashboardService.invalidateCache(user.userId);

    return {
      success: true,
      message: `Impor berhasil diselesaikan: ${createdSantriCount} santri, ${createdKelasCount} kelas, dan ${createdHafalanCount} catatan hafalan.`,
      stats: {
        createdSantriCount,
        createdKelasCount,
        createdHafalanCount,
      }
    };
  }

  /**
   * Ekspor seluruh data santri, kelas, kontak wali, dan riwayat hafalan ke file Excel multi-sheet
   */
  async exportFullSantriData(
    user: { userId: string; role: string; orgId?: string | null },
    kelasId?: string
  ): Promise<Buffer> {
    const accessWhere = this.buildAccessWhere(user);
    const where: any = {
      ...accessWhere,
      deletedAt: null,
    };
    if (kelasId) {
      where.kelasId = kelasId;
    }

    const santris = await prisma.santri.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        kelas: { select: { name: true } },
        hafalan: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            surahNumber: true,
            surahName: true,
            ayatStart: true,
            ayatEnd: true,
            predikat: true,
            date: true,
            notes: true,
          }
        }
      }
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HafalanKu System';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: Master Santri & Capaian Ringkas
    // ==========================================
    const sheet1 = workbook.addWorksheet('Data Santri & Capaian');

    // Title Row
    sheet1.mergeCells('A1:H1');
    const titleCell1 = sheet1.getCell('A1');
    titleCell1.value = 'DATA MASTER SANTRI & CAPAIAN HAFALAN';
    titleCell1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0C313A' } };
    titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet1.getRow(1).height = 30;

    sheet1.mergeCells('A2:H2');
    const subCell1 = sheet1.getCell('A2');
    subCell1.value = `Total Santri: ${santris.length} | Waktu Ekspor: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    subCell1.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFFFFF' } };
    subCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0E8991' } };
    subCell1.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet1.getRow(2).height = 20;

    sheet1.addRow([]); // Blank row

    const headers1 = [
      'No',
      'Nama Santri',
      'Kelas / Kelompok',
      'Nama Wali Murid',
      'No HP / WA Wali',
      'Capaian Hafalan (Ringkas)',
      'Total Surat',
      'Tanggal Terdaftar'
    ];

    const hRow1 = sheet1.addRow(headers1);
    hRow1.height = 24;
    hRow1.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    hRow1.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0E8991' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
    });

    sheet1.columns = [
      { key: 'no', width: 6 },
      { key: 'namaSantri', width: 28 },
      { key: 'kelas', width: 22 },
      { key: 'namaWali', width: 22 },
      { key: 'noHpWali', width: 20 },
      { key: 'capaianHafalan', width: 38 },
      { key: 'totalSurat', width: 14 },
      { key: 'createdAt', width: 18 },
    ];

    santris.forEach((s: any, idx: number) => {
      let phone = s.parentPhone;
      try {
        phone = decrypt(phone);
      } catch (e) {
        // Ignore
      }

      const conciseNotation = compressHafalanNotation(s.hafalan || []);

      const row = sheet1.addRow([
        idx + 1,
        s.name,
        s.kelas?.name || 'Tanpa Kelas',
        s.parentName,
        phone,
        conciseNotation,
        s.hafalan?.length || 0,
        new Date(s.createdAt).toLocaleDateString('id-ID'),
      ]);

      row.height = 20;
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E5E7EB' } },
          left: { style: 'thin', color: { argb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
          right: { style: 'thin', color: { argb: 'E5E7EB' } }
        };
      });
    });

    // ==========================================
    // SHEET 2: Rincian Seluruh Setoran Hafalan
    // ==========================================
    const sheet2 = workbook.addWorksheet('Rincian Setoran Hafalan');

    sheet2.mergeCells('A1:J1');
    const titleCell2 = sheet2.getCell('A1');
    titleCell2.value = 'RINCIAN RIWAYAT SELURUH SETORAN HAFALAN';
    titleCell2.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0C313A' } };
    titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet2.getRow(1).height = 30;

    sheet2.addRow([]);

    const headers2 = [
      'No',
      'Tanggal Setoran',
      'Nama Santri',
      'Kelas / Kelompok',
      'Nama Wali',
      'No HP / WA Wali',
      'Nama Surat',
      'Rentang Ayat',
      'Predikat',
      'Catatan'
    ];

    const hRow2 = sheet2.addRow(headers2);
    hRow2.height = 24;
    hRow2.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    hRow2.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0E8991' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
    });

    sheet2.columns = [
      { key: 'no', width: 6 },
      { key: 'date', width: 16 },
      { key: 'namaSantri', width: 26 },
      { key: 'kelas', width: 22 },
      { key: 'namaWali', width: 22 },
      { key: 'noHpWali', width: 20 },
      { key: 'surah', width: 24 },
      { key: 'ayat', width: 16 },
      { key: 'predikat', width: 16 },
      { key: 'notes', width: 28 },
    ];

    let hafalanRowIndex = 1;
    santris.forEach((s: any) => {
      let phone = s.parentPhone;
      try {
        phone = decrypt(phone);
      } catch (e) {
        // Ignore
      }

      (s.hafalan || []).forEach((h: any) => {
        const row = sheet2.addRow([
          hafalanRowIndex++,
          new Date(h.date).toLocaleDateString('id-ID'),
          s.name,
          s.kelas?.name || '-',
          s.parentName,
          phone,
          `QS. ${h.surahName} (${h.surahNumber})`,
          `Ayat ${h.ayatStart} - ${h.ayatEnd}`,
          h.predikat,
          h.notes || '-',
        ]);

        row.height = 20;
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
        row.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E5E7EB' } },
            left: { style: 'thin', color: { argb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
            right: { style: 'thin', color: { argb: 'E5E7EB' } }
          };
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
