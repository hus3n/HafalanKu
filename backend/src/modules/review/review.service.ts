import { prisma } from '../../config/database';
import { CreateReviewInput } from './review.schema';

const DEFAULT_FALLBACK_REVIEWS = [
  {
    id: 'seed-review-1',
    name: 'Ustadz Faisal Ridwan',
    roleOrTitle: 'Koordinator Tahfidz TPQ Baitul Qur\'an',
    rating: 5,
    comment: 'Alhamdulillah, HafalanKu sangat mempermudah pemantauan setoran dan jadwal murajaah santri kami. Fitur integrasi WhatsApp ke wali santri membuat orang tua lebih proaktif mendampingi ananda di rumah.',
    imageUrl: null,
    userAvatarUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-review-2',
    name: 'Ibu Hj. Siti Nurhaliza',
    roleOrTitle: 'Wali Santri Kelas Juz \'Amma',
    rating: 5,
    comment: 'Sangat bersyukur dengan adanya HafalanKu. Setiap kali anak saya setor hafalan di madrasah, langsung ada laporan rekap dan notifikasi murajaah di WhatsApp. Tampilan aplikasinya sangat rapi dan mudah dimengerti.',
    imageUrl: null,
    userAvatarUrl: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed-review-3',
    name: 'Ustadz M. Syarif Hidayatullah',
    roleOrTitle: 'Pengasuh Pesantren Tahfidz Nurul Huda',
    rating: 5,
    comment: 'Platform manajemen tahfidz paling lengkap dan modern. Rekap mutabaah otomatis, sistem penilaian mumtaz hingga maqbul sangat terstruktur. Sangat kami rekomendasikan untuk pondok pesantren dan rumah tahfidz.',
    imageUrl: null,
    userAvatarUrl: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export class ReviewService {
  async createReview(input: CreateReviewInput, userId?: string) {
    // Save to database
    const newReview = await (prisma as any).review.create({
      data: {
        name: input.name,
        roleOrTitle: input.roleOrTitle || null,
        rating: input.rating,
        comment: input.comment,
        imageUrl: input.imageUrl || null,
        userAvatarUrl: input.userAvatarUrl || null,
        userId: userId || null,
        isApproved: true,
      },
    });

    return newReview;
  }

  async getLatestReviews(limit: number = 3) {
    try {
      const reviews = await (prisma as any).review.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          roleOrTitle: true,
          rating: true,
          comment: true,
          imageUrl: true,
          userAvatarUrl: true,
          createdAt: true,
        },
      });

      if (!reviews || reviews.length === 0) {
        return DEFAULT_FALLBACK_REVIEWS.slice(0, limit);
      }

      return reviews;
    } catch (error) {
      console.warn('[ReviewService] Notice fetching reviews:', error);
      return DEFAULT_FALLBACK_REVIEWS.slice(0, limit);
    }
  }

  async getAllReviews(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const [reviews, total, aggregate] = await Promise.all([
        (prisma as any).review.findMany({
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            roleOrTitle: true,
            rating: true,
            comment: true,
            imageUrl: true,
            userAvatarUrl: true,
            createdAt: true,
          },
        }),
        (prisma as any).review.count({ where: { isApproved: true } }),
        (prisma as any).review.aggregate({
          where: { isApproved: true },
          _avg: { rating: true },
        }),
      ]);

      if (total === 0) {
        return {
          reviews: DEFAULT_FALLBACK_REVIEWS,
          total: DEFAULT_FALLBACK_REVIEWS.length,
          totalPages: 1,
          page: 1,
          averageRating: 5.0,
        };
      }

      return {
        reviews,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        averageRating: Number((aggregate._avg.rating || 5.0).toFixed(1)),
      };
    } catch (error) {
      console.warn('[ReviewService] Notice getting all reviews:', error);
      return {
        reviews: DEFAULT_FALLBACK_REVIEWS,
        total: DEFAULT_FALLBACK_REVIEWS.length,
        totalPages: 1,
        page: 1,
        averageRating: 5.0,
      };
    }
  }
}

export const reviewService = new ReviewService();
