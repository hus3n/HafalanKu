'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSantriDetail, useUpdateSantri } from '../../../../hooks/useSantri';
import { SantriForm } from '../../../../components/forms/SantriForm';
import { CreateSantriInput } from 'shared';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditSantriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: santri, isLoading, isError } = useSantriDetail(id);
  const updateMutation = useUpdateSantri();

  const handleSubmit = async (data: CreateSantriInput) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      router.push('/santri');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !santri) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-2xl glass border border-destructive/30 text-center space-y-3">
        <p className="text-sm text-destructive">Data santri tidak ditemukan atau gagal dimuat.</p>
        <Link href="/santri" className="inline-block text-xs font-semibold text-primary hover:underline">
          Kembali ke Daftar Santri
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/santri" className="p-2 rounded-xl bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-outfit text-foreground tracking-tight">
            Edit Data Santri
          </h1>
          <p className="text-xs text-muted-foreground">
            Perbarui data santri <span className="font-semibold text-foreground">{santri.name}</span>.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-md">
        {updateMutation.isError && (
          <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs text-center">
            {updateMutation.error?.message || 'Gagal meng-update santri.'}
          </div>
        )}

        <SantriForm
          initialValues={{
            name: santri.name,
            parentName: santri.parentName,
            parentPhone: santri.parentPhone,
            kelasId: santri.kelasId || '',
          }}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          submitText="Perbarui Data Santri"
        />
      </div>
    </div>
  );
}
