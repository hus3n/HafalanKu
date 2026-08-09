import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface BackupLogItem {
  _id: string;
  userId: string;
  filename: string;
  checksum: string;
  sizeBytes: number;
  status: 'SUCCESS' | 'FAILED' | 'RESTORED';
  telegramSent: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface CreateBackupResponse {
  backupId: string;
  filename: string;
  checksum: string;
  sizeBytes: number;
  encryptedData: string;
  createdAt: string;
}

export interface RestoreBackupPayload {
  encryptedData: string;
  checksum: string;
}

export interface RestoreBackupResponse {
  success: boolean;
  message: string;
  totalRestored: {
    santri: number;
    kelas: number;
    hafalan: number;
  };
}

/**
 * Trigger file download on client browser for created backup payload.
 */
export function downloadBackupFile(data: CreateBackupResponse) {
  const fileContent = JSON.stringify({
    app: 'HafalanKu',
    version: '1.0',
    filename: data.filename,
    checksum: data.checksum,
    sizeBytes: data.sizeBytes,
    createdAt: data.createdAt,
    encryptedData: data.encryptedData,
  }, null, 2);

  const blob = new Blob([fileContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = data.filename.endsWith('.hfk') ? data.filename : `${data.filename}.hfk`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Hook to fetch history of backup & restore logs.
 */
export function useBackupHistory() {
  return useQuery({
    queryKey: ['backup-history'],
    queryFn: async () => {
      const res = await api.get<BackupLogItem[]>('/backup/history');
      if (!res.success) {
        throw new Error(res.message || 'Gagal memuat riwayat backup');
      }
      return res.data || [];
    },
  });
}

/**
 * Hook to create a new backup.
 */
export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<CreateBackupResponse>('/backup/create');
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal membuat backup data');
      }
      return res.data;
    },
    onSuccess: (data) => {
      // Automatically download the file
      downloadBackupFile(data);
      // Invalidate backup history list
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
    },
  });
}

/**
 * Hook to restore database from backup payload.
 */
export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RestoreBackupPayload) => {
      const res = (await api.post<any>('/backup/restore', payload)) as any;
      if (!res.success) {
        throw new Error(res.message || 'Gagal melakukan restore data');
      }
      const restoredData = res.totalRestored ? res : res.data;
      return restoredData as RestoreBackupResponse;
    },
    onSuccess: () => {
      // Invalidate all app queries since database was restored
      queryClient.invalidateQueries();
    },
  });
}
