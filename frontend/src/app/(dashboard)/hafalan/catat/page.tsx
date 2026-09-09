'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateHafalan, useCreateBulkAdvancedHafalan } from '../../../../hooks/useHafalan';
import { HafalanForm } from '../../../../components/forms/HafalanForm';
import { MurajaahHafalanForm } from '../../../../components/forms/MurajaahHafalanForm';
import { CreateHafalanInput } from 'shared';
import { ArrowLeft, CheckCircle2, Lock, ListOrdered, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { cn } from '../../../../lib/utils';
import { useAuth } from '../../../../hooks/useAuth';

export default function CatatHafalanPage() {
  const { user: currentUser } = useAuth();
  const isAuthorized = currentUser?.role === 'USER';
  const router = useRouter();
  
  const createZiyadah = useCreateHafalan();
  const createMurajaahBulk = useCreateBulkAdvancedHafalan();
  
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [mode, setMode] = useState<'ZIYADAH' | 'MURAJAAH'>('ZIYADAH');

  const handleZiyadahSubmit = async (data: CreateHafalanInput) => {
    try {
      await createZiyadah.mutateAsync({ ...data, type: 'ZIYADAH' } as any);
      setShowSuccessToast(true);
      setTimeout(() => router.push('/hafalan'), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMurajaahSubmit = async (data: any) => {
    try {
      await createMurajaahBulk.mutateAsync(data);
      setShowSuccessToast(true);
      setTimeout(() => router.push('/hafalan'), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-center max-w-lg mx-auto my-12">
        <Lock className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold mt-4">Akses Ditolak</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/hafalan" className="p-2 rounded-xl bg-secondary/80 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Catat Setoran Hafalan</h1>
          <p className="text-xs text-muted-foreground mt-1">Input capaian hafalan baru (Ziyadah) atau pengulangan (Murajaah).</p>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-md">
        
        {/* Toggle Mode */}
        <div className="flex p-1 mb-8 rounded-xl bg-muted/secondary border border-border w-full">
          <button 
            type="button" 
            onClick={() => setMode('ZIYADAH')}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all', mode === 'ZIYADAH' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-muted')}
          >
            <ListOrdered className="w-4 h-4" /> Ziyadah
          </button>
          <button 
            type="button" 
            onClick={() => setMode('MURAJAAH')}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all', mode === 'MURAJAAH' ? 'bg-amber-500 text-white shadow-md' : 'text-muted-foreground hover:bg-muted')}
          >
            <Repeat className="w-4 h-4" /> Murajaah
          </button>
        </div>

        {createZiyadah.isError && (
          <div className="p-3 mb-6 rounded-xl bg-destructive/10 text-destructive text-xs text-center">
            {createZiyadah.error?.message || 'Gagal menyimpan ziyadah.'}
          </div>
        )}
        {createMurajaahBulk.isError && (
          <div className="p-3 mb-6 rounded-xl bg-destructive/10 text-destructive text-xs text-center">
            {createMurajaahBulk.error?.message || 'Gagal menyimpan murajaah.'}
          </div>
        )}

        {mode === 'ZIYADAH' ? (
          <HafalanForm onSubmit={handleZiyadahSubmit} isLoading={createZiyadah.isPending} />
        ) : (
          <MurajaahHafalanForm onSubmit={handleMurajaahSubmit} isLoading={createMurajaahBulk.isPending} />
        )}
      </div>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl glass-card border border-emerald-500/40 bg-emerald-950/80 text-white shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-sm font-bold">Berhasil Disimpan!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
