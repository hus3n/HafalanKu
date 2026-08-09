'use client';

import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, token, clearAuth, setAuth } = useAuthStore();
  
  const logout = () => {
    // Optionally call backend /auth/logout
    clearAuth();
    // In App Router, we might also want to do a hard redirect to login or use next/navigation router
  };

  return {
    user,
    isAuthenticated,
    token,
    logout,
    setAuth,
  };
};
