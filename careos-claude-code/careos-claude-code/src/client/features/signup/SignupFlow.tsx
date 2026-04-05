/**
 * SignupFlow — Free Comfort Card signup (30 seconds)
 *
 * Fields: first name + phone OR email + intent toggle.
 * No password. No payment. Just get a card.
 * Supports ?ref= param from QR referral links.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignupStore } from '../../stores/signupStore';
import { Logo } from '../../components/Logo';

export function SignupFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referredBy = searchParams.get('ref') ?? undefined;
  const createCard = useSignupStore((s) => s.createCard);

  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [intent, setIntent] = useState<'seeking_care' | 'giving_care'>('seeking_care');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError('Please enter a phone number or email address.');
      return;
    }

    createCard({
      firstName: firstName.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      intent,
      referredBy,
    });

    // Skip the welcome reveal — go straight to their card + Sage
    navigate('/card');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <Logo variant="horizontal" size="sm" />
          <h1 className="mt-4 font-heading text-2xl font-semibold text-text-primary">
            Get your free Comfort Card
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Takes 30 seconds. No payment required.</p>
          {referredBy && (
            <p className="mt-2 text-xs text-sage-dark">
              Someone in the co-op.care community invited you
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              autoComplete="given-name"
              className="mt-1 w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary">
              Phone <span className="text-text-muted">(or email below)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(303) 555-1234"
              autoComplete="tel"
              className="mt-1 w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email <span className="text-text-muted">(or phone above)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            />
          </div>

          {/* Intent Toggle */}
          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">I want to...</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIntent('seeking_care')}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                  intent === 'seeking_care'
                    ? 'border-sage bg-sage/10 text-sage-dark'
                    : 'border-border bg-white text-text-secondary hover:border-sage/50'
                }`}
              >
                Find care &amp; wellness
              </button>
              <button
                type="button"
                onClick={() => setIntent('giving_care')}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                  intent === 'giving_care'
                    ? 'border-sage bg-sage/10 text-sage-dark'
                    : 'border-border bg-white text-text-secondary hover:border-sage/50'
                }`}
              >
                Give care or lead wellness
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-zone-red">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-sage py-4 text-base font-semibold text-white shadow-lg transition-all active:scale-[0.98] active:bg-sage-dark"
          >
            Get my Comfort Card
          </button>

          <p className="text-center text-xs text-text-muted">
            Free forever. Membership ($100/year) is optional and comes later.
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupFlow;
