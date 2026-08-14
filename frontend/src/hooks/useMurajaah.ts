import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type MurajaahStatusType = 'SUDAH' | 'BELUM' | 'TIDAK_DIMURAJAAH';
export type NotificationStatusType = 'SENT' | 'PENDING' | 'QUEUED';

export interface SantriHafalanSurah {
  surahNumber: number;
  surahName: string;
  ayatRange?: string;
  lastHafalanDate?: string;
}

export interface MurajaahItem {
  id: string;
  date: string; // YYYY-MM-DD or ISO
  santriId: string;
  santriName: string;
  parentName: string;
  parentPhone: string;
  kelasId: string;
  kelasName: string;
  selectedSurahNumber: number;
  selectedSurahName: string;
  surahNumber: number;
  surahName: string;
  isSelected: boolean;
  priorityScore: number;
  lastReviewDate: string | null;
  ayatRange?: string;
  hafalanTodayText?: string;
  hafalanSurahs: SantriHafalanSurah[]; // Surat-surat yang HANYA sudah dihafal santri
  murajaahStatus: MurajaahStatusType; // 🟢 SUDAH | ⏳ BELUM | ❌ TIDAK_DIMURAJAAH
  notificationStatus: NotificationStatusType; // 📲 SENT | ⏳ PENDING
  lastNotificationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  santri?: {
    id: string;
    name: string;
    parentName?: string;
    parentPhone?: string;
    kelas?: { id: string; name: string } | null;
  };
  status?: string; // used for history
}

export interface SendWhatsAppResponse {
  success?: boolean;
  recipientPhone: string;
  parentName: string;
  santriName: string;
  messagePreview: string;
  status: string;
  error?: string | null;
}

export interface SendBatchWhatsAppResponse {
  total: number;
  successful: number;
  failed: number;
  details: Array<{
    santriId: string;
    success: boolean;
    recipientPhone?: string;
    parentName?: string;
    santriName?: string;
    status: string;
    error?: string | null;
  }>;
}

export function useMurajaahList(params: { santriId?: string; kelasId?: string } | string = {}) {
  const { santriId = '', kelasId = '' } = typeof params === 'string' ? { santriId: params } : params;

  return useQuery({
    queryKey: ['murajaah-list', { santriId, kelasId }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (santriId) queryParams.append('santriId', santriId);
      if (kelasId) queryParams.append('kelasId', kelasId);

      const res = await api.get<MurajaahItem[]>(`/murajaah?${queryParams.toString()}`);
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
  });
}

// Change selected surah for a santri from their memorized list
export function useChangeSurahMurajaah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, surahNumber, surahName, ayatRange }: { id: string; surahNumber: number; surahName: string; ayatRange?: string }) => {
      const res = await api.put<MurajaahItem>(`/murajaah/${id}`, { surahNumber, surahName, ayatRange });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal merubah surah target');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    },
  });
}

// Strictly update status ONLY when WhatsApp reply "sudah" is received from parent
export function useSimulateWaReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (santriId: string) => {
      const res = await api.post(`/murajaah/simulate-reply/${santriId}`, { message: 'sudah' });
      if (!res.success) {
        throw new Error(res.message || 'Gagal memproses simulasi balasan WhatsApp');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    },
  });
}

// Mark notification as sent
export function useMarkNotificationSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/murajaah/mark-notified/${id}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memperbarui status notifikasi');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    },
  });
}

export function useCreateMurajaah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ santriId, surahNumber, surahName }: { santriId: string; surahNumber: number; surahName: string }) => {
      const res = await api.post<MurajaahItem>('/murajaah', { santriId, surahNumber, surahName });
      if (!res.success) {
        throw new Error(res.message || 'Gagal menambahkan jadwal murajaah');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    },
  });
}

export function useMurajaahHistory(params: { santriId?: string; kelasId?: string } | string = {}) {
  const { santriId = '', kelasId = '' } = typeof params === 'string' ? { santriId: params } : params;

  return useQuery({
    queryKey: ['murajaah-history', { santriId, kelasId }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (santriId) queryParams.append('santriId', santriId);
      if (kelasId) queryParams.append('kelasId', kelasId);

      const res = await api.get<MurajaahItem[]>(`/murajaah/history?${queryParams.toString()}`);
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
  });
}

export function useSendWhatsAppMurajaah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (santriId: string): Promise<SendWhatsAppResponse> => {
      const res = await api.post<SendWhatsAppResponse>(`/murajaah/send/${santriId}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal mengirim pesan WhatsApp');
      }
      if (res.data) {
        return res.data;
      }
      return res as unknown as SendWhatsAppResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    },
  });
}

export function useSendBatchWhatsAppMurajaah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (santriIds: string[]): Promise<SendBatchWhatsAppResponse> => {
      const res = await api.post<SendBatchWhatsAppResponse>('/murajaah/send-batch', { santriIds });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memproses pengiriman massal WhatsApp');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    },
  });
}

export function useDeleteMurajaah() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/murajaah/${id}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menghapus jadwal murajaah');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    },
  });
}
