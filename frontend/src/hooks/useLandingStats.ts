import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface RecentHafalanItem {
  id: string;
  santriName: string;
  initials: string;
  surahName: string;
  ayatRange: string;
  predikat: string;
  createdAt: string;
}

export interface OrganizationPartnerItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface LandingStatsResponse {
  totalSantri: number;
  totalOrganizations: number;
  totalUsers: number;
  totalHafalan: number;
  todayHafalan: number;
  organizations: OrganizationPartnerItem[];
  recentHafalan: RecentHafalanItem[];
}

export function useLandingStats() {
  return useQuery({
    queryKey: ['public-landing-stats'],
    queryFn: async () => {
      const res = await api.get<LandingStatsResponse>('/public/stats');
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memuat statistik');
      }
      return res.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // poll every 60s
  });
}
