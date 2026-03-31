'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  id: number;
  nome: string;
  email: string;
  tipoPerfil: string;
  telefone?: string;
  dataNascimento?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ error?: string }>;
  register: (data: {
    nome: string;
    email: string;
    senha: string;
    tipoPerfil?: string;
  }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res.data) {
        setUser(res.data.user as User);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, senha: string) => {
    const res = await api.auth.login({ email, senha });
    if (res.error) {
      return { error: res.error };
    }
    if (res.data) {
      setUser(res.data.user as User);
      router.push('/');
    }
    return {};
  };

  const register = async (data: {
    nome: string;
    email: string;
    senha: string;
    tipoPerfil?: string;
  }) => {
    const res = await api.auth.register(data);
    if (res.error) {
      return { error: res.error };
    }
    if (res.data) {
      setUser(res.data.user as User);
      router.push('/');
    }
    return {};
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
