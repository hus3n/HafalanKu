import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_BASE_URL } from '../lib/api';
import { CreateSantriInput, UpdateSantriInput, BulkImportRow, BulkImportMode } from 'shared';

export interface SantriItem {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  kelasId?: string | null;
  kelas?: {
    id: string;
    name: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SantriListParams {
  page?: number;
  limit?: number;
  search?: string;
  kelasId?: string;
}

export interface SantriListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useSantriList(params: SantriListParams = {}) {
  const { page = 1, limit = 10, search = '', kelasId = '' } = params;

  return useQuery({
    queryKey: ['santri-list', { page, limit, search, kelasId }],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (search) queryParams.append('search', search);
        if (kelasId) queryParams.append('kelasId', kelasId);

        const res = await api.get<SantriItem[]>(`/santri?${queryParams.toString()}`);
        if (res.success && res.data) {
          return {
            santri: res.data || [],
            meta: ((res as any).meta as SantriListMeta) || { total: res.data.length, page: 1, limit: 10, totalPages: 1 },
          };
        }
      } catch {
        // Fallback demo data
      }

      const mockSantriList: SantriItem[] = [
        { id: '1', name: 'Ahmad Zaki Al-Faruq', parentName: 'H. Abdullah', parentPhone: '081234567890', kelas: { id: 'k1', name: 'Kelas Ula A' }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', name: 'Siti Nurhaliza', parentName: 'Bpk. Hendra', parentPhone: '081987654321', kelas: { id: 'k1', name: 'Kelas Ula A' }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', name: 'Muhammad Rizky Pratama', parentName: 'Bpk. Faisal', parentPhone: '085678901234', kelas: { id: 'k2', name: 'Kelas Wustha B' }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '4', name: 'Fatimah Az-Zahra', parentName: 'Hj. Aminah', parentPhone: '082134567890', kelas: { id: 'k2', name: 'Kelas Wustha B' }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '5', name: 'Umar Al-Faruq', parentName: 'Bpk. Rahman', parentPhone: '087812345678', kelas: { id: 'k3', name: 'Kelas Ulya C' }, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];

      return {
        santri: mockSantriList,
        meta: { total: mockSantriList.length, page: 1, limit: 10, totalPages: 1 },
      };
    },
  });
}

export function useSantriDetail(id: string) {
  return useQuery({
    queryKey: ['santri-detail', id],
    queryFn: async () => {
      const res = await api.get<SantriItem>(`/santri/${id}`);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memuat detail santri');
      }
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSantriInput) => {
      const res = await api.post<SantriItem>('/santri', data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menambahkan santri');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSantriInput }) => {
      const res = await api.put<SantriItem>(`/santri/${id}`, data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memperbarui data santri');
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['santri-list'] });
      queryClient.invalidateQueries({ queryKey: ['santri-detail', variables.id] });
    },
  });
}

export function useDeleteSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/santri/${id}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menghapus santri');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// ==========================================
// BULK IMPORT & EXPORT HOOKS & UTILITIES
// ==========================================

export interface BulkImportPreviewResult {
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    totalSantri: number;
    totalKelas: number;
    totalHafalanRecords: number;
    currentSantriCount: number;
    remainingQuota: number;
    existingMatchCount?: number;
    newSantriCount?: number;
    isQuotaExceeded: boolean;
    isQuotaExceededMerge?: boolean;
    isQuotaExceededReplace?: boolean;
  };
  rows: Array<{
    rowNumber: number;
    namaSantri: string;
    namaWali: string;
    noHpWali: string;
    namaKelas: string;
    capaianHafalan: string;
    parsedHafalanCount: number;
    parsedSurahsSummary: string;
    isExistingSantri?: boolean;
    isValid: boolean;
    errorMessage?: string;
  }>;
}

export interface BulkImportExecutionStats {
  mode: BulkImportMode;
  createdSantriCount: number;
  updatedSantriCount: number;
  replacedSantriCount: number;
  createdKelasCount: number;
  createdHafalanCount: number;
}

export function useBulkImportPreview() {
  return useMutation({
    mutationFn: async (fileBase64: string): Promise<BulkImportPreviewResult> => {
      const res = await api.post<BulkImportPreviewResult>('/santri/preview-import', { fileBase64 });
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memproses pratinjau file Excel');
      }
      return res.data;
    },
  });
}

export function useBulkImportExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rows, mode = 'MERGE' }: { rows: BulkImportRow[]; mode?: BulkImportMode }) => {
      const res = await api.post<BulkImportExecutionStats>(
        '/santri/execute-import',
        { rows, mode }
      );
      if (!res.success) {
        throw new Error(res.message || 'Gagal menyimpan data impor');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri-list'] });
      queryClient.invalidateQueries({ queryKey: ['rekap-global'] });
      queryClient.invalidateQueries({ queryKey: ['hafalan-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['kelas-list'] });
    },
  });
}

export async function downloadImportTemplate() {
  const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token);
  const res = await fetch(`${API_BASE_URL}/santri/template-import`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Gagal mengunduh template Excel');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Template_Import_HafalanKu.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadFullSantriData(kelasId?: string) {
  const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token);
  const queryParams = new URLSearchParams();
  if (kelasId) queryParams.append('kelasId', kelasId);

  const res = await fetch(`${API_BASE_URL}/santri/export-full?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Gagal mengunduh data lengkap santri');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Data_Lengkap_Santri_HafalanKu_${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
