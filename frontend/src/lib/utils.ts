import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to standard Indonesian format (Asia/Jakarta timezone)
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  try {
    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(new Date(date));
  } catch {
    return String(date);
  }
}

/**
 * Format date and time to standard Indonesian format (Asia/Jakarta timezone)
 */
export function formatDateTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  try {
    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(new Date(date));
  } catch {
    return String(date);
  }
}
