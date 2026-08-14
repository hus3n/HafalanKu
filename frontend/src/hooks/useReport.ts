import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ReportRecapItem {
  id: string;
  santriId: string;
  surahNumber: number;
  surahName: string;
  ayatStart: number;
  ayatEnd: number;
  predikat: string;
  date: string;
  notes?: string | null;
  user?: {
    name: string;
  };
  santri?: {
    id: string;
    name: string;
    parentName: string;
    kelas?: {
      name: string;
      user?: {
        name: string;
      };
    } | null;
  };
}

export interface ReportRecapResponse {
  organizationName?: string;
  summary: {
    totalSetoran: number;
    predikatCount: Record<string, number>;
  };
  records: ReportRecapItem[];
}

export interface ReportFilterParams {
  month?: number;
  year?: number;
  kelasId?: string;
  santriId?: string;
  ustadzId?: string;
}

export function useReportRecap(params: ReportFilterParams = {}) {
  const { month, year, kelasId = '', santriId = '', ustadzId = '' } = params;

  return useQuery({
    queryKey: ['report-recap', { month, year, kelasId, santriId, ustadzId }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (month) queryParams.append('month', month.toString());
      if (year) queryParams.append('year', year.toString());
      if (kelasId) queryParams.append('kelasId', kelasId);
      if (santriId) queryParams.append('santriId', santriId);
      if (ustadzId) queryParams.append('ustadzId', ustadzId);

      const res = await api.get<ReportRecapResponse>(`/reports/recap?${queryParams.toString()}`);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memuat rekapitulasi laporan');
      }
      return res.data;
    },
  });
}

export async function downloadExcelReport(params: ReportFilterParams = {}) {
  const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token);
  const queryParams = new URLSearchParams();
  if (params.month) queryParams.append('month', params.month.toString());
  if (params.year) queryParams.append('year', params.year.toString());
  if (params.kelasId) queryParams.append('kelasId', params.kelasId);
  if (params.santriId) queryParams.append('santriId', params.santriId);
  if (params.ustadzId) queryParams.append('ustadzId', params.ustadzId);

  const res = await fetch(`${API_BASE_URL}/reports/download?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Gagal mengunduh file Excel');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekap_Hafalan_${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
