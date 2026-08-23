'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { User } from 'shared';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        // Endpoint /auth/me mengembalikan user object di response.data
        const response = await api.get<any>('/auth/me');
        if (response.success && response.data) {
          const userData = response.data.user || response.data;
          setAuth(userData, token);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Failed to verify session', error);
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []); // Only run once on mount

  // Optionally return a full-screen loading spinner while initializing auth
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
