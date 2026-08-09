import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface NotificationLogItem {
  _id: string;
  userId: string;
  santriId?: string | null;
  recipientPhone: string;
  recipientName: string;
  type: 'HAFALAN_NEW' | 'MURAJAAH_SCHEDULE' | 'SYSTEM_ALERT' | 'REGISTRATION';
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  errorMessage?: string | null;
  retryCount: number;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}

export interface NotificationListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useNotificationHistory(params: NotificationListParams = {}) {
  const { page = 1, limit = 10, status = '', type = '' } = params;

  return useQuery({
    queryKey: ['notification-history', { page, limit, status, type }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (status) queryParams.append('status', status);
      if (type) queryParams.append('type', type);

      const res = await api.get<NotificationLogItem[]>(`/notifications?${queryParams.toString()}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memuat riwayat notifikasi');
      }
      return {
        logs: res.data || [],
        meta: (res as any).meta as NotificationListMeta,
      };
    },
  });
}
