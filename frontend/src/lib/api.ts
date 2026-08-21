import { useAuthStore } from '../stores/authStore';
import { ApiResponse } from 'shared';

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api/v1`;
  }
  return 'http://127.0.0.1:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function fetchWrapper<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Default to JSON if body is provided and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error: any) {
    // Network offline / backend unreachable
    const target = `${API_BASE_URL}${endpoint}`;
    console.error(`[API Network Error] Gagal terhubung ke: ${target}`, error);
    throw new ApiError(
      500,
      `Koneksi ke backend gagal (${API_BASE_URL}). Pastikan server backend sedang berjalan di port 5000.`,
      null
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    // Handling non-JSON responses
    data = null;
  }

  if (!response.ok) {
    // Only perform hard logout redirect if NOT in demo mode token
    if (response.status === 401 && (!token || !token.startsWith('demo-'))) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    // API returning standardized error format
    const errorMessage = data?.message || response.statusText || 'Terjadi kesalahan pada server';
    throw new ApiError(response.status, errorMessage, data?.errors || data);
  }

  // Assuming all successful responses follow ApiResponse<T> interface from shared
  // If we just need the data directly, we can return data.data, but sometimes we need meta.
  // Returning the full standardized response.
  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    fetchWrapper<ApiResponse<T>>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: any, options?: RequestInit) => 
    fetchWrapper<ApiResponse<T>>(endpoint, { ...options, method: 'POST', body }),
    
  put: <T>(endpoint: string, body?: any, options?: RequestInit) => 
    fetchWrapper<ApiResponse<T>>(endpoint, { ...options, method: 'PUT', body }),
    
  delete: <T>(endpoint: string, options?: RequestInit) => 
    fetchWrapper<ApiResponse<T>>(endpoint, { ...options, method: 'DELETE' }),
};
