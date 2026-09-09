import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface AbsensiRecord {
  id: string;
  santriId: string;
  date: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  notes?: string;
  santri: {
    id: string;
    name: string;
    kelas?: { name: string };
  };
}

export function useAbsensiList(date: string, kelasId?: string) {
  return useQuery({
    queryKey: ['absensi-list', date, kelasId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      if (kelasId) queryParams.append('kelasId', kelasId);

      const res = await api.get<AbsensiRecord[]>(`/absensi?${queryParams.toString()}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memuat data absensi');
      }
      return res.data || [];
    },
  });
}

export function useBulkUpdateAbsensi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      date: string, 
      records: Array<{ santriId: string, status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA', notes?: string }> 
    }) => {
      const res = await api.post('/absensi/bulk', data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menyimpan data absensi');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absensi-list'] });
    },
  });
}
