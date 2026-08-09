'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, AlertTriangle } from 'lucide-react';
import { useCreateUser, CreateUserInput } from '../../../../hooks/useUsers';
import { UserForm } from '../../../../components/forms/UserForm';

export default function TambahUserPage() {
  const router = useRouter();
  const { mutate: createUser, isPending, error } = useCreateUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (data: CreateUserInput) => {
    setErrorMessage(null);
    createUser(data, {
      onSuccess: () => {
        router.push('/admin');
      },
      onError: (err: any) => {
        setErrorMessage(err.message || 'Gagal membuat akun pengguna baru.');
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen User
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          Tambah Pengguna Baru
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daftarkan pengajar, ustadz, atau admin organisasi baru ke dalam platform HafalanKu.
        </p>
      </div>

      {/* Error Alert */}
      {(errorMessage || error) && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-sm mb-0.5">Gagal Menyimpan Data:</span>
            {errorMessage || error?.message}
          </div>
        </div>
      )}

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-2xl shadow-xl shadow-black/5"
      >
        <UserForm
          onSubmitCreate={handleSubmit}
          isPending={isPending}
          onCancel={() => router.push('/admin')}
        />
      </motion.div>
    </div>
  );
}
