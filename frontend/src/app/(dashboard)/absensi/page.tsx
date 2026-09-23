'use client';

import React, { useState } from 'react';
import { useAbsensiList, useBulkUpdateAbsensi } from '../../../hooks/useAbsensi';
import { useSantriList, SantriItem } from '../../../hooks/useSantri';
import { useKelasList, KelasItem } from '../../../hooks/useKelas';
import { Calendar, Save, Loader2, UserCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function AbsensiPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [kelasId, setKelasId] = useState('');

  const { data: kelasiData, isLoading: isLoadingKelas } = useKelasList();
  
  // Also load Santri to know who to list if there are no absensi records generated yet today
  const { data: santriData, isLoading: isLoadingSantri } = useSantriList({ limit: 1000 });
  const { data: absensiData, isLoading: isLoadingAbsensi } = useAbsensiList(date, kelasId);
  const bulkUpdateMutation = useBulkUpdateAbsensi();

  const [editedRecords, setEditedRecords] = useState<Record<string, { status?: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA', notes?: string }>>({});
  const [prevScope, setPrevScope] = useState(`${todayStr}_`);

  const currentScope = `${date}_${kelasId}`;
  if (prevScope !== currentScope) {
    setPrevScope(currentScope);
    setEditedRecords({});
  }

  const handleStatusChange = (santriId: string, status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA') => {
    setEditedRecords(prev => ({
      ...prev,
      [santriId]: { ...prev[santriId], status }
    }));
  };

  const handleNotesChange = (santriId: string, notes: string) => {
    setEditedRecords(prev => ({
      ...prev,
      [santriId]: { ...prev[santriId], notes }
    }));
  };

  const filteredSantriList: SantriItem[] = (santriData?.santri || []).filter((s: SantriItem) => 
    kelasId ? s.kelasId === kelasId : true
  );

  const handleSave = async () => {
    const payloadRecords = filteredSantriList.map((s: SantriItem) => {
      const existingRecord = absensiData?.find(a => a.santriId === s.id);
      return {
        santriId: s.id,
        status: editedRecords[s.id]?.status ?? existingRecord?.status ?? 'HADIR',
        notes: editedRecords[s.id]?.notes ?? existingRecord?.notes ?? ''
      };
    });

    if (payloadRecords.length === 0) {
      toast.error('Tidak ada data santri untuk disimpan.');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({ date, records: payloadRecords });
      toast.success('Berhasil menyimpan absensi!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan absensi';
      toast.error(errorMsg);
    }
  };

  const isLoading = isLoadingKelas || isLoadingSantri || isLoadingAbsensi;

  const STATUS_COLORS = {
    HADIR: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25',
    IZIN: 'bg-sky-500/15 text-sky-700 border-sky-500/30 hover:bg-sky-500/25',
    SAKIT: 'bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25',
    ALPA: 'bg-rose-500/15 text-rose-700 border-rose-500/30 hover:bg-rose-500/25',
  };

  const STATUS_ACTIVE_COLORS = {
    HADIR: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-500',
    IZIN: 'bg-sky-500 text-white shadow-md shadow-sky-500/20 border-sky-500',
    SAKIT: 'bg-amber-500 text-white shadow-md shadow-amber-500/20 border-amber-500',
    ALPA: 'bg-rose-500 text-white shadow-md shadow-rose-500/20 border-rose-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" />
            Absensi Santri
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Catat kehadiran santri per kelas dan tanggal.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={bulkUpdateMutation.isPending || isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {bulkUpdateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Absensi
        </button>
      </div>

      <div className="p-4 bg-card border border-border shadow-sm rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Tanggal Absensi</label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-xl text-sm"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Filter Kelas</label>
          <select
            value={kelasId}
            onChange={(e) => setKelasId(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-input rounded-xl text-sm"
          >
            <option value="">-- Semua Kelas --</option>
            {kelasiData?.map((k: KelasItem) => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Memuat data absensi...</p>
          </div>
        ) : filteredSantriList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Tidak ada santri ditemukan pada kelas ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4 w-1/4">Nama Santri</th>
                  <th className="px-6 py-4 w-1/4">Kelas</th>
                  <th className="px-6 py-4 w-1/3">Status Kehadiran</th>
                  <th className="px-6 py-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSantriList.map((s: SantriItem) => {
                  const existingRecord = absensiData?.find(a => a.santriId === s.id);
                  const status = editedRecords[s.id]?.status ?? existingRecord?.status ?? 'HADIR';
                  const notes = editedRecords[s.id]?.notes ?? existingRecord?.notes ?? '';

                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">{s.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-md">
                          {s.kelas?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl w-fit border border-border/50">
                          {(['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as const).map((itemStatus) => (
                            <button
                              key={itemStatus}
                              onClick={() => handleStatusChange(s.id, itemStatus)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                                status === itemStatus ? STATUS_ACTIVE_COLORS[itemStatus] : STATUS_COLORS[itemStatus]
                              )}
                            >
                              {itemStatus === 'HADIR' ? 'H' : itemStatus === 'IZIN' ? 'I' : itemStatus === 'SAKIT' ? 'S' : 'A'}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          placeholder="Keterangan..."
                          value={notes}
                          onChange={(e) => handleNotesChange(s.id, e.target.value)}
                          className="w-full text-xs bg-background border border-input px-3 py-2 rounded-lg"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
