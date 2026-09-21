import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface ReviewItem {
  id: string;
  name: string;
  roleOrTitle?: string | null;
  rating: number;
  comment: string;
  imageUrl?: string | null;
  userAvatarUrl?: string | null;
  createdAt: string;
}

export interface CreateReviewPayload {
  name: string;
  roleOrTitle?: string;
  rating: number;
  comment: string;
  imageUrl?: string | null;
  userAvatarUrl?: string | null;
}

export interface ReviewsResponse {
  reviews: ReviewItem[];
  total: number;
  totalPages: number;
  page: number;
  averageRating: number;
}

export function useLatestReviews() {
  return useQuery<ReviewItem[]>({
    queryKey: ['reviews-latest'],
    queryFn: async () => {
      try {
        const res = await api.get<ReviewItem[]>('/public/reviews/latest');
        if (res.success && Array.isArray(res.data)) {
          return res.data;
        }
        return [];
      } catch (e) {
        console.warn('Failed to load latest reviews:', e);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
}

export function useAllReviews(page: number = 1, limit: number = 10) {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews-all', page, limit],
    queryFn: async () => {
      const res = await api.get<ReviewsResponse>(`/public/reviews?page=${page}&limit=${limit}`);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memuat ulasan');
      }
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      const res = await api.post<ReviewItem>('/public/reviews', payload);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal mengirim ulasan.');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews-latest'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-all'] });
    },
  });
}
