import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export interface EnvSettings {
  superadminPhone: string;
  telegramBotToken: string;
  telegramChatId: string;
  waGatewayUrl: string;
}

export interface TelegramBotInfo {
  id: number;
  username?: string;
  firstName?: string;
  canJoinGroups?: boolean;
}

export interface TelegramStatusData {
  configured: boolean;
  connected: boolean;
  botInfo: TelegramBotInfo | null;
  chatId: string | null;
  error: string | null;
  lastChecked: string;
}

export interface TelegramTestBackupResponse {
  success: boolean;
  message: string;
  backup: {
    backupId: string;
    filename: string;
    checksum: string;
    sizeBytes: number;
    createdAt: string;
  };
  telegramConfigured: boolean;
}

export function useEnvSettings() {
  return useQuery({
    queryKey: ['env-settings'],
    queryFn: async () => {
      const res = await api.get<EnvSettings>('/settings/env');
      return (res as any).data as EnvSettings;
    }
  });
}

export function useUpdateEnvSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<EnvSettings>) => {
      const res = await api.put<EnvSettings>('/settings/env', data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['env-settings'] });
      queryClient.invalidateQueries({ queryKey: ['telegram-status'] });
      toast.success('Pengaturan sistem berhasil disimpan');
    },
    onError: (error: any) => {
      toast.error(error.message || error.response?.data?.message || 'Gagal menyimpan pengaturan sistem');
    }
  });
}

export function useTelegramStatus() {
  return useQuery({
    queryKey: ['telegram-status'],
    queryFn: async () => {
      const res = await api.get<TelegramStatusData>('/settings/telegram/status');
      return ((res as any).data || res) as TelegramStatusData;
    },
    refetchOnWindowFocus: true,
  });
}

export function useTestTelegramConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { token?: string }) => {
      const res = await api.post<TelegramBotInfo>('/settings/telegram/test-connection', payload || {});
      return res;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['telegram-status'] });
      if (data.success) {
        toast.success(data.message || 'Bot Telegram berhasil terhubung!');
      } else {
        toast.error(data.message || data.error || 'Gagal terhubung ke Telegram');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menguji koneksi bot Telegram');
    }
  });
}

export function useSendTelegramTestMessage() {
  return useMutation({
    mutationFn: async (payload?: { chatId?: string }) => {
      const res = await api.post<{ success: boolean; message: string }>('/settings/telegram/test-message', payload || {});
      return res;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success(data.message || 'Pesan tes berhasil dikirim ke Telegram!');
      } else {
        toast.error(data.message || data.error || 'Gagal mengirim pesan tes');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal mengirim pesan tes ke Telegram');
    }
  });
}

export function useTestTelegramBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<TelegramTestBackupResponse>('/settings/telegram/test-backup');
      return res;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
      queryClient.invalidateQueries({ queryKey: ['telegram-status'] });
      toast.success(data.message || 'Uji backup cloud Telegram berhasil!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menjalankan uji coba backup ke Telegram');
    }
  });
}
