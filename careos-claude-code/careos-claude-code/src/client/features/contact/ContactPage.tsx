/**
 * ContactPage — Contact form with API fallback to mailto
 */
import { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { track } from '../../lib/analytics';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('family');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<FormState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitting');
    track('contact_submit', { role });

    try {
      const res = await fetch('/api/v1/contact/schedule-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, phone, role, message }),
      });

      if (res.ok) {
        setState('success');
      } else {
        throw new Error('API error');
      }
    } catch {
      // Fallback: open mailto
      const subject = encodeURIComponent(`Contact from ${name} (${role})`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nRole: ${role}\n\n${message}`,
      );
      window.open(`mailto:blaine@co-op.care?subject=${subject}&body=${body}`, '_self');
      setState('success');
    }
  };

  if (state === 'success') {
    return (
      <PageLayout>
        <section className="px-6 py-24 text-center md:px-12">
          <div className="mx-auto max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
              <svg
                className="h-8 w-8 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 font-heading text-2xl font-bold text-navy">Message sent</h1>
            <p className="mt-3 text-sm text-text-secondary">
              We'll get back to you within 24 hours. In the meantime, you can talk to Sage for
              immediate help.
            </p>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="px-6 pb-20 pt-12 md:px-12 md:pt-20">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <p className="text-sm font-medium text-sage">Get in touch</p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-navy md:text-4xl">
              Contact us
            </h1>
            <p className="mt-4 text-base text-text-secondary">
              Whether you're a family, caregiver, healthcare partner, or just curious.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-navy">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/20"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-navy">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/20"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-navy">
                Phone <span className="text-text-muted">(optional)</span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/20"
              />
            </div>

            <div>
              <label htmlFor="contact-role" className="block text-sm font-medium text-navy">
                I am a...
              </label>
              <select
                id="contact-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/20"
              >
                <option value="family">Family caregiver</option>
                <option value="neighbor">Someone who wants to give care</option>
                <option value="partner">Healthcare partner / Hospital</option>
                <option value="investor">Investor</option>
                <option value="press">Press / Media</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-navy">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/20"
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              disabled={state === 'submitting'}
              className="w-full rounded-xl bg-sage px-8 py-4 text-base font-bold text-white shadow-lg shadow-sage/20 transition-all hover:bg-sage-dark active:scale-[0.98] disabled:opacity-50"
            >
              {state === 'submitting' ? 'Sending...' : 'Send message'}
            </button>

            <p className="text-center text-xs text-text-muted">
              Or email{' '}
              <a href="mailto:blaine@co-op.care" className="text-sage hover:text-sage-dark">
                blaine@co-op.care
              </a>{' '}
              directly
            </p>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}
