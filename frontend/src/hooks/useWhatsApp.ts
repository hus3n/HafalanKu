import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from './useAuth';

export interface WhatsAppStatusResponse {
  status: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING';
  phoneNumber?: string | null;
  lastConnectedAt?: string | null;
  qrCode?: string | null;
}

export interface WhatsAppInitResponse {
  status: string;
  qrCode: string;
  expiresInSeconds: number;
}

export function useWhatsAppStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['whatsapp-status', user?.id],
    queryFn: async () => {
      const res = await api.get<WhatsAppStatusResponse>('/whatsapp/status');
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memuat status WhatsApp');
      }
      return res.data;
    },
    enabled: !!user?.id,
    staleTime: 1000,
    refetchInterval: (query) => {
      // Poll every 2 seconds if status is PAIRING so UI updates the moment phone connects
      if (query.state.data?.status === 'PAIRING') {
        return 2000;
      }
      return false;
    },
  });
}

export function useInitWhatsAppSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<WhatsAppInitResponse>('/whatsapp/init');
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal generate QR Code pairing');
      }
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['whatsapp-status', user?.id], (old: any) => ({
        ...old,
        status: data.status,
        qrCode: data.qrCode,
      }));
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status', user?.id] });
    },
  });
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/whatsapp/disconnect');
      if (!res.success) {
        throw new Error(res.message || 'Gagal melepaskan koneksi WhatsApp');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.setQueryData(['whatsapp-status', user?.id], {
        status: 'DISCONNECTED',
        phoneNumber: null,
        lastConnectedAt: null,
        qrCode: null,
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status', user?.id] });
    },
  });
}

export function useSendWhatsAppMessage() {
  return useMutation({
    mutationFn: async (data: { recipientPhone: string; message: string }) => {
      const res = await api.post('/whatsapp/send', data);
      if (!res.success) {
        throw new Error(res.message || 'Gagal mengirim pesan');
      }
      return res;
    }
  });
}
