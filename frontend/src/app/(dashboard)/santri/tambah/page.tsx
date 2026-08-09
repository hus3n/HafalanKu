'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateSantri } from '../../../../hooks/useSantri';
import { SantriForm } from '../../../../components/forms/SantriForm';
import { CreateSantriInput } from 'shared';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TambahSantriPage() {
  const router = useRouter();
  const createMutation = useCreateSantri();

  const handleSubmit = async (data: CreateSantriInput) => {
    try {
      await createMutation.mutateAsync(data);
      router.push('/santri');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/santri" className="p-2 rounded-xl bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-outfit text-foreground tracking-tight">
            Tambah Santri Baru
          </h1>
          <p className="text-xs text-muted-foreground">
            Isi formulir di bawah ini untuk menambahkan santri baru.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-xl">
        {createMutation.isError && (
          <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs text-center">
            {createMutation.error?.message || 'Gagal menambahkan santri.'}
          </div>
        )}

        <SantriForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          submitText="Simpan Data Santri"
        />
      </div>
    </div>
  );
}
