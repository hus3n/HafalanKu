import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { UserItem } from './useUsers';
import { PaginationMeta } from 'shared';

export interface SuperadminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface OrganizationItem {
  id: string;
  name: string;
  totalAdmins: number;
  totalUsers: number;
  createdAt?: string;
}

export function useSuperadminUsers(params: SuperadminQueryParams = {}) {
  const { page = 1, limit = 10, search = '', role = '', status = '' } = params;

  return useQuery({
    queryKey: ['superadmin-users', { page, limit, search, role, status }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);

      const res = await api.get<UserItem[]>(`/users?${queryParams.toString()}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal memuat data pengguna platform');
      }

      let users = res.data || [];

      // Filter by role if provided
      if (role) {
        users = users.filter((u) => u.role === role);
      }

      // Filter by status if provided
      if (status === 'ACTIVE') {
        users = users.filter((u) => u.isActive);
      } else if (status === 'INACTIVE') {
        users = users.filter((u) => !u.isActive);
      }

      return {
        data: users,
        meta: res.meta || { page: 1, limit: 10, total: users.length, totalPages: 1 },
      };
    },
  });
}

export function useSuperadminOrgs() {
  return useQuery({
    queryKey: ['superadmin-orgs'],
    queryFn: async () => {
      const res = await api.get<UserItem[]>('/users?limit=100');
      if (!res.success) {
        throw new Error(res.message || 'Gagal memuat data organisasi');
      }

      const users = res.data || [];
      const orgMap = new Map<string, OrganizationItem>();

      users.forEach((u) => {
        if (u.organizationId && u.organization) {
          const orgId = u.organizationId;
          const orgName = u.organization.name;

          if (!orgMap.has(orgId)) {
            orgMap.set(orgId, {
              id: orgId,
              name: orgName,
              totalAdmins: 0,
              totalUsers: 0,
              createdAt: u.createdAt,
            });
          }

          const org = orgMap.get(orgId)!;
          if (u.role === 'ADMIN') {
            org.totalAdmins += 1;
          } else {
            org.totalUsers += 1;
          }
        }
      });

      return Array.from(orgMap.values());
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ id: string }>(`/users/${id}`);
      if (!res.success) {
        throw new Error(res.message || 'Gagal menghapus pengguna dari platform');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-orgs'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
