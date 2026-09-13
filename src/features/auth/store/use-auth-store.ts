import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, ColdStorage } from '../types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  getColdStorage: () => ColdStorage | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      isAuthenticated: () => !!get().accessToken,
      getColdStorage: () => get().user?.coldStorageId ?? null,
    }),
    {
      name: 'auth-storage', // persists to localStorage
    },
  ),
);
