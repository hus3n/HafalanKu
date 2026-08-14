import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export interface DashboardStatsResponse {
  role: string;
  stats: StatItem[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStatsResponse>('/dashboard/stats');
      if (response.success && response.data) {
        return response.data;
      }
      return {
        role: 'USER',
        stats: [],
      };
    },
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

