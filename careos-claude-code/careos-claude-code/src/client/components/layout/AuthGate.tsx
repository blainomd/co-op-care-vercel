/**
 * AuthGate — Protects routes that require authentication
 *
 * Shows loading state while checking auth, redirects to login if not authenticated.
 * Includes login, registration, and 2FA verification flows.
 */
import { useState, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

type AuthView = 'login' | 'register' | 'verify-2fa' | 'forgot-password';

function LoginPage() {
  const { login, register } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 2FA state
  const [twoFAEmail, setTwoFAEmail] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;
    try {
      await login(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('2FA') || msg.includes('two-factor')) {
        setTwoFAEmail(email);
        setView('verify-2fa');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const firstName = form.get('firstName') as string;
    const lastName = form.get('lastName') as string;
    const email = form.get('email') as string;
    const phone = (form.get('phone') as string) || undefined;
    const password = form.get('password') as string;
    const confirm = form.get('confirmPassword') as string;

    if (password !== confirm) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setSubmitting(false);
      return;
    }

    try {
      await register({ email, password, firstName, lastName, phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const code = form.get('code') as string;
    try {
      await api.post('/auth/verify-2fa', { email: twoFAEmail, code });
      // Verification sets cookies, so re-check auth
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    try {
      await api.post('/auth/forgot-password', { email });
      setError('');
      setView('login');
      // Show success message inline
      setError('If an account exists with that email, you will receive reset instructions.');
    } catch {
      setError('Unable to process request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-heading text-2xl font-semibold text-sage">CareOS</h1>
        <p className="mb-8 text-center text-sm text-text-secondary">
          {view === 'login' && 'Sign in to your cooperative care account'}
          {view === 'register' && 'Create your cooperative care account'}
          {view === 'verify-2fa' && 'Enter your verification code'}
          {view === 'forgot-password' && 'Reset your password'}
        </p>

        {error && (
          <div
            className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
              error.includes('reset instructions')
                ? 'border-sage/30 bg-sage/5 text-sage'
                : 'border-zone-red/30 bg-zone-red/5 text-zone-red'
            }`}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setView('forgot-password');
                }}
                className="text-sage hover:text-sage/80"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setView('register');
                }}
                className="text-sage hover:text-sage/80"
              >
                Create account
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="regEmail"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Email
              </label>
              <input
                id="regEmail"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-text-primary">
                Phone <span className="text-text-muted">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label
                htmlFor="regPassword"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Password
              </label>
              <input
                id="regPassword"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setView('login');
              }}
              className="text-xs text-sage hover:text-sage/80"
            >
              Already have an account? Sign in
            </button>
          </form>
        )}

        {/* 2FA Verification */}
        {view === 'verify-2fa' && (
          <form onSubmit={handleVerify2FA} className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              A verification code was sent to{' '}
              <span className="font-medium text-text-primary">{twoFAEmail}</span>
            </p>
            <div>
              <label htmlFor="code" className="mb-1 block text-sm font-medium text-text-primary">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-center text-lg tracking-[0.3em] outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setView('login');
              }}
              className="text-xs text-sage hover:text-sage/80"
            >
              Back to sign in
            </button>
          </form>
        )}

        {/* Forgot Password */}
        {view === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="resetEmail"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Email
              </label>
              <input
                id="resetEmail"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-sage focus:ring-1 focus:ring-sage"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setView('login');
              }}
              className="text-xs text-sage hover:text-sage/80"
            >
              Back to sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-text-muted">
          co-op.care — cooperative home care
        </p>
      </div>
    </div>
  );
}
