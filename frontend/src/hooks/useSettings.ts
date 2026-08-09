import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export interface EnvSettings {
  superadminPhone: string;
  telegramBotToken: string;
  telegramChatId: string;
  waGatewayUrl: string;
}

export function useEnvSettings() {
  return useQuery({
    queryKey: ['env-settings'],
    queryFn: async () => {
      const res = await api.get('/settings/env');
      return (res.data as any).data as EnvSettings;
    }
  });
}

export function useUpdateEnvSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<EnvSettings>) => {
      const res = await api.put('/settings/env', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['env-settings'] });
      toast.success('Pengaturan sistem berhasil disimpan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan sistem');
    }
  });
}
