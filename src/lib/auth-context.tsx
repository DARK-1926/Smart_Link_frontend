'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user as User);
      } else {
        api.setToken(null);
        setUser(null);
      }
    } catch {
      api.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.data?.user) {
      setUser(response.data.user as User);
      return { success: true };
    }
    return { success: false, error: response.error || 'Login failed' };
  };

  const register = async (email: string, password: string) => {
    const response = await api.register(email, password);
    if (response.success && response.data?.user) {
      setUser(response.data.user as User);
      return { success: true };
    }
    return { success: false, error: response.error || 'Registration failed' };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
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
