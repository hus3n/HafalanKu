import { ApiResponse } from 'shared';

export function successResponse<T>(message: string, data: T | null = null, meta?: any): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
}

export function errorResponse(message: string, errors?: Record<string, string[]>): any {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
}
