/**
 * LoginPage — Sign-in gate for internal/private pages
 *
 * Fast OAuth (Google) + email/password sign-in.
 * Only blocks internal pages — public pages remain fully accessible.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useFirebaseAuthStore } from '../../stores/firebaseAuthStore';
import { useAuthStore } from '../../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleSignIn = useFirebaseAuthStore((s) => s.googleSignIn);
  const isFirebaseConfigured = useFirebaseAuthStore((s) => s.isConfigured);
  const backendLogin = useAuthStore((s) => s.login);

  const [mode, setMode] = useState<'choice' | 'email'>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to go after sign-in
  const from = (location.state as { from?: string })?.from || '/internal';

  async function handleGoogle() {
    setLoading(true);
    setError('');
    try {
      const success = await googleSignIn();
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Google sign-in was cancelled or failed. Please try again.');
      }
    } catch {
      setError('Sign-in failed. Please try again.');
    }
    setLoading(false);
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await backendLogin(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof Error && err.message === '2FA_REQUIRED') {
        navigate('/login/2fa', { state: { from } });
        return;
      }
      setError('Invalid email or password.');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-sage/5">
      {/* Floating card */}
      <div className="w-full max-w-md px-4">
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0D7377] px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-xl font-heading font-bold text-white">Team Portal</h1>
            <p className="mt-1 text-sm text-white/70">
              Sign in to access internal tools & dashboards
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {mode === 'choice' ? (
              <div className="space-y-4">
                {/* Google OAuth */}
                {isFirebaseConfigured && (
                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {loading ? 'Signing in...' : 'Continue with Google'}
                  </button>
                )}

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 text-xs text-slate-400">or</span>
                </div>

                {/* Email option */}
                <button
                  onClick={() => setMode('email')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all"
                >
                  <svg
                    className="h-5 w-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                  Sign in with Email
                </button>
              </div>
            ) : (
              /* Email form */
              <form onSubmit={handleEmail} className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('choice');
                    setError('');
                  }}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@co-op.care"
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0D7377] focus:ring-2 focus:ring-[#0D7377]/20 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#1B2A4A] to-[#0D7377] px-4 py-3.5 font-semibold text-white shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-4 text-center">
            <p className="text-xs text-slate-400">
              co-op.care Team Portal · Authorized personnel only
            </p>
          </div>
        </div>

        {/* Back to public site */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-[#0D7377] transition-colors"
          >
            ← Back to co-op.care
          </button>
        </div>
      </div>
    </div>
  );
}
