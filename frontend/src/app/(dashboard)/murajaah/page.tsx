'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  History, 
  Send, 
  Building2, 
  Lock, 
  Info, 
  Loader2 
} from 'lucide-react';
import { 
  useMurajaahList,
  useMurajaahHistory,
  useChangeSurahMurajaah,
  useSimulateWaReply,
  useDeleteMurajaah,
  useSendWhatsAppMurajaah,
  useMurajaahBatchStatus,
  MurajaahItem, 
} from '../../../hooks/useMurajaah';
import { useSantriList } from '../../../hooks/useSantri';
import { useKelasList } from '../../../hooks/useKelas';
import { useAuth } from '../../../hooks/useAuth';
import { WhatsAppBatchModal } from '../../../components/murajaah/WhatsAppBatchModal';
import { MurajaahManualForm } from '../../../components/murajaah/MurajaahManualForm';
import { MurajaahFilterBar } from '../../../components/murajaah/MurajaahFilterBar';
import { MurajaahScheduleTable } from '../../../components/murajaah/MurajaahScheduleTable';
import { MurajaahHistoryTable } from '../../../components/murajaah/MurajaahHistoryTable';

export default function MurajaahPage() {
  const { user: currentUser } = useAuth();
  const isAuthorized = currentUser?.role === 'USER';

  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSantriIds, setSelectedSantriIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [modalBatchId, setModalBatchId] = useState<string | null>(null);
  const [sendingSantriId, setSendingSantriId] = useState<string | null>(null);

  // Queries
  const { data: activeBatch } = useMurajaahBatchStatus();
  const { data: allKelasList = [] } = useKelasList();
  const { data: santriData } = useSantriList({ limit: 100 });

  // Filter santri belonging to selected class (or all santri if no class is selected)
  const allowedSantri = useMemo(() => {
    const allSantri = santriData?.santri || [];
    if (!selectedKelasId) {
      return allSantri;
    }
    return allSantri.filter(s => s.kelasId === selectedKelasId || s.kelas?.id === selectedKelasId);
  }, [santriData?.santri, selectedKelasId]);

  // Fetch murajaah items
  const { data: schedules = [], isLoading: isLoadingSchedules } = useMurajaahList({
    kelasId: selectedKelasId || undefined,
    santriId: selectedSantriId || undefined,
  });

  const { data: histories = [], isLoading: isLoadingHistories } = useMurajaahHistory({
    kelasId: selectedKelasId || undefined,
    santriId: selectedSantriId || undefined,
  });

  const changeSurahMutation = useChangeSurahMurajaah();
  const simulateWaReplyMutation = useSimulateWaReply();
  const deleteMurajaahMutation = useDeleteMurajaah();
  const sendWhatsAppMutation = useSendWhatsAppMurajaah();

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
        (item.surahName && item.surahName.toLowerCase().includes(q)) ||
        (item.selectedSurahName && item.selectedSurahName.toLowerCase().includes(q)) ||
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
    setModalBatchId(null);
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

  const handleAyatRangeChange = (item: MurajaahItem, ayatRange: string) => {
    if (ayatRange !== (item.ayatRange || '')) {
      changeSurahMutation.mutate({
        id: item.id,
        surahNumber: item.selectedSurahNumber,
        surahName: item.selectedSurahName,
        ayatRange,
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
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'WhatsApp belum terhubung';
      const proceedFallback = window.confirm(
        `Pengiriman otomatis gagal (${errMessage}).\n\nApakah Anda ingin membuka WhatsApp Web / Aplikasi untuk mengirimkan pesan secara manual?`
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

      {/* Active Server Batch Notification Banner */}
      {activeBatch && (activeBatch.status === 'QUEUED' || activeBatch.status === 'IN_PROGRESS') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-primary/15 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <span>Pengiriman WhatsApp Massal Sedang Berjalan di Server</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">
                  {activeBatch.sent + activeBatch.failed} / {activeBatch.total} Selesai
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dikelola otomatis di latar belakang server. Anda aman meninggalkan atau menutup halaman ini.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setModalBatchId(activeBatch.batchId);
              setIsBatchModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-card border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Pantau Status Antrean</span>
          </button>
        </motion.div>
      )}

      {/* Manual Input Form */}
      <MurajaahManualForm allowedSantri={allowedSantri} />

      {/* Info Banner Rules */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>Aturan Otomatisasi WA:</strong> Pengingat membalas pesan terkirim di WA. Status murajaah diperbarui menjadi 🟢 <strong>Sudah</strong> saat wali murid membalas kata kunci <em>&quot;sudah&quot;</em> ke nomor WA Ustadz. Setelah 24 jam, jadwal akan pindah secara otomatis ke Riwayat Murajaah.
          </span>
        </div>
      </div>

      {/* Filter Kelompok Ustadz & Pilih Santri */}
      <MurajaahFilterBar
        allKelasList={allKelasList}
        allowedSantri={allowedSantri}
        selectedKelasId={selectedKelasId}
        selectedSantriId={selectedSantriId}
        searchQuery={searchQuery}
        onSelectKelas={(kelasId) => {
          setSelectedKelasId(kelasId);
          setSelectedSantriId('');
          setSelectedSantriIds([]);
        }}
        onSelectSantri={(santriId) => setSelectedSantriId(santriId)}
        onSearchChange={(q) => setSearchQuery(q)}
        totalSchedules={filteredSchedules.length}
        selectedSantriCount={selectedSantriIds.length}
        onSelectAllSantri={handleSelectAllSantri}
      />

      {/* TABLE 1: JADWAL HARI INI */}
      <MurajaahScheduleTable
        schedules={filteredSchedules}
        isLoading={isLoadingSchedules}
        selectedSantriIds={selectedSantriIds}
        sendingSantriId={sendingSantriId}
        onToggleSelectSantri={handleToggleSelectSantri}
        onSelectMemorizedSurahChange={handleSelectMemorizedSurahChange}
        onAyatRangeChange={handleAyatRangeChange}
        onSendSingleWa={handleSendSingleWa}
        onSimulateWaReply={(santriId) => simulateWaReplyMutation.mutate(santriId)}
        onDeleteSchedule={(id, santriName) => {
          if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal murajaah untuk ${santriName}?`)) {
            deleteMurajaahMutation.mutate(id);
          }
        }}
        formatDateTime={formatDateTime}
      />

      {/* TABLE 2: RIWAYAT MURAJAAH (History) */}
      <MurajaahHistoryTable
        histories={filteredHistories}
        isLoading={isLoadingHistories}
        formatDate={formatDate}
      />

      <WhatsAppBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setModalBatchId(null);
        }}
        selectedGroups={selectedGroupsForBatch}
        existingBatchId={modalBatchId}
      />
    </div>
  );
}
