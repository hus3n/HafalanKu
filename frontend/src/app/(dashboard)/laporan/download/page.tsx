'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { downloadExcelReport } from '../../../../hooks/useReport';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

export default function DownloadLaporanPage() {
  const router = useRouter();

  useEffect(() => {
    async function triggerDownload() {
      try {
        await downloadExcelReport({});
        setTimeout(() => {
          router.push('/laporan');
        }, 1000);
      } catch (err) {
        console.error(err);
        router.push('/laporan');
      }
    }
    triggerDownload();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xl animate-bounce">
        <FileSpreadsheet className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-outfit text-foreground">Mengunduh Laporan Excel...</h2>
        <p className="text-xs text-muted-foreground">Proses unduhan file .xlsx sedang berjalan secara otomatis.</p>
      </div>
      <Loader2 className="w-5 h-5 animate-spin text-primary mt-2" />
    </div>
  );
}
