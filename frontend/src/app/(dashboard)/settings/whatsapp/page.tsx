'use client';

import React, { useState } from 'react';
import { 
  useWhatsAppStatus, 
  useInitWhatsAppSession, 
  useDisconnectWhatsApp,
  useSendWhatsAppMessage
} from '../../../../hooks/useWhatsApp';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Info,
  Loader2,
  LogOut,
  Send,
  MessageSquare,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../../hooks/useAuth';

export default function WhatsAppSettingsPage() {
  const { user: currentUser } = useAuth();
  const { data: statusData, isLoading: isStatusLoading, isFetching: isStatusFetching, refetch: refetchStatus } = useWhatsAppStatus();
  const initMutation = useInitWhatsAppSession();
  const disconnectMutation = useDisconnectWhatsApp();
  const sendMutation = useSendWhatsAppMessage();

  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'template'|'custom'>('template');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      recipientPhone: '',
      message: 'Assalamu\'alaikum Bapak/Ibu,\nIni adalah pesan uji coba dari sistem HafalanKu untuk memastikan koneksi WhatsApp Anda berjalan lancar.\n\nTerima kasih.'
    }
  });

  const handleApplyTemplate = () => {
    setMsgType('template');
    setValue('message', 'Assalamu\'alaikum Bapak/Ibu,\nIni adalah pesan uji coba dari sistem HafalanKu untuk memastikan koneksi WhatsApp Anda berjalan lancar.\n\nTerima kasih.');
  };

  const handleApplyCustom = () => {
    setMsgType('custom');
    const customMsg = `Assalamu'alaikum,\nIni adalah tes pesan dari aplikasi HafalanKu.\nStatus Server: Aktif\nWaktu: ${new Date().toLocaleString('id-ID')}`;
    setValue('message', customMsg);
  };

  const onTestSubmit = async (data: any) => {
    setTestSuccess(null);
    setTestError(null);
    try {
      const res = await sendMutation.mutateAsync({
        recipientPhone: data.recipientPhone,
        message: data.message
      });
      setTestSuccess(res.message || 'Pesan berhasil dikirim.');
      reset();
    } catch (err: any) {
      setTestError(err.message || 'Gagal mengirim pesan.');
    }
  };

  const handleStartPairing = async () => {
    try {
      const res = await initMutation.mutateAsync();
      if (res.qrCode) {
        setQrCodeData(res.qrCode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      setQrCodeData(null);
    } catch (err) {
      console.error(err);
    }
  };

  const isConnected = statusData?.status === 'CONNECTED';
  const currentQRCode = isConnected ? null : (qrCodeData || statusData?.qrCode);
  const isPairing = !isConnected && (statusData?.status === 'PAIRING' || !!currentQRCode);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-2">
            Integrasi WhatsApp Gateway
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hubungkan akun WhatsApp Anda untuk mengirim notifikasi & jadwal murajaah otomatis ke santri dan wali murid.
          </p>
        </div>

        {/* Quick manual refresh button */}
        <button
          onClick={() => refetchStatus()}
          disabled={isStatusFetching}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted/60 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          title="Periksa status koneksi terbaru"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0E8991] dark:text-[#1bb2bd] ${isStatusFetching ? 'animate-spin' : ''}`} />
          <span>{isStatusFetching ? 'Memeriksa...' : 'Segarkan Status'}</span>
        </button>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-card text-card-foreground p-6 md:p-8 rounded-3xl border border-border shadow-lg space-y-6 relative overflow-hidden transition-all">
        {/* Status Indicator Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
              isConnected 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                : isPairing 
                ? 'bg-[#EAA27C]/20 text-[#C46838] dark:text-[#EAA27C] animate-pulse border border-[#EAA27C]/30' 
                : 'bg-muted text-muted-foreground border border-border'
            }`}>
              {isConnected ? <CheckCircle2 className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status Koneksi Perangkat:</p>
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 mt-0.5">
                {isStatusLoading ? (
                  <span className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0E8991]" /> Memeriksa status...
                  </span>
                ) : isConnected ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Terhubung (WhatsApp Aktif)
                  </span>
                ) : isPairing ? (
                  <span className="text-[#C46838] dark:text-[#EAA27C]">Menunggu Pindai QR Code...</span>
                ) : (
                  <span className="text-muted-foreground">Belum Terhubung</span>
                )}
              </h3>
            </div>
          </div>

          <div>
            {isConnected ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive hover:text-white transition-all cursor-pointer border border-destructive/20 shadow-xs"
              >
                {disconnectMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                <span>Putuskan Koneksi</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartPairing}
                disabled={initMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E8991] hover:bg-[#0C737A] text-white font-semibold text-xs shadow-md shadow-[#0E8991]/20 transition-all cursor-pointer"
              >
                {initMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                <span>{isPairing ? 'Muat Ulang QR Code' : 'Hubungkan WhatsApp'}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* QR Code Display & Pairing Instructions */}
        <AnimatePresence>
          {!isConnected && (isPairing || currentQRCode) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border"
            >
              {/* Left Column: QR Display */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20 border border-border text-center space-y-4">
                <div className="p-4 rounded-2xl bg-white shadow-xl inline-block border border-border/40">
                  {currentQRCode ? (
                    <img src={currentQRCode} alt="WhatsApp Pairing QR Code" className="w-52 h-52 object-contain" />
                  ) : (
                    <div className="w-52 h-52 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#0E8991]" />
                      <span className="text-xs font-medium text-slate-500">Menyiapkan QR Code...</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground max-w-xs font-medium">
                  Buka WhatsApp di smartphone Anda, lalu arahkan kamera ke QR Code di atas.
                </p>
              </div>

              {/* Right Column: Instructions */}
              <div className="space-y-4 flex flex-col justify-center">
                <h4 className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0E8991] dark:text-[#1bb2bd]" />
                  Langkah-Langkah Pautan Perangkat:
                </h4>

                <ol className="space-y-3 text-xs text-muted-foreground font-medium list-decimal pl-4 leading-relaxed">
                  <li>Buka aplikasi <strong>WhatsApp</strong> di smartphone Anda.</li>
                  <li>Ketuk ikon <strong>Titik Tiga</strong> di kanan atas (Android) atau <strong>Setelan</strong> (iPhone).</li>
                  <li>Pilih menu <strong>Perangkat Tertaut (Linked Devices)</strong>.</li>
                  <li>Ketuk tombol <strong>Tautkan Perangkat (Link a Device)</strong>.</li>
                  <li>Pindai <strong>QR Code</strong> yang tampil di layar ini.</li>
                </ol>

                <div className="p-3.5 rounded-2xl bg-[#0E8991]/10 border border-[#0E8991]/20 text-xs text-[#0E8991] dark:text-[#1bb2bd] flex items-start gap-2.5 mt-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#EAA27C]" />
                  <span className="leading-snug">Kredensial sesi disimpan secara aman menggunakan <strong>Enkripsi AES-256</strong> dan disinkronkan otomatis.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Session Details if Connected */}
        {isConnected && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-[#0E8991]/15 border border-emerald-500/25 dark:border-[#0E8991]/30 text-xs space-y-2.5 text-foreground">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-700 dark:text-[#1bb2bd]">Nomor Perangkat Terhubung:</span>
              <span className="font-mono font-bold text-foreground">+{statusData?.phoneNumber || '628xxxxxxxxxx'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-700 dark:text-[#1bb2bd]">Terakhir Terhubung:</span>
              <span className="font-medium text-foreground">{statusData?.lastConnectedAt ? new Date(statusData.lastConnectedAt).toLocaleString('id-ID') : 'Aktif'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Testing Message Card */}
      {isConnected && (
        <div className="bg-card text-card-foreground p-6 md:p-8 rounded-3xl border border-border shadow-lg space-y-6">
          <div>
            <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0E8991] dark:text-[#1bb2bd]" /> Kirim Pesan Uji Coba
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Uji koneksi WhatsApp Anda dengan mengirim pesan uji coba ke nomor mana pun.</p>
          </div>

          <form onSubmit={handleSubmit(onTestSubmit)} className="space-y-4">
            {testSuccess && (
              <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {testSuccess}
              </div>
            )}
            {testError && (
              <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" /> {testError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nomor Tujuan <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Contoh: 081234567890" 
                  {...register('recipientPhone', { required: 'Nomor tujuan wajib diisi' })} 
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8991] transition-all"
                />
                {errors.recipientPhone && <p className="text-xs text-rose-500 font-medium">{errors.recipientPhone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Jenis Pesan</label>
                <select
                  value={msgType}
                  onChange={(e) => {
                    const val = e.target.value as 'template'|'custom';
                    setMsgType(val);
                    if(val === 'template') {
                      handleApplyTemplate();
                    } else {
                      handleApplyCustom();
                    }
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8991] transition-all"
                >
                  <option value="template">Template Default</option>
                  <option value="custom">Pesan Custom</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Isi Pesan <span className="text-rose-500">*</span></label>
              <textarea 
                rows={4}
                placeholder="Tulis pesan..." 
                {...register('message', { required: 'Pesan wajib diisi' })} 
                className="w-full p-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8991] transition-all"
              />
              {errors.message && <p className="text-xs text-rose-500 font-medium">{errors.message.message}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={sendMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-[#0E8991] hover:bg-[#0C737A] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-[#0E8991]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Kirim Pesan Uji Coba
              </motion.button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
