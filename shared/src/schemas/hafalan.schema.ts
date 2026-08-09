import { z } from 'zod';

export const createHafalanSchema = z.object({
  santriId: z.string().uuid('Format ID santri tidak valid'),
  surahNumber: z.number().int().min(1).max(114, 'Nomor surat harus antara 1-114'),
  ayatStart: z.number().int().min(1, 'Ayat mulai minimal 1'),
  ayatEnd: z.number().int().min(1, 'Ayat selesai minimal 1'),
  predikat: z.enum(['MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'MAQBUL', 'ULANG'], {
    required_error: 'Predikat penilaian wajib diisi',
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').or(z.date()),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable(),
}).refine((data) => data.ayatEnd >= data.ayatStart, {
  message: 'Ayat selesai tidak boleh lebih kecil dari ayat mulai',
  path: ['ayatEnd'],
});

export const updateHafalanSchema = z.object({
  surahNumber: z.number().int().min(1).max(114).optional(),
  ayatStart: z.number().int().min(1).optional(),
  ayatEnd: z.number().int().min(1).optional(),
  predikat: z.enum(['MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'MAQBUL', 'ULANG']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').or(z.date()).optional(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable(),
}).refine((data) => {
  if (data.ayatStart !== undefined && data.ayatEnd !== undefined) {
    return data.ayatEnd >= data.ayatStart;
  }
  return true;
}, {
  message: 'Ayat selesai tidak boleh lebih kecil dari ayat mulai',
  path: ['ayatEnd'],
});

export type CreateHafalanInput = z.infer<typeof createHafalanSchema>;
export type UpdateHafalanInput = z.infer<typeof updateHafalanSchema>;
