import { PaginationMeta } from 'shared';

export interface PaginationParams {
  page: number;
  limit: number;
}

export function getPaginationParams(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));
  return { page, limit };
}

export function formatPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
