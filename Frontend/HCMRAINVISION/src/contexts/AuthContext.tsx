/**
 * AuthContext – mock authentication with localStorage
 * Handles login, logout, Google (mock), and redirect state
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    return parsed && typeof parsed.id === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    if (raw !== 'true') return;
    const u = loadUserFromStorage();
    setUser(u);
  }, []);

  const login = useCallback(
    async (email: string, _password: string, rememberMe = false) => {
      // Mock: accept any email/password
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0] || 'User',
      };
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      setUser(mockUser);
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    // Mock Google login
    const mockUser: User = {
      id: `google-${Date.now()}`,
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: undefined,
    };
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, _password: string) => {
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: name.trim() || email.split('@')[0] || 'User',
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      setUser(mockUser);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      loginWithGoogle,
      signup,
      logout,
    }),
    [user, login, loginWithGoogle, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
