'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

const SESSION_KEY = 'aspire_os_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: Session = JSON.parse(stored);
        setSession(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (user: User) => {
    const newSession: Session = {
      user,
      token: `aspire_${user.id}_${Date.now()}`,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    // Clear the "fucking fast" cache to prevent data leakage between users
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('as-')) localStorage.removeItem(key);
    });
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
