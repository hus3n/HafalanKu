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
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useAuth } from '../../../../hooks/useAuth';

export default function WhatsAppSettingsPage() {
  const { user: currentUser } = useAuth();
  const isAuthorized = !(currentUser?.role === 'USER' && !currentUser?.organizationId);

  const { data: statusData, isLoading: isStatusLoading } = useWhatsAppStatus();
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

  if (!isAuthorized) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-2xl text-center space-y-4 max-w-lg mx-auto my-12"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="p-4 rounded-full bg-rose-500/20 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8" />
        </motion.div>
        <h2 className="text-xl font-bold font-outfit text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Fitur WhatsApp Gateway khusus diperuntukkan bagi pengguna yang berafiliasi dengan Organisasi/Lembaga.
        </p>
      </motion.div>
    );
  }

  const onTestSubmit = async (data: any) => {
    setTestSuccess(null);
    setTestError(null);
    try {
      const res = await sendMutation.mutateAsync({
        recipientPhone: data.recipientPhone,
        message: data.message
      });
      setTestSuccess(res.message || 'Pesan berhasil dikirim ke antrean.');
      reset();
    } catch (err: any) {
      setTestError(err.message || 'Gagal mengirim pesan.');
    }
  };

  const handleStartPairing = async () => {
    try {
      const res = await initMutation.mutateAsync();
      setQrCodeData(res.qrCode);
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
  const isPairing = statusData?.status === 'PAIRING' || !!qrCodeData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-2">
          Integrasi WhatsApp Gateway
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hubungkan akun WhatsApp pengajar / TPA untuk mengirim notifikasi & jadwal murajaah ke orang tua santri.
        </p>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-2xl space-y-6 relative overflow-hidden">
        {/* Status Indicator Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-secondary border border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isConnected 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : isPairing 
                ? 'bg-amber-500/20 text-amber-400 animate-pulse' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {isConnected ? <CheckCircle2 className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Status Koneksi Perangkat:</p>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                {isStatusLoading ? (
                  <span>Memeriksa...</span>
                ) : isConnected ? (
                  <span className="text-emerald-400">Terhubung (WhatsApp Active)</span>
                ) : isPairing ? (
                  <span className="text-amber-400">Menunggu Scan QR Code...</span>
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive hover:text-white transition-all"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all"
              >
                {initMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                <span>{isPairing ? 'Muat Ulang QR Code' : 'Hubungkan WhatsApp'}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* QR Code Display & Pairing Instructions */}
        <AnimatePresence>
          {!isConnected && (isPairing || qrCodeData) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/40"
            >
              {/* Left Column: QR Display */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-background/50 border border-white/10 text-center space-y-4">
                <div className="p-4 rounded-2xl bg-white shadow-xl inline-block">
                  {qrCodeData ? (
                    <img src={qrCodeData} alt="WhatsApp Pairing QR Code" className="w-52 h-52 object-contain" />
                  ) : (
                    <div className="w-52 h-52 flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2">
                      <QrCode className="w-12 h-12" />
                      <span className="text-xs">Klik tombol hubungkan</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground max-w-xs">
                  Pindai QR code ini menggunakan aplikasi WhatsApp di HP Anda.
                </p>
              </div>

              {/* Right Column: Instructions */}
              <div className="space-y-4 flex flex-col justify-center">
                <h4 className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Langkah-Langkah Pautan Perangkat:
                </h4>

                <ol className="space-y-3 text-xs text-muted-foreground list-decimal pl-4">
                  <li>Buka aplikasi **WhatsApp** di smartphone Anda.</li>
                  <li>Ketuk **Setelan / Menu** (ikon titik tiga di pojok kanan atas).</li>
                  <li>Pilih **Perangkat Tertaut (Linked Devices)**.</li>
                  <li>Ketuk **Tautkan Perangkat (Link a Device)**.</li>
                  <li>Arahkan kamera smartphone ke **QR Code** di samping layar ini.</li>
                </ol>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2 mt-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Kredensial sesi disimpan secara aman menggunakan **Enkripsi AES-256** pada server.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Session Details if Connected */}
        {isConnected && (
          <div className="p-5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 text-xs space-y-2 text-emerald-800 dark:text-emerald-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300">Nomor Perangkat Terhubung:</span>
              <span className="font-mono">{statusData.phoneNumber || '628xxxxxxxxxx'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300">Terakhir Terhubung:</span>
              <span>{statusData.lastConnectedAt ? new Date(statusData.lastConnectedAt).toLocaleString('id-ID') : 'Aktif'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Testing Message Card */}
      {isConnected && (
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Kirim Pesan Uji Coba
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Uji koneksi WhatsApp Anda dengan mengirim pesan ke nomor mana pun.</p>
          </div>

          <form onSubmit={handleSubmit(onTestSubmit)} className="space-y-4">
            {testSuccess && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {testSuccess}
              </div>
            )}
            {testError && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs font-medium">
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
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                {errors.recipientPhone && <p className="text-xs text-rose-500">{errors.recipientPhone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Jenis Pesan</label>
                <select
                  value={msgType}
                  onChange={(e) => {
                    const val = e.target.value as 'template'|'custom';
                    setMsgType(val);
                    if(val === 'template') {
                      setValue('message', 'Assalamu\'alaikum Bapak/Ibu,\nIni adalah pesan uji coba dari sistem HafalanKu untuk memastikan koneksi WhatsApp Anda berjalan lancar.\n\nTerima kasih.');
                    } else {
                      setValue('message', '');
                    }
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
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
                className="w-full p-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
              />
              {errors.message && <p className="text-xs text-rose-500">{errors.message.message}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={sendMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
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
