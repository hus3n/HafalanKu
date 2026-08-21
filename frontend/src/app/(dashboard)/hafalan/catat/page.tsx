'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateHafalan } from '../../../../hooks/useHafalan';
import { HafalanForm } from '../../../../components/forms/HafalanForm';
import { CreateHafalanInput } from 'shared';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

import { useAuth } from '../../../../hooks/useAuth';

export default function CatatHafalanPage() {
  const { user: currentUser } = useAuth();
  const isAuthorized = currentUser?.role === 'USER';
  const router = useRouter();
  const createMutation = useCreateHafalan();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (data: CreateHafalanInput) => {
    try {
      await createMutation.mutateAsync(data);
      setShowSuccessToast(true);
      setTimeout(() => {
        router.push('/hafalan');
      }, 1500);
    } catch (err) {
      console.error(err);
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
          Halaman Catat Hafalan ini hanya diperuntukkan bagi Pengajar/Ustadz (USER).
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/hafalan" className="p-2 rounded-xl bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight">
            Catat Setoran Hafalan Baru
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Input capaian hafalan Al-Qur'an santri dan berikan predikat evaluasi.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="p-6 md:p-8 rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-md relative overflow-hidden">
        {createMutation.isError && (
          <div className="p-3 mb-6 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs text-center">
            {createMutation.error?.message || 'Gagal menyimpan setoran hafalan.'}
          </div>
        )}

        <HafalanForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>

      {/* Success Notification Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl glass-card border border-emerald-500/40 bg-emerald-950/80 text-emerald-200 shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-white">Berhasil Disimpan!</p>
              <p className="text-xs text-emerald-300">Setoran hafalan dan jadwal murajaah telah diperbarui.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
