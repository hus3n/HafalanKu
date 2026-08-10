import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { CreateHafalanInput, UpdateHafalanInput } from 'shared';

export interface HafalanItem {
  id: string;
  santriId: string;
  surahNumber: number;
  surahName: string;
  ayatStart: number;
  ayatEnd: number;
  predikat: 'MUMTAZ' | 'JAYYID_JIDDAN' | 'JAYYID' | 'MAQBUL' | 'ULANG';
  date: string;
  notes?: string | null;
  createdAt: string;
  santri?: {
    id: string;
    name: string;
  };
}

export interface HafalanListParams {
  page?: number;
  limit?: number;
  santriId?: string;
  surahNumber?: number;
  predikat?: string;
  isHafalanAwal?: boolean;
}

export interface HafalanListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useHafalanList(params: HafalanListParams = {}) {
  const { page = 1, limit = 10, santriId = '', surahNumber, predikat = '', isHafalanAwal } = params;

  return useQuery({
    queryKey: ['hafalan-list', { page, limit, santriId, surahNumber, predikat, isHafalanAwal }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (santriId) queryParams.append('santriId', santriId);
      if (surahNumber) queryParams.append('surahNumber', surahNumber.toString());
      if (predikat) queryParams.append('predikat', predikat);
      if (typeof isHafalanAwal === 'boolean') queryParams.append('isHafalanAwal', isHafalanAwal.toString());

      const res = await api.get<HafalanItem[]>(`/hafalan?${queryParams.toString()}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memuat riwayat hafalan');
      }
      return {
        hafalan: res.data || [],
        meta: (res as any).meta as HafalanListMeta,
      };
    },
  });
}

export function useCreateHafalan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHafalanInput) => {
      const res = await api.post<HafalanItem>('/hafalan', data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal mencatat setoran hafalan');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hafalan-list'] });
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteHafalan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/hafalan/${id}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menghapus data hafalan');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hafalan-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateHafalan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateHafalanInput }) => {
      const res = await api.put<HafalanItem>(`/hafalan/${id}`, data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal mengubah data hafalan');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hafalan-list'] });
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export interface RekapGlobalItem {
  santriId: string;
  santriName: string;
  kelasName: string;
  totalSurah: number;
  surahText: string;
  avgScore: number;
}

export function useRekapGlobalList(params: { page?: number; limit?: number; search?: string; kelasId?: string } = {}) {
  const { page = 1, limit = 10, search = '', kelasId = '' } = params;

  return useQuery({
    queryKey: ['hafalan-rekap-global', { page, limit, search, kelasId }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (kelasId) queryParams.append('kelasId', kelasId);

      const res = await api.get<RekapGlobalItem[]>(`/hafalan/rekap-global?${queryParams.toString()}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memuat rekap hafalan global');
      }
      return {
        rekap: res.data || [],
        meta: (res as any).meta as HafalanListMeta,
      };
    },
  });
}

export function useCreateBulkHafalan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { santriId: string, surahs: number[] }) => {
      const res = await api.post<{ count: number }>('/hafalan/bulk', data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menyimpan bulk hafalan');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hafalan-list'] });
      queryClient.invalidateQueries({ queryKey: ['hafalan-rekap-global'] });
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
