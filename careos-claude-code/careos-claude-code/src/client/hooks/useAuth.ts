/**
 * useAuth — Convenience hook wrapping the auth store
 *
 * Provides isAuthenticated, user, activeRole, and auth actions.
 */
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    activeRole,
    login,
    logout,
    register,
    switchRole,
    checkAuth,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    activeRole,
    login,
    logout,
    register,
    switchRole,
    checkAuth,
    hasRole: (role: string) => user?.roles.includes(role as never) ?? false,
  };
}
