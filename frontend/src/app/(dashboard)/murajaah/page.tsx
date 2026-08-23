'use client';

import React, { useState, useMemo } from 'react';
import { 
  useMurajaahList,
  useMurajaahHistory,
  useCreateMurajaah,
  useChangeSurahMurajaah,
  useSimulateWaReply,
  useMarkNotificationSent,
  useDeleteMurajaah,
  useSendWhatsAppMurajaah,
  MurajaahItem, 
  MurajaahStatusType 
} from '../../../hooks/useMurajaah';
import { useSantriList } from '../../../hooks/useSantri';
import { useKelasList } from '../../../hooks/useKelas';
import { useHafalanList } from '../../../hooks/useHafalan';
import { useAuth } from '../../../hooks/useAuth';
import { WhatsAppBatchModal } from '../../../components/murajaah/WhatsAppBatchModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Send, 
  Users, 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  BookOpen,
  Search,
  MessageSquare,
  CheckSquare,
  Square,
  Lock,
  Filter,
  Calendar,
  Smartphone,
  Info,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';

export default function MurajaahPage() {
  const { user: currentUser } = useAuth();
  const isAuthorized = currentUser?.role === 'USER';

  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSantriIds, setSelectedSantriIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Form State
  const [formSantriId, setFormSantriId] = useState('');
  const [formSurahNumber, setFormSurahNumber] = useState('');

  // Queries
  const { data: allKelasList = [] } = useKelasList();
  const { data: santriData } = useSantriList({ limit: 100 });
  const allSantri = santriData?.santri || [];

  // Filter santri belonging to selected class (or all santri if no class is selected)
  const allowedSantri = useMemo(() => {
    if (!selectedKelasId) {
      return allSantri;
    }
    return allSantri.filter(s => s.kelasId === selectedKelasId || s.kelas?.id === selectedKelasId);
  }, [allSantri, selectedKelasId]);

  // Fetch murajaah items
  const { data: schedules = [], isLoading: isLoadingSchedules } = useMurajaahList({
    kelasId: selectedKelasId || undefined,
    santriId: selectedSantriId || undefined,
  });

  const { data: histories = [], isLoading: isLoadingHistories } = useMurajaahHistory({
    kelasId: selectedKelasId || undefined,
    santriId: selectedSantriId || undefined,
  });

  // Fetch hafalan for the manual form dropdown
  const { data: formHafalanData } = useHafalanList(formSantriId ? { santriId: formSantriId, limit: 114 } : { santriId: 'none' });
  const formSurahOptions = useMemo(() => {
    if (!formHafalanData?.hafalan) return [];
    const map = new Map();
    for (const h of formHafalanData.hafalan) {
      if (!map.has(h.surahNumber)) map.set(h.surahNumber, h);
    }
    return Array.from(map.values()).sort((a,b) => a.surahNumber - b.surahNumber);
  }, [formHafalanData]);

  const changeSurahMutation = useChangeSurahMurajaah();
  const simulateWaReplyMutation = useSimulateWaReply();
  const markNotificationSentMutation = useMarkNotificationSent();
  const createMurajaahMutation = useCreateMurajaah();
  const deleteMurajaahMutation = useDeleteMurajaah();
  const sendWhatsAppMutation = useSendWhatsAppMurajaah();
  const [sendingSantriId, setSendingSantriId] = useState<string | null>(null);

  // Filtered schedules by search query
  const filteredSchedules = useMemo(() => {
    return schedules.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.santriName.toLowerCase().includes(q) ||
        item.selectedSurahName.toLowerCase().includes(q) ||
        item.selectedSurahNumber.toString().includes(q) ||
        item.kelasName.toLowerCase().includes(q)
      );
    });
  }, [schedules, searchQuery]);

  // Filtered histories by search query
  const filteredHistories = useMemo(() => {
    return histories.filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.santriName.toLowerCase().includes(q) ||
        item.surahName.toLowerCase().includes(q) ||
        item.kelasName.toLowerCase().includes(q)
      );
    });
  }, [histories, searchQuery]);

  // Group murajaah items by santri for Batch WA Modal
  const selectedGroupsForBatch = useMemo(() => {
    return filteredSchedules
      .filter(item => selectedSantriIds.includes(item.santriId))
      .map(item => ({
        santriId: item.santriId,
        santriName: item.santriName,
        parentName: item.parentName,
        parentPhone: item.parentPhone,
        kelasName: item.kelasName,
        surahs: [item],
      }));
  }, [filteredSchedules, selectedSantriIds]);

  const handleToggleSelectSantri = (santriId: string) => {
    setSelectedSantriIds(prev => 
      prev.includes(santriId) ? prev.filter(id => id !== santriId) : [...prev, santriId]
    );
  };

  const handleSelectAllSantri = () => {
    if (selectedSantriIds.length === filteredSchedules.length) {
      setSelectedSantriIds([]);
    } else {
      setSelectedSantriIds(filteredSchedules.map(item => item.santriId));
    }
  };

  const handleOpenBatchModal = () => {
    if (selectedSantriIds.length < filteredSchedules.length) {
      const proceed = window.confirm(
        'PERINGATAN:\nAnda belum mencentang seluruh santri di tabel jadwal hari ini.\n\nDisarankan untuk mencentang seluruh santri agar Anda tidak perlu mengirim notifikasi satu per satu.\n\nApakah Anda yakin ingin melanjutkan mengirim hanya ke sebagian santri?'
      );
      if (!proceed) return;
    }
    setIsBatchModalOpen(true);
  };

  const handleSelectMemorizedSurahChange = (item: MurajaahItem, surahNumStr: string) => {
    const num = parseInt(surahNumStr, 10);
    const targetSurah = item.hafalanSurahs?.find(s => s.surahNumber === num);
    if (targetSurah) {
      changeSurahMutation.mutate({
        id: item.id,
        surahNumber: targetSurah.surahNumber,
        surahName: targetSurah.surahName,
        ayatRange: targetSurah.ayatRange,
      });
    }
  };

  const handleSendSingleWa = async (item: MurajaahItem) => {
    setSendingSantriId(item.santriId);
    try {
      const res = await sendWhatsAppMutation.mutateAsync(item.santriId);
      if (res.success || res.status === 'SENT' || res.status === 'DELIVERED') {
        alert(`✅ Pesan jadwal murajaah berhasil dikirim ke WhatsApp Wali dari ${item.santriName} (${item.parentPhone})!`);
      } else {
        const proceedFallback = window.confirm(
          `Pengiriman otomatis melalui WhatsApp Gateway gagal: ${res.error || 'WhatsApp belum terhubung'}.\n\nApakah Anda ingin membuka WhatsApp Web / Aplikasi untuk mengirimkan pesan secara manual?`
        );
        if (proceedFallback) {
          const surahText = `📖 Target Murajaah Hari Ini: *Surah #${item.selectedSurahNumber} ${item.selectedSurahName}* ${item.ayatRange ? `(${item.ayatRange})` : ''}`;
          const text = `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\nYth. Bpk/Ibu *${item.parentName}* (Wali dari Ananda *${item.santriName}* - ${item.kelasName})\n\nBerikut adalah jadwal Murajaah Hafalan Al-Qur'an hari ini:\n${surahText}\n\n--------------------------------------------------\n💬 *PENGINGAT PENTING UNTUK WALI SANTRI:*\nMohon bimbing dan pendampingan ananda murajaah di rumah. Setelah ananda selesai murajaah, *MOHON WAJIB MEMBALAS PESAN WHATSAPP INI DENGAN MENGETIK KATA: "sudah"* ke nomor Ustadz agar status murajaah ananda di sistem kami otomatis ter-update menjadi Selesai (🟢 Sudah Dimurajaah).\n\nTerima kasih.\n_HafalanKu Automatic Gateway_`;
          const cleanPhone = item.parentPhone.replace(/[^0-9]/g, '');
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
          window.open(waUrl, '_blank');
        }
      }
    } catch (err: any) {
      const proceedFallback = window.confirm(
        `Pengiriman otomatis gagal (${err.message || 'WhatsApp belum terhubung'}).\n\nApakah Anda ingin membuka WhatsApp Web / Aplikasi untuk mengirimkan pesan secara manual?`
      );
      if (proceedFallback) {
        const surahText = `📖 Target Murajaah Hari Ini: *Surah #${item.selectedSurahNumber} ${item.selectedSurahName}* ${item.ayatRange ? `(${item.ayatRange})` : ''}`;
        const text = `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\nYth. Bpk/Ibu *${item.parentName}* (Wali dari Ananda *${item.santriName}* - ${item.kelasName})\n\nBerikut adalah jadwal Murajaah Hafalan Al-Qur'an hari ini:\n${surahText}\n\n--------------------------------------------------\n💬 *PENGINGAT PENTING UNTUK WALI SANTRI:*\nMohon bimbing dan pendampingan ananda murajaah di rumah. Setelah ananda selesai murajaah, *MOHON WAJIB MEMBALAS PESAN WHATSAPP INI DENGAN MENGETIK KATA: "sudah"* ke nomor Ustadz agar status murajaah ananda di sistem kami otomatis ter-update menjadi Selesai (🟢 Sudah Dimurajaah).\n\nTerima kasih.\n_HafalanKu Automatic Gateway_`;
        const cleanPhone = item.parentPhone.replace(/[^0-9]/g, '');
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
      }
    } finally {
      setSendingSantriId(null);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSantriId || !formSurahNumber) return;
    
    const selectedSurah = formSurahOptions.find(s => s.surahNumber.toString() === formSurahNumber);
    if (!selectedSurah) return;

    try {
      await createMurajaahMutation.mutateAsync({
        santriId: formSantriId,
        surahNumber: selectedSurah.surahNumber,
        surahName: selectedSurah.surahName,
      });
      setFormSantriId('');
      setFormSurahNumber('');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan jadwal.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
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
          <Lock className="w-8 h-8" />
        </motion.div>
        <h2 className="text-xl font-bold font-outfit text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Halaman Murajaah ini hanya diperuntukkan bagi Pengajar/Ustadz (USER).
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-3">
              <History className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              Kelola Murajaah Kelompok Ustadz
            </h1>
            {allKelasList.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Building2 className="w-3.5 h-3.5" /> {allKelasList.length} Kelompok Bimbingan
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tambahkan Jadwal Hari Ini secara manual. Status murajaah diperbarui otomatis HANYA saat balasan pesan WhatsApp berisi kata kunci *sudah* terdeteksi dari wali murid.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={selectedSantriIds.length === 0}
            onClick={handleOpenBatchModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim WA Massal ({selectedSantriIds.length} Terpilih)</span>
          </motion.button>
        </div>
      </div>

      {/* Manual Input Form */}
      <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 shadow-md">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-4">
          <Plus className="w-5 h-5" />
          <span>Tambah Jadwal Murajaah Hari Ini</span>
        </div>
        
        <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Pilih Santri</label>
            <select
              value={formSantriId}
              onChange={(e) => {
                setFormSantriId(e.target.value);
                setFormSurahNumber('');
              }}
              required
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer font-medium"
            >
              <option value="">-- Pilih Santri --</option>
              {allowedSantri.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.kelas?.name ? `(${s.kelas.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Pilih Surah (Dari Hafalan Santri)</label>
            <select
              value={formSurahNumber}
              onChange={(e) => setFormSurahNumber(e.target.value)}
              required
              disabled={!formSantriId}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer font-medium disabled:opacity-50"
            >
              <option value="">-- Pilih Surah --</option>
              {formSurahOptions.map((s) => (
                <option key={s.surahNumber} value={s.surahNumber}>
                  #{s.surahNumber} {s.surahName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={createMurajaahMutation.isPending || !formSantriId || !formSurahNumber}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {createMurajaahMutation.isPending ? 'Menambahkan...' : 'Tambah ke Jadwal'}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Info Banner Rules */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>Aturan Otomatisasi WA:</strong> Pengingat membalas pesan terkirim di WA. Status murajaah diperbarui menjadi 🟢 <strong>Sudah</strong> saat wali murid membalas kata kunci <em>"sudah"</em> ke nomor WA Ustadz. Setelah 24 jam, jadwal akan pindah secara otomatis ke Riwayat Murajaah.
          </span>
        </div>
      </div>

      {/* Filter Kelompok Ustadz & Pilih Santri */}
      <div className="p-5 rounded-3xl border border-border bg-card shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Filter Tampilan Jadwal & Riwayat:</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kelompok / Kelas Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Kelompok Bimbingan
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => {
                setSelectedKelasId(e.target.value);
                setSelectedSantriId('');
                setSelectedSantriIds([]);
              }}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer font-medium"
            >
              <option value="">-- Semua Kelompok ({allKelasList.length} Kelas) --</option>
              {allKelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} {k.description ? `(${k.description})` : ''} {k.totalSantri !== undefined ? `• ${k.totalSantri} Santri` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Santri Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Pilih Santri
            </label>
            <select
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer font-medium"
            >
              <option value="">-- Semua Santri ({allowedSantri.length} Santri) --</option>
              {allowedSantri.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.kelas?.name ? `(${s.kelas.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Surah Quick Search & Bulk Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama santri atau surah hafalan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all placeholder:text-muted-foreground/60"
          />
        </div>
        {filteredSchedules.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSelectAllSantri}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer shadow-sm"
            >
              {selectedSantriIds.length === filteredSchedules.length ? (
                <>
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Batal Pilih Semua</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-muted-foreground" />
                  <span>Tandai Semua ({filteredSchedules.length} Santri)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* TABLE 1: JADWAL HARI INI */}
      <div className="rounded-3xl border border-emerald-500/20 bg-card overflow-hidden shadow-xl mb-8">
        <div className="p-4 border-b border-border bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold font-outfit text-emerald-900 dark:text-emerald-100">
              Jadwal Murajaah Hari Ini (Aktif)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            Terdapat <strong className="text-foreground">{filteredSchedules.length} Jadwal</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 font-bold text-foreground uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-3 w-10 text-center">Pilih</th>
                <th className="py-3.5 px-4 min-w-[140px]">Waktu Dibuat</th>
                <th className="py-3.5 px-4 min-w-[160px]">Nama Santri</th>
                <th className="py-3.5 px-4 min-w-[220px]">Surat Target Murajaah</th>
                <th className="py-3.5 px-4 min-w-[140px]">Status Murajaah</th>
                <th className="py-3.5 px-4 min-w-[130px]">Status Notif WA</th>
                <th className="py-3.5 px-4 min-w-[230px] text-right">Aksi & WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground font-medium">
              {isLoadingSchedules ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-3"><div className="h-4 w-4 bg-muted rounded mx-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                    <td className="py-3 px-4"><div className="h-9 w-44 bg-muted rounded-xl" /></td>
                    <td className="py-3 px-4"><div className="h-6 w-28 bg-muted rounded-full" /></td>
                    <td className="py-3 px-4"><div className="h-6 w-24 bg-muted rounded-full" /></td>
                    <td className="py-3 px-4"><div className="h-8 w-32 bg-muted rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History className="w-10 h-10 text-muted-foreground opacity-50" />
                      <p className="text-sm font-bold text-foreground">Tidak ada jadwal hari ini</p>
                      <p className="text-xs text-muted-foreground">
                        Tambahkan jadwal secara manual melalui form di atas.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredSchedules.map((item) => {
                    const isSantriChecked = selectedSantriIds.includes(item.santriId);
                    const effectiveStatus = item.murajaahStatus;

                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        className={`hover:bg-muted/40 transition-colors ${
                          isSantriChecked ? 'bg-emerald-500/10' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleToggleSelectSantri(item.santriId)}
                            className="text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            {isSantriChecked ? (
                              <CheckSquare className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{formatDateTime(item.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-foreground text-sm">{item.santriName}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border font-semibold">
                              {item.kelasName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={item.selectedSurahNumber}
                              onChange={(e) => handleSelectMemorizedSurahChange(item, e.target.value)}
                              className="w-full h-10 px-3 rounded-xl border border-emerald-500/40 bg-card text-foreground font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer shadow-sm"
                            >
                              {(item.hafalanSurahs || []).map((s) => (
                                <option key={s.surahNumber} value={s.surahNumber} className="bg-card text-foreground py-1">
                                  #{s.surahNumber} Surah {s.surahName} {s.ayatRange ? `(${s.ayatRange})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {effectiveStatus === 'SUDAH' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 🟢 Sudah
                            </span>
                          )}
                          {effectiveStatus === 'BELUM' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm">
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> ⏳ Belum
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.notificationStatus === 'SENT' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                              <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> 📲 Terkirim
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                              <Clock className="w-3.5 h-3.5" /> ⏳ Belum Dikirim
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSendSingleWa(item)}
                              disabled={sendingSantriId === item.santriId}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                              title="Kirim notifikasi pengingat jadwal murajaah via WhatsApp Gateway ke Wali Murid"
                            >
                              {sendingSantriId === item.santriId ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                                  <span>Mengirim...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{item.notificationStatus === 'SENT' ? 'Kirim Ulang WA' : 'Kirim WA'}</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => simulateWaReplyMutation.mutate(item.santriId)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                              title="Deteksi balasan WA masuk dari nomor wali santri berisi kata kunci 'sudah'"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Terima Balasan WA: "sudah"</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal murajaah untuk ${item.santriName}?`)) {
                                  deleteMurajaahMutation.mutate(item.id);
                                }
                              }}
                              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer shadow-sm"
                              title="Hapus Jadwal Murajaah Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: RIWAYAT MURAJAAH (History) */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xl opacity-90">
        <div className="p-4 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-bold font-outfit text-muted-foreground">
              Riwayat Murajaah (&gt; 24 Jam)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            Menampilkan <strong className="text-foreground">{filteredHistories.length} Riwayat</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse opacity-80 hover:opacity-100 transition-opacity">
            <thead>
              <tr className="border-b border-border bg-muted/70 font-bold text-foreground uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 min-w-[140px]">Tanggal Riwayat</th>
                <th className="py-3.5 px-4 min-w-[160px]">Nama Santri</th>
                <th className="py-3.5 px-4 min-w-[220px]">Surat Yang Dimurajaah</th>
                <th className="py-3.5 px-4 min-w-[140px]">Status Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground font-medium">
              {isLoadingHistories ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-44 bg-muted rounded" /></td>
                    <td className="py-3 px-4"><div className="h-6 w-28 bg-muted rounded-full" /></td>
                  </tr>
                ))
              ) : filteredHistories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History className="w-10 h-10 text-muted-foreground opacity-50" />
                      <p className="text-sm font-bold text-muted-foreground">Tidak ada riwayat murajaah</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredHistories.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-60" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-muted-foreground text-sm">{item.santriName}</div>
                        <div className="text-[11px] opacity-70 flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-muted border border-border font-semibold">
                            {item.kelasName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-muted-foreground">
                          #{item.surahNumber} {item.surahName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.status === 'SUDAH' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700/70 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sudah
                          </span>
                        )}
                        {item.status === 'TIDAK_DIMURAJAAH' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-700/70 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Tidak Dimurajaah
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WhatsAppBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedGroups={selectedGroupsForBatch}
      />
    </div>
  );
}
