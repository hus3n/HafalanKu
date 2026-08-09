'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { Save, Server, ShieldCheck, Loader2, Key, Phone, Link2 } from 'lucide-react';
import { useEnvSettings, useUpdateEnvSettings, EnvSettings } from '../../../../hooks/useSettings';
import { useAuth } from '../../../../hooks/useAuth';

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const { data: envData, isLoading: isLoadingEnv } = useEnvSettings();
  const updateEnvMutation = useUpdateEnvSettings();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EnvSettings>({
    defaultValues: {
      superadminPhone: '',
      telegramBotToken: '',
      telegramChatId: '',
      waGatewayUrl: '',
    }
  });

  useEffect(() => {
    if (envData) {
      reset({
        superadminPhone: envData.superadminPhone || '',
        telegramBotToken: envData.telegramBotToken || '',
        telegramChatId: envData.telegramChatId || '',
        waGatewayUrl: envData.waGatewayUrl || '',
      });
    }
  }, [envData, reset]);

  if (user?.role !== 'SUPERADMIN') {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Akses Ditolak</h2>
        <p className="text-muted-foreground">Halaman ini hanya dapat diakses oleh Superadmin.</p>
      </div>
    );
  }

  const onSubmit = async (data: EnvSettings) => {
    await updateEnvMutation.mutateAsync(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-2">
          <Server className="w-8 h-8 text-primary" />
          Pengaturan Sistem
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola variabel lingkungan (environment variables) seperti akses notifikasi dan gateway secara langsung.
        </p>
      </div>

      {isLoadingEnv ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl space-y-8">
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Perhatian:</strong> Perubahan pada form ini akan langsung ditulis ke file <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">.env</code> dan diperbarui ke memori server. Pastikan data yang Anda masukkan valid.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Superadmin Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Nomor WhatsApp Superadmin
                </label>
                <input
                  type="text"
                  placeholder="085229925593"
                  {...register('superadminPhone', { 
                    required: 'Nomor WhatsApp wajib diisi',
                    pattern: { value: /^[0-9]+$/, message: 'Hanya angka yang diperbolehkan' }
                  })}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">Nomor ini digunakan sebagai pengirim/penerima default notifikasi sistem.</p>
                {errors.superadminPhone && <p className="text-xs text-destructive">{errors.superadminPhone.message}</p>}
              </div>

              {/* WA Gateway URL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" /> WhatsApp Gateway URL
                </label>
                <input
                  type="url"
                  placeholder="https://api.gateway.com"
                  {...register('waGatewayUrl')}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">URL endpoint untuk layanan API WhatsApp Gateway.</p>
                {errors.waGatewayUrl && <p className="text-xs text-destructive">{errors.waGatewayUrl.message}</p>}
              </div>

              {/* Telegram Bot Token */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" /> Telegram Bot Token
                </label>
                <input
                  type="password"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  {...register('telegramBotToken')}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">Token akses yang didapat dari BotFather Telegram.</p>
                {errors.telegramBotToken && <p className="text-xs text-destructive">{errors.telegramBotToken.message}</p>}
              </div>

              {/* Telegram Chat ID */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" /> Telegram Chat ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123456789"
                  {...register('telegramChatId')}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">ID Chat grup atau personal untuk menerima notifikasi sistem.</p>
                {errors.telegramChatId && <p className="text-xs text-destructive">{errors.telegramChatId.message}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={updateEnvMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {updateEnvMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Pengaturan Sistem
              </motion.button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
