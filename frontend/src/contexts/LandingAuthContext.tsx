'use client';

import React, { createContext, useContext, useState, useCallback, Suspense } from 'react';
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

  const authQuery = searchParams.get('auth');
  const urlMode: AuthMode = 
    authQuery === 'login' || authQuery === 'register' 
      ? authQuery 
      : pathname === '/' 
        ? null 
        : null;

  const [overrideMode, setOverrideMode] = useState<AuthMode | undefined>(undefined);
  const [prevUrlMode, setPrevUrlMode] = useState(urlMode);

  if (urlMode !== prevUrlMode) {
    setPrevUrlMode(urlMode);
    setOverrideMode(undefined);
  }

  const authMode = overrideMode !== undefined ? overrideMode : urlMode;

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
    setOverrideMode(mode);
    updateUrl(mode);
  }, [updateUrl]);

  const closeAuth = useCallback(() => {
    setOverrideMode(null);
    updateUrl(null);
  }, [updateUrl]);

  const toggleMode = useCallback(() => {
    setOverrideMode((prev) => {
      const current = prev !== undefined ? prev : urlMode;
      const nextMode = current === 'login' ? 'register' : 'login';
      updateUrl(nextMode);
      return nextMode;
    });
  }, [updateUrl, urlMode]);

  const setAuthMode = useCallback((mode: AuthMode) => {
    setOverrideMode(mode);
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
      openAuth: () => {},
      closeAuth: () => {},
      toggleMode: () => {},
      setAuthMode: () => {},
    };
  }
  return context;
}
