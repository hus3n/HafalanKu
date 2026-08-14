'use client';

import { useAuthStore } from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { User } from 'shared';

export const useAuth = () => {
  const { user, isAuthenticated, token, clearAuth, setAuth: storeSetAuth } = useAuthStore();
  const queryClient = useQueryClient();
  
  const logout = () => {
    try {
      queryClient.clear(); // Flush all cached queries from previous user
    } catch {
      // ignore
    }
    clearAuth();
    // In App Router, we might also want to do a hard redirect to login or use next/navigation router
  };

  const setAuth = (newUser: User, newToken: string) => {
    try {
      queryClient.clear(); // Ensure fresh state on login
    } catch {
      // ignore
    }
    storeSetAuth(newUser, newToken);
  };

  return {
    user,
    isAuthenticated,
    token,
    logout,
    setAuth,
  };
};
