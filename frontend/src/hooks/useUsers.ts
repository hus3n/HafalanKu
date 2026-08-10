import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PaginationMeta } from 'shared';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  activeUntil?: string | null;
  isTrial?: boolean;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserListResponse {
  data: UserItem[];
  meta: PaginationMeta;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  phone?: string;
  organizationId?: string | null;
  organizationName?: string;
  isTrial?: boolean;
  trialDays?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: 'SUPERADMIN' | 'ADMIN' | 'USER';
  isActive?: boolean;
  phone?: string;
  organizationId?: string | null;
  organizationName?: string;
  activeUntil?: string | null;
  isTrial?: boolean;
}

export function useUsers(params: UserQueryParams = {}) {
  const { page = 1, limit = 10, search = '' } = params;

  return useQuery({
    queryKey: ['users', { page, limit, search }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);

      const res = await api.get<UserItem[]>(`/users?${queryParams.toString()}`);
      if (res.success && res.data) {
        return {
          data: res.data || [],
          meta: res.meta || { page: 1, limit: 10, total: res.data.length, totalPages: 1 },
        };
      }

      return {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get<UserItem>(`/users/${id}`);
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const res = await api.post<UserItem>('/users', input);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal membuat pengguna baru');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      const res = await api.put<UserItem>(`/users/${id}`, data);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Gagal memperbarui pengguna');
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}
