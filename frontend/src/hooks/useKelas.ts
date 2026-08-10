import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { CreateKelasInput } from 'shared';

export interface KelasItem {
  id: string;
  name: string;
  description?: string | null;
  userId?: string;
  ustadzName?: string;
  totalSantri?: number;
  createdAt?: string;
  santri?: Array<{
    id: string;
    name: string;
    parentName: string;
    isActive: boolean;
  }>;
}

export function useKelasList(search?: string) {
  return useQuery({
    queryKey: ['kelas-list', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await api.get<KelasItem[]>(`/kelas?${params.toString()}`);
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
  });
}

export function useKelasDetail(id: string) {
  return useQuery({
    queryKey: ['kelas-detail', id],
    queryFn: async () => {
      const res = await api.get<KelasItem>(`/kelas/${id}`);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal mengambil detail kelas');
      }
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateKelas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateKelasInput) => {
      const res = await api.post<KelasItem>('/kelas', data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal membuat kelas baru');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateKelas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateKelasInput> }) => {
      const res = await api.put<KelasItem>(`/kelas/${id}`, data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memperbarui kelas');
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] });
      queryClient.invalidateQueries({ queryKey: ['kelas-detail', variables.id] });
    },
  });
}

export function useDeleteKelas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/kelas/${id}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menghapus kelas');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] });
      queryClient.invalidateQueries({ queryKey: ['santri-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAssignSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kelasId, santriId }: { kelasId: string; santriId: string }) => {
      const res = await api.post(`/kelas/${kelasId}/santri`, { santriId });
      if (!res.success) {
        throw new Error(res.message || 'Gagal memasukkan santri ke kelas');
      }
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kelas-detail', variables.kelasId] });
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] });
      queryClient.invalidateQueries({ queryKey: ['santri-list'] });
    },
  });
}

export function useUnassignSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kelasId, santriId }: { kelasId: string; santriId: string }) => {
      const res = await api.delete(`/kelas/${kelasId}/santri/${santriId}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal mengeluarkan santri dari kelas');
      }
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kelas-detail', variables.kelasId] });
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] });
      queryClient.invalidateQueries({ queryKey: ['santri-list'] });
    },
  });
}
