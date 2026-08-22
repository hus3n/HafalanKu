'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Server, 
  ShieldCheck, 
  Loader2, 
  Key, 
  Phone, 
  Link2, 
  Bot, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ExternalLink, 
  RefreshCw, 
  HardDriveDownload,
  Check,
  Sparkles
} from 'lucide-react';
import { 
  useEnvSettings, 
  useUpdateEnvSettings, 
  useTelegramStatus, 
  useTestTelegramConnection, 
  useSendTelegramTestMessage, 
  useTestTelegramBackup,
  EnvSettings 
} from '../../../../hooks/useSettings';
import { useAuth } from '../../../../hooks/useAuth';

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const { data: envData, isLoading: isLoadingEnv } = useEnvSettings();
  const { data: telegramStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useTelegramStatus();
  
  const updateEnvMutation = useUpdateEnvSettings();
  const testConnMutation = useTestTelegramConnection();
  const testMsgMutation = useSendTelegramTestMessage();
  const testBackupMutation = useTestTelegramBackup();

  const [showGuide, setShowGuide] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<EnvSettings>({
    defaultValues: {
      superadminPhone: '',
      telegramBotToken: '',
      telegramChatId: '',
      waGatewayUrl: '',
    }
  });

  const currentTokenInput = watch('telegramBotToken');
  const currentChatIdInput = watch('telegramChatId');

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
    refetchStatus();
  };

  const handleTestConnection = async () => {
    await testConnMutation.mutateAsync({ 
      token: currentTokenInput ? currentTokenInput.trim() : undefined 
    });
    refetchStatus();
  };

  const handleSendTestMessage = async () => {
    await testMsgMutation.mutateAsync({ 
      chatId: currentChatIdInput ? currentChatIdInput.trim() : undefined 
    });
  };

  const handleTestBackup = async () => {
    await testBackupMutation.mutateAsync();
  };

  const isConnected = telegramStatus?.configured && telegramStatus?.connected;
  const isConfiguredWithError = telegramStatus?.configured && !telegramStatus?.connected;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            Pengaturan Sistem
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola konfigurasi inti, integrasi Telegram Cloud Backup, WhatsApp Gateway, dan variabel lingkungan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-all border border-border/60 self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>{showGuide ? 'Sembunyikan Panduan' : 'Panduan Setup Telegram'}</span>
        </button>
      </div>

      {/* Telegram Live Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden p-6 rounded-3xl border transition-all ${
          isConnected
            ? 'bg-gradient-to-r from-emerald-500/10 via-card to-emerald-500/5 border-emerald-500/30'
            : isConfiguredWithError
            ? 'bg-gradient-to-r from-destructive/10 via-card to-destructive/5 border-destructive/30'
            : 'bg-gradient-to-r from-amber-500/10 via-card to-amber-500/5 border-amber-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl shrink-0 ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : isConfiguredWithError
                ? 'bg-destructive/20 text-destructive border border-destructive/30'
                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}>
              <Bot className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base md:text-lg font-bold text-foreground">
                  Status Integrasi Telegram Bot
                </h3>
                {isLoadingStatus ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> Memeriksa...
                  </span>
                ) : isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Terhubung & Siap
                  </span>
                ) : isConfiguredWithError ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-destructive/15 text-destructive border border-destructive/30">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    Koneksi Gagal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Belum Dikonfigurasi
                  </span>
                )}
              </div>

              {isConnected && telegramStatus?.botInfo ? (
                <div className="text-xs md:text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                  <span className="font-medium text-foreground">
                    Nama: {telegramStatus.botInfo.firstName}
                  </span>
                  {telegramStatus.botInfo.username && (
                    <a
                      href={`https://t.me/${telegramStatus.botInfo.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      @{telegramStatus.botInfo.username}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {telegramStatus.chatId && (
                    <span className="font-mono bg-muted/60 px-2 py-0.5 rounded text-xs">
                      Chat ID: {telegramStatus.chatId}
                    </span>
                  )}
                </div>
              ) : isConfiguredWithError ? (
                <p className="text-xs md:text-sm text-destructive font-medium">
                  {telegramStatus?.error || 'Token bot tidak valid atau koneksi ke Telegram terputus.'}
                </p>
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">
                  Masukkan Token Bot & Chat ID Telegram di form bawah untuk mengaktifkan Auto-Backup cloud otomatis.
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Buttons on Status Card */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={() => refetchStatus()}
              disabled={isLoadingStatus}
              title="Refresh status koneksi"
              className="p-2.5 rounded-xl border border-border/80 bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testConnMutation.isPending}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {testConnMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Tes Koneksi
            </button>

            <button
              type="button"
              onClick={handleSendTestMessage}
              disabled={testMsgMutation.isPending || !isConnected}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-40"
            >
              {testMsgMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Kirim Pesan Tes
            </button>

            <button
              type="button"
              onClick={handleTestBackup}
              disabled={testBackupMutation.isPending || !isConnected}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-2 transition-all disabled:opacity-40"
            >
              {testBackupMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <HardDriveDownload className="w-3.5 h-3.5" />
              )}
              Uji Cloud Backup
            </button>
          </div>
        </div>
      </motion.div>

      {/* Interactive Setup Guide (Collapsible) */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card p-6 md:p-7 rounded-3xl border border-primary/20 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-base font-outfit">
                <Sparkles className="w-5 h-5" />
                Panduan Mudah Setup Telegram Bot HafalanKu
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold">1</span>
                    Buat Bot di BotFather
                  </div>
                  <p>
                    Buka Telegram dan cari akun resmi <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary font-semibold underline">@BotFather</a>. Ketik perintah <code>/newbot</code>, berikan nama bot dan username (berakhiran `bot`). Salin <strong>API Token</strong> yang diberikan.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold">2</span>
                    Mulai Chat (Klik /start) — PENTING!
                  </div>
                  <p>
                    Cari bot yang baru Anda buat di Telegram, lalu klik tombol <strong>START</strong> atau ketik <code>/start</code>. Bot Telegram <em>wajib di-start</em> sebelum sistem diizinkan mengirim pesan backup.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold">3</span>
                    Dapatkan Chat ID Anda
                  </div>
                  <p>
                    Buka akun <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-primary font-semibold underline">@userinfobot</a> atau <a href="https://t.me/RawDataBot" target="_blank" rel="noreferrer" className="text-primary font-semibold underline">@RawDataBot</a> di Telegram untuk melihat <strong>Id</strong> numerik Anda (misal: <code>123456789</code>). Jika menggunakan grup/channel, gunakan Chat ID grup (biasanya diawali tanda minus <code>-100...</code>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold">4</span>
                    Simpan & Uji Coba
                  </div>
                  <p>
                    Tempel Token dan Chat ID pada form di bawah, klik <strong>Simpan Pengaturan Sistem</strong>, lalu klik tombol <strong>Kirim Pesan Tes</strong> dan <strong>Uji Cloud Backup</strong> untuk memastikan berkas cadangan terkirim secara instan!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Settings Form */}
      {isLoadingEnv ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-xl space-y-8">
            
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Sinkronisasi Instan:</strong> Perubahan pada form ini langsung ditulis ke file <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-xs">.env</code> dan di-reload secara otomatis ke memori server dan scheduler tanpa perlu restart manual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telegram Bot Token */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" /> Telegram Bot Token
                  </span>
                  {currentTokenInput && (
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testConnMutation.isPending}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {testConnMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Tes Token
                    </button>
                  )}
                </label>
                <input
                  type="password"
                  placeholder="Contoh: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  {...register('telegramBotToken')}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">Token API yang didapatkan dari BotFather Telegram.</p>
                {errors.telegramBotToken && <p className="text-xs text-destructive">{errors.telegramBotToken.message}</p>}
              </div>

              {/* Telegram Chat ID */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" /> Telegram Chat ID
                  </span>
                  {currentChatIdInput && (
                    <button
                      type="button"
                      onClick={handleSendTestMessage}
                      disabled={testMsgMutation.isPending}
                      className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {testMsgMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Tes Kirim Pesan
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 123456789 atau -1001234567890"
                  {...register('telegramChatId')}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                <p className="text-xs text-muted-foreground">ID Chat personal atau ID Grup target penerima backup.</p>
                {errors.telegramChatId && <p className="text-xs text-destructive">{errors.telegramChatId.message}</p>}
              </div>

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
                <p className="text-xs text-muted-foreground">Nomor kontak pusat untuk laporan dan notifikasi darurat.</p>
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
                <p className="text-xs text-muted-foreground">URL endpoint kustom untuk layanan WhatsApp Gateway pihak ketiga.</p>
                {errors.waGatewayUrl && <p className="text-xs text-destructive">{errors.waGatewayUrl.message}</p>}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                {isDirty ? (
                  <span className="text-amber-500 font-medium">Ada perubahan yang belum disimpan.</span>
                ) : (
                  <span>Semua perubahan telah tersinkronisasi.</span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={updateEnvMutation.isPending}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
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
