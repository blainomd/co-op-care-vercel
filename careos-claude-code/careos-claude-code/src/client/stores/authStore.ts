/**
 * Auth Store — Zustand store for authentication state
 *
 * Uses HttpOnly cookie-based auth — tokens are managed by the server.
 * Client calls /auth/me to get the current user after login/register.
 * No tokens in memory or localStorage — HIPAA-compliant.
 */
import { create } from 'zustand';
import { type UserRole } from '@shared/constants/business-rules';
import type { User } from '@shared/types/user.types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginResponse {
  requires2FA: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  activeRole: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Server sets HttpOnly cookies on successful login
      const response = await api.post<LoginResponse>('/auth/login', { email, password });

      if (response.requires2FA) {
        set({ isLoading: false });
        throw new Error('2FA_REQUIRED');
      }

      // Fetch user profile now that cookies are set
      const user = await api.get<User>('/auth/me');
      set({
        user,
        isAuthenticated: true,
        activeRole: user.activeRole,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      throw new Error('Login failed');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear state even if server logout fails
    }
    set({
      user: null,
      isAuthenticated: false,
      activeRole: null,
      isLoading: false,
    });
  },

  register: async (data: RegisterInput) => {
    set({ isLoading: true });
    try {
      // Server sets HttpOnly cookies on successful registration
      await api.post('/auth/register', data);

      // Fetch user profile now that cookies are set
      const user = await api.get<User>('/auth/me');
      set({
        user,
        isAuthenticated: true,
        activeRole: user.activeRole,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      throw new Error('Registration failed');
    }
  },

  switchRole: (role: UserRole) => {
    const { user } = get();
    if (!user || !user.roles.includes(role)) return;
    set({ activeRole: role });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, activeRole: user.activeRole });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, isAuthenticated: true, activeRole: user.activeRole, isLoading: false });
    } catch {
      // No backend or not authenticated — stay unauthenticated.
      // The app handles this gracefully: CareCard shows signup CTA,
      // Sage works without auth, public routes are the default experience.
      set({ user: null, isAuthenticated: false, activeRole: null, isLoading: false });
    }
  },
}));
