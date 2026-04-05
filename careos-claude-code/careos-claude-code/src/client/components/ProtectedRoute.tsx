/**
 * ProtectedRoute — Wraps internal pages behind auth
 *
 * Checks both Firebase auth and backend auth.
 * If not signed in, redirects to /login with the intended destination.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useAuthStore } from '../stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const firebaseSignedIn = useFirebaseAuthStore((s) => s.isSignedIn);
  const firebaseLoading = useFirebaseAuthStore((s) => s.isLoading);
  const backendAuth = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  // Still checking auth state — show spinner
  if (firebaseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sage/20 border-t-sage" />
          <p className="mt-3 font-body text-sm text-text-muted">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login.
  // OR-gate: either Firebase auth OR backend JWT auth is sufficient.
  // Firebase is primary auth for team portal; backend JWT provides
  // backward compatibility. TODO: switch to AND-gate once migration complete.
  if (!firebaseSignedIn && !backendAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated — render the page
  return <>{children}</>;
}
