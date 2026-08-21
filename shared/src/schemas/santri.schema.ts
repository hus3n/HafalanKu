import { z } from 'zod';

export const createSantriSchema = z.object({
  name: z.string().min(2, 'Nama santri minimal 2 karakter'),
  parentName: z.string().min(2, 'Nama wali murid minimal 2 karakter'),
  parentPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Nomor WhatsApp wali murid harus valid (format internasional e.g. 628123456789)'),
  kelasId: z.string().uuid('Format kelas tidak valid').nullable().optional(),
});

export const updateSantriSchema = z.object({
  name: z.string().min(2, 'Nama santri minimal 2 karakter').optional(),
  parentName: z.string().min(2, 'Nama wali murid minimal 2 karakter').optional(),
  parentPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Nomor WhatsApp wali murid harus valid (format internasional e.g. 628123456789)').optional(),
  kelasId: z.string().uuid('Format kelas tidak valid').nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createKelasSchema = z.object({
  name: z.string().min(2, 'Nama kelas minimal 2 karakter'),
  description: z.string().max(200, 'Deskripsi maksimal 200 karakter').optional().nullable(),
  userId: z.string().uuid('Format ID Ustadz tidak valid').optional().nullable(),
});

export const bulkImportRowSchema = z.object({
  namaSantri: z.string().min(2, 'Nama santri minimal 2 karakter'),
  namaWali: z.string().min(2, 'Nama wali murid minimal 2 karakter'),
  noHpWali: z.string().min(6, 'Nomor HP wali tidak valid'),
  namaKelas: z.string().optional().nullable(),
  capaianHafalan: z.string().optional().nullable(),
});

export const executeBulkImportSchema = z.object({
  rows: z.array(bulkImportRowSchema).min(1, 'Data import tidak boleh kosong'),
});

export type CreateSantriInput = z.infer<typeof createSantriSchema>;
export type UpdateSantriInput = z.infer<typeof updateSantriSchema>;
export type CreateKelasInput = z.infer<typeof createKelasSchema>;
export type BulkImportRow = z.infer<typeof bulkImportRowSchema>;
export type ExecuteBulkImportInput = z.infer<typeof executeBulkImportSchema>;
