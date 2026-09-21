import { z } from 'zod';

export const createReviewSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  roleOrTitle: z.string().trim().max(100, 'Keterangan maksimal 100 karakter').optional(),
  rating: z.coerce.number().int().min(1, 'Rating minimal 1 bintang').max(5, 'Rating maksimal 5 bintang'),
  comment: z.string().trim().min(5, 'Ulasan minimal 5 karakter').max(1500, 'Ulasan maksimal 1500 karakter'),
  imageUrl: z.string().optional().nullable(),
  userAvatarUrl: z.string().optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
