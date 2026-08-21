'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

export type AuthMode = 'login' | 'register' | null;

interface LandingAuthContextType {
  authMode: AuthMode;
  openAuth: (mode: 'login' | 'register') => void;
  closeAuth: () => void;
  toggleMode: () => void;
  setAuthMode: (mode: AuthMode) => void;
}

const LandingAuthContext = createContext<LandingAuthContextType | undefined>(undefined);

function LandingAuthProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [authMode, setAuthModeState] = useState<AuthMode>(null);

  // Sync state with URL query param on mount or URL change
  useEffect(() => {
    const authQuery = searchParams.get('auth');
    if (authQuery === 'login' || authQuery === 'register') {
      setAuthModeState(authQuery);
    } else if (!authQuery && pathname === '/') {
      setAuthModeState(null);
    }
  }, [searchParams, pathname]);

  const updateUrl = useCallback((mode: AuthMode) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (mode) {
      url.searchParams.set('auth', mode);
    } else {
      url.searchParams.delete('auth');
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  const openAuth = useCallback((mode: 'login' | 'register') => {
    setAuthModeState(mode);
    updateUrl(mode);
  }, [updateUrl]);

  const closeAuth = useCallback(() => {
    setAuthModeState(null);
    updateUrl(null);
  }, [updateUrl]);

  const toggleMode = useCallback(() => {
    setAuthModeState((prev) => {
      const nextMode = prev === 'login' ? 'register' : 'login';
      updateUrl(nextMode);
      return nextMode;
    });
  }, [updateUrl]);

  const setAuthMode = useCallback((mode: AuthMode) => {
    setAuthModeState(mode);
    updateUrl(mode);
  }, [updateUrl]);

  return (
    <LandingAuthContext.Provider
      value={{
        authMode,
        openAuth,
        closeAuth,
        toggleMode,
        setAuthMode,
      }}
    >
      {children}
    </LandingAuthContext.Provider>
  );
}

export function LandingAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LandingAuthProviderInner>{children}</LandingAuthProviderInner>
    </Suspense>
  );
}

export function useLandingAuth() {
  const context = useContext(LandingAuthContext);
  if (!context) {
    return {
      authMode: null as AuthMode,
      openAuth: (_mode: 'login' | 'register') => {},
      closeAuth: () => {},
      toggleMode: () => {},
      setAuthMode: (_mode: AuthMode) => {},
    };
  }
  return context;
}
