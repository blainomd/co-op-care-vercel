/**
 * TermsPage — Terms of Service for co-op.care
 * Restored from archive, wrapped in PageLayout.
 */
import PageLayout from '../../components/layout/PageLayout';

const NAME = 'co-op.care';

function Bullet({ children, color = 'sage' }: { children: React.ReactNode; color?: string }) {
  return (
    <li className="flex gap-3">
      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-${color}`} />
      <span>{children}</span>
    </li>
  );
}

function XMark({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-base text-zone-red">&#10005;</span>
      <span>{children}</span>
    </div>
  );
}

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-text-muted">Effective Date: March 2026</p>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            These Terms of Service govern your use of the {NAME} platform and services. By accessing
            or using {NAME}, you agree to be bound by these terms.
          </p>
        </div>

        <section
          aria-labelledby="acceptance"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="acceptance" className="font-heading text-xl font-semibold text-text-primary">
            Acceptance of Terms
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            By creating an account, accessing the {NAME} platform, or using any of our services, you
            acknowledge that you have read, understood, and agree to be bound by these Terms of
            Service and our Privacy Policy.
          </p>
        </section>

        <section
          aria-labelledby="cooperative"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="cooperative" className="font-heading text-xl font-semibold text-text-primary">
            The Cooperative
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              {NAME} is organized as a Colorado Limited Cooperative Association (LCA) under the
              Colorado Uniform Limited Cooperative Association Act. Members may participate in the
              following roles:
            </p>
            <ul className="ml-1 space-y-2">
              <Bullet color="copper">
                <strong className="text-text-primary">Family Caregivers</strong> — coordinate care,
                access the Time Bank, manage care teams.
              </Bullet>
              <Bullet>
                <strong className="text-text-primary">Time Bank Volunteers</strong> — contribute
                time and skills, earn credits, build reciprocal support.
              </Bullet>
              <Bullet>
                <strong className="text-text-primary">Worker-Owners</strong> — professional
                caregivers employed as W-2 workers with equity ownership.
              </Bullet>
              <Bullet color="gold">
                <strong className="text-text-primary">Wellness Providers</strong> — yoga, nutrition,
                senior fitness, and other HSA/FSA-eligible services.
              </Bullet>
              <Bullet color="blue">
                <strong className="text-text-primary">Organizational Partners</strong> — health
                systems, employers, and community organizations.
              </Bullet>
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="accounts"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="accounts" className="font-heading text-xl font-semibold text-text-primary">
            Accounts
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <Bullet>You must be at least 18 years of age to create an account.</Bullet>
            <Bullet>
              You must provide accurate, complete, and current information during registration.
            </Bullet>
            <Bullet>
              You are responsible for maintaining the security of your account credentials.
            </Bullet>
            <Bullet>
              Notify {NAME} immediately if you suspect unauthorized use of your account.
            </Bullet>
          </ul>
        </section>

        <section
          aria-labelledby="timebank"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="timebank" className="font-heading text-xl font-semibold text-text-primary">
            Time Bank
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              The {NAME} Time Bank is a community exchange system. The following rules govern
              participation:
            </p>
            <ul className="ml-1 space-y-2">
              <Bullet>
                Hours are earned through verified service delivery with GPS check-in/check-out
                verification.
              </Bullet>
              <Bullet>
                Hours expire after 12 months of account inactivity. Expired hours are donated to the
                Respite Fund.
              </Bullet>
              <Bullet>
                {NAME} reserves the right to adjust balances in cases of verified discrepancies or
                fraud.
              </Bullet>
              <Bullet>
                Time Bank credits are not currency, have no cash value, and cannot be transferred to
                non-members.
              </Bullet>
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="comfortcard"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="comfortcard" className="font-heading text-xl font-semibold text-text-primary">
            Comfort Card &amp; HSA/FSA
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <Bullet color="gold">
              HSA/FSA eligibility requires a valid Letter of Medical Necessity (LMN) issued by our
              Medical Director, Josh Emdur, DO.
            </Bullet>
            <Bullet color="gold">
              Users are solely responsible for verifying eligibility with their own HSA/FSA plan
              administrator.
            </Bullet>
            <Bullet color="gold">
              LMN renewals are required annually. Reminders are sent at 60, 30, and 7 days before
              expiration.
            </Bullet>
          </ul>
        </section>

        <section
          aria-labelledby="workers"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="workers" className="font-heading text-xl font-semibold text-text-primary">
            Worker-Owners
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <Bullet>
              Worker-owners are W-2 employees receiving wages, benefits, and equity per the
              cooperative bylaws.
            </Bullet>
            <Bullet>All candidates must pass background checks. This is non-negotiable.</Bullet>
            <Bullet>
              Equity vesting follows the schedule defined in the bylaws, provided during onboarding.
            </Bullet>
          </ul>
        </section>

        <section
          aria-labelledby="prohibited"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="prohibited" className="font-heading text-xl font-semibold text-text-primary">
            Prohibited Conduct
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <XMark>
              Fraud or misrepresentation, including falsifying Time Bank records, GPS check-ins, or
              care hours.
            </XMark>
            <XMark>
              Harassment, abuse, discrimination, or threatening behavior toward any member.
            </XMark>
            <XMark>
              Unauthorized access to other members' accounts or protected health information.
            </XMark>
            <XMark>Attempting to circumvent platform security or exploit vulnerabilities.</XMark>
            <XMark>Using the platform for any unlawful purpose.</XMark>
          </div>
        </section>

        <section
          aria-labelledby="liability"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="liability" className="font-heading text-xl font-semibold text-text-primary">
            Limitation of Liability
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              To the maximum extent permitted by law, {NAME} shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the
              platform.
            </p>
            <p>
              {NAME} facilitates connections between families and caregivers but does not guarantee
              the outcome of any care arrangement.
            </p>
            <p>
              Total liability shall not exceed membership fees paid in the twelve months preceding
              the claim.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="governing"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="governing" className="font-heading text-xl font-semibold text-text-primary">
            Governing Law
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            These Terms are governed by the laws of the State of Colorado. Disputes shall be
            resolved in the courts of Boulder County, Colorado.
          </p>
        </section>

        <section
          aria-labelledby="terms-contact"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="terms-contact" className="font-heading text-xl font-semibold text-text-primary">
            Contact
          </h2>
          <div className="mt-4 text-sm leading-relaxed text-text-secondary">
            <p>
              <strong className="text-text-primary">Email:</strong>{' '}
              <a href="mailto:legal@co-op.care" className="text-sage hover:text-sage-dark">
                legal@co-op.care
              </a>
            </p>
            <p>
              <strong className="text-text-primary">Location:</strong> Boulder, Colorado
            </p>
          </div>
        </section>

        <div className="rounded-lg border border-gold/30 bg-gold/5 px-5 py-4">
          <p className="text-xs leading-relaxed text-text-secondary">
            <strong className="text-gold-dark">Pre-launch notice:</strong> These are pre-launch
            terms. The final terms will be reviewed by legal counsel before public launch.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
