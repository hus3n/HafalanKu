'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  ExternalLink, 
  MessageSquare, 
  Phone, 
  Mail, 
  Building, 
  ShieldAlert, 
  Shield, 
  User as UserIcon, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { UserItem } from '../../hooks/useUsers';
import { useWhatsAppStatus, useSendWhatsAppMessage } from '../../hooks/useWhatsApp';
import toast from 'react-hot-toast';

interface SendWhatsAppModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface QuickTemplate {
  id: string;
  title: string;
  category: string;
  generateText: (u: UserItem) => string;
}

export function SendWhatsAppModal({ user, isOpen, onClose }: SendWhatsAppModalProps) {
  const { data: waStatus, isLoading: isLoadingStatus } = useWhatsAppStatus();
  const sendMutation = useSendWhatsAppMessage();

  const [message, setMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom');
  const [copied, setCopied] = useState(false);

  const templates: QuickTemplate[] = [
    {
      id: 'activation',
      title: 'Pemberitahuan Aktivasi Akun',
      category: 'Akun',
      generateText: (u) =>
        `Assalamu'alaikum Wr. Wb.\n\n` +
        `Yth. Bapak/Ibu *${u.name}*,\n\n` +
        `Kabar baik! Akun HafalanKu Anda (${u.email}) dengan role *${u.role}* telah berhasil *diaktifkan* oleh Superadmin.\n\n` +
        `Silakan login ke platform menggunakan tautan berikut:\n` +
        `🌐 https://hafalanku.com/login\n\n` +
        `Jika ada pertanyaan atau kendala dalam penggunaan, silakan balas pesan ini.\n\n` +
        `Terima kasih.\n` +
        `— *Superadmin HafalanKu*`,
    },
    {
      id: 'subscription_reminder',
      title: 'Pengingat Masa Aktif / Langganan',
      category: 'Langganan',
      generateText: (u) =>
        `Assalamu'alaikum Wr. Wb.\n\n` +
        `Yth. Bapak/Ibu *${u.name}* (${u.organization?.name || 'Lembaga Pengguna'}),\n\n` +
        `Kami ingin menginformasikan bahwa masa aktif akun HafalanKu Anda akan segera berakhir.\n\n` +
        `Agar proses pencatatan hafalan santri dan sinkronisasi data tetap berjalan lancar, mohon segera melakukan konfirmasi perpanjangan kepada Superadmin.\n\n` +
        `Terima kasih atas kerja samanya.\n` +
        `— *Admin & Tim Layanan HafalanKu*`,
    },
    {
      id: 'account_help',
      title: 'Bantuan Akses & Password',
      category: 'Dukungan',
      generateText: (u) =>
        `Assalamu'alaikum Wr. Wb.\n\n` +
        `Halo *${u.name}*,\n\n` +
        `Terkait akses akun HafalanKu Anda dengan email *${u.email}*, berikut kami siap membantu kendala teknis atau reset kata sandi Anda.\n\n` +
        `Apakah saat ini Anda masih mengalami kendala saat masuk ke aplikasi?\n\n` +
        `— *Pusat Bantuan HafalanKu*`,
    },
    {
      id: 'system_announcement',
      title: 'Pemberitahuan Sistem & Pembaruan',
      category: 'Informasi',
      generateText: (u) =>
        `Assalamu'alaikum Wr. Wb.\n\n` +
        `Yth. Bapak/Ibu *${u.name}*,\n\n` +
        `Kami ingin menginformasikan adanya pembaruan fitur terbaru pada platform HafalanKu, termasuk peningkatan sistem Backup Cloud dan Pengingat Murajaah Otomatis.\n\n` +
        `Silakan nikmati kemudahan fitur baru ini melalui dashboard Anda.\n\n` +
        `— *Manajemen HafalanKu*`,
    },
  ];

  useEffect(() => {
    if (user && isOpen) {
      if (selectedTemplateId === 'custom') {
        if (!message) {
          setMessage(`Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu ${user.name},\n\n`);
        }
      } else {
        const found = templates.find((t) => t.id === selectedTemplateId);
        if (found) {
          setMessage(found.generateText(user));
        }
      }
    }
  }, [user, isOpen, selectedTemplateId]);

  if (!isOpen || !user) return null;

  // Format phone number
  const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '');
  let intlPhone = cleanPhone;
  if (intlPhone.startsWith('08')) {
    intlPhone = '62' + intlPhone.slice(1);
  } else if (intlPhone.startsWith('8')) {
    intlPhone = '62' + intlPhone;
  }

  const hasValidPhone = intlPhone.length >= 10;
  const isGatewayConnected = waStatus?.status === 'CONNECTED';

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'custom') {
      setMessage(`Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu ${user.name},\n\n`);
    } else {
      const found = templates.find((t) => t.id === templateId);
      if (found) {
        setMessage(found.generateText(user));
      }
    }
  };

  const handleSendViaGateway = async () => {
    if (!hasValidPhone) {
      toast.error('Pengguna ini tidak memiliki nomor WhatsApp yang valid');
      return;
    }
    if (!message.trim()) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }

    try {
      await sendMutation.mutateAsync({
        recipientPhone: user.phone || intlPhone,
        message: message.trim(),
      });
      toast.success(`Pesan berhasil dikirim ke WhatsApp ${user.name}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim pesan via gateway');
    }
  };

  const handleOpenWhatsAppWeb = () => {
    if (!hasValidPhone) {
      toast.error('Pengguna ini tidak memiliki nomor WhatsApp yang valid');
      return;
    }
    const encodedText = encodeURIComponent(message.trim());
    const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodedText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Pesan disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl rounded-3xl border border-emerald-500/20 bg-card p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden relative"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/40 shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                  Kirim Pesan WhatsApp
                </h3>
                <p className="text-xs text-muted-foreground">
                  Kirim notifikasi atau pesan langsung ke akun pengguna via WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 custom-scrollbar relative z-10">
            {/* Recipient User Badge */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.avatarUrl ? (
                    // eslint-disable-next-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                    {user.name}
                    {user.role === 'SUPERADMIN' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        <ShieldAlert className="w-3 h-3" /> Superadmin
                      </span>
                    )}
                    {user.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        <Shield className="w-3 h-3" /> Admin Organisasi
                      </span>
                    )}
                    {user.role === 'USER' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <UserIcon className="w-3 h-3" /> Pengajar
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {user.email}
                    </span>
                    {user.organization?.name && (
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-primary" /> {user.organization.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                {hasValidPhone ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Phone className="w-3.5 h-3.5" /> +{intlPhone}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" /> Nomor HP Belum Terdaftar
                  </span>
                )}
              </div>
            </div>

            {/* Quick Templates Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Pilih Template Pesan Cepat
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('custom')}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                    selectedTemplateId === 'custom'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  ✏️ Pesan Bebas
                </button>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm'
                        : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    {tpl.id === 'activation' && '✅ '}
                    {tpl.id === 'subscription_reminder' && '⏳ '}
                    {tpl.id === 'account_help' && '🔑 '}
                    {tpl.id === 'system_announcement' && '📢 '}
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  Isi Pesan WhatsApp
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{message.length} karakter</span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 p-1 rounded hover:bg-muted"
                    title="Salin teks"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan pesan WhatsApp Anda di sini..."
                className="w-full p-4 rounded-2xl border border-input bg-background/60 text-sm font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all resize-y placeholder:text-muted-foreground/50 leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground">
                Gunakan format WhatsApp: <code>*tebal*</code>, <code>_miring_</code>, <code>~coret~</code>.
              </p>
            </div>

            {/* Live WhatsApp Bubble Preview */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Pratinjau Tampilan Pesan di WhatsApp
              </label>
              <div className="p-4 rounded-2xl bg-[#0b141a]/90 border border-emerald-500/20 text-slate-100 font-sans text-xs shadow-inner">
                <div className="max-w-md ml-auto bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none shadow-md space-y-1.5">
                  <p className="whitespace-pre-wrap leading-relaxed break-words">{message || 'Pesan Anda akan tampil di sini...'}</p>
                  <div className="text-[10px] text-emerald-200/70 text-right flex items-center justify-end gap-1">
                    <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCircle2 className="w-3 h-3 text-sky-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 relative z-10">
            {/* Gateway Status Badge */}
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGatewayConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>
                WA Gateway: <strong>{isGatewayConnected ? 'Terhubung' : 'Offline / Tidak Terhubung'}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-input text-xs font-medium hover:bg-secondary transition-all cursor-pointer"
              >
                Tutup
              </button>

              {/* Direct WhatsApp Web Button (Always working) */}
              <button
                type="button"
                onClick={handleOpenWhatsAppWeb}
                disabled={!hasValidPhone || !message.trim()}
                className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border/60 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                title="Buka langsung di aplikasi WhatsApp atau WhatsApp Web"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                Buka di WA Web
              </button>

              {/* Send via Gateway Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSendViaGateway}
                disabled={sendMutation.isPending || !hasValidPhone || !message.trim() || !isGatewayConnected}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-40 cursor-pointer"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim via Gateway</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
