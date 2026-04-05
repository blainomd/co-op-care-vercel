/**
 * PrivacyPage — Privacy Policy for co-op.care
 * Restored from archive, wrapped in PageLayout.
 */
import PageLayout from '../../components/layout/PageLayout';

const NAME = 'co-op.care';

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-text-muted">Effective Date: March 2026</p>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            {NAME} is a worker-owned home care cooperative. We are committed to protecting the
            privacy and security of your personal information and health data. This policy explains
            what we collect, how we use it, and what rights you have.
          </p>
        </div>

        {/* What We Collect */}
        <section
          aria-labelledby="collect-heading"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="collect-heading" className="font-heading text-xl font-semibold text-text-primary">
            What We Collect
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-secondary">
            {[
              {
                title: 'Account Information',
                text: `Name, email address, phone number, and mailing address. This information is required to create and maintain your ${NAME} membership.`,
              },
              {
                title: 'Care Activity Data',
                text: 'Time Bank transactions, task requests, caregiver matching preferences, scheduling records, and GPS check-in/check-out data for service verification.',
              },
              {
                title: 'Health-Related Information',
                text: 'Caregiver Impact Index (CII) assessment results, vitals data if voluntarily shared from wearable devices, care coordination notes, and Letters of Medical Necessity documentation for HSA/FSA eligibility.',
              },
              {
                title: 'Time Bank Transaction Records',
                text: 'Hours earned, spent, purchased, donated, and expired. Double-entry ledger records for all credit movements within the cooperative.',
              },
              {
                title: 'Usage Analytics',
                text: 'We use Plausible Analytics, a privacy-focused analytics platform that does not use cookies, does not track individuals across sites, and does not collect personal data. All analytics data is aggregate and anonymous.',
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How We Use It */}
        <section
          aria-labelledby="use-heading"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="use-heading" className="font-heading text-xl font-semibold text-text-primary">
            How We Use It
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            {[
              {
                bold: 'Care coordination and matching',
                text: 'to connect families with caregivers based on skills, proximity, availability, and care needs.',
              },
              {
                bold: 'Time Bank credit tracking',
                text: 'to maintain accurate records of hours earned, spent, and available within the cooperative economy.',
              },
              {
                bold: 'Comfort Card HSA/FSA documentation',
                text: 'to generate and maintain Letters of Medical Necessity and receipts required for HSA/FSA reimbursement.',
              },
              {
                bold: 'Quality improvement',
                text: 'to evaluate and improve the care experience, caregiver training, and cooperative operations.',
              },
              {
                bold: 'Aggregate reporting (anonymized)',
                text: 'to produce de-identified reports on cooperative impact, care outcomes, and community health trends.',
              },
            ].map((item) => (
              <li key={item.bold} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                <span>
                  <strong className="text-text-primary">{item.bold}</strong> — {item.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* What We Never Do */}
        <section
          aria-labelledby="never-heading"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="never-heading" className="font-heading text-xl font-semibold text-text-primary">
            What We Never Do
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            {[
              {
                bold: 'Sell personal data.',
                text: 'Your information is never sold to third parties. Period.',
              },
              {
                bold: 'Share protected health information (PHI) without consent.',
                text: 'Health-related data is only shared with your explicit authorization or as required by law.',
              },
              {
                bold: 'Use data for advertising.',
                text: 'We do not serve ads, sell ad space, or use your data to target marketing from any third party.',
              },
              {
                bold: 'Share with unauthorized third parties.',
                text: `Access to your data is limited to ${NAME} staff and vendors who have signed Business Associate Agreements and are bound by HIPAA requirements.`,
              },
            ].map((item) => (
              <div key={item.bold} className="flex gap-3">
                <span className="mt-0.5 text-base text-zone-red">&#10005;</span>
                <span>
                  <strong className="text-text-primary">{item.bold}</strong> {item.text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* HIPAA Compliance */}
        <section
          aria-labelledby="hipaa-heading"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="hipaa-heading" className="font-heading text-xl font-semibold text-text-primary">
            HIPAA Compliance
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {NAME} handles protected health information and is committed to full compliance with the
            Health Insurance Portability and Accountability Act (HIPAA). Our safeguards include:
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            {[
              'Business Associate Agreements with all vendors who may access PHI.',
              'Encrypted data at rest (AES-256) and in transit (TLS 1.3).',
              'HttpOnly cookie authentication — no tokens in localStorage or URLs.',
              'Annual independent third-party security audits with immutable audit trails.',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Your Rights */}
        <section
          aria-labelledby="rights-heading"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="rights-heading" className="font-heading text-xl font-semibold text-text-primary">
            Your Rights
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            {[
              {
                bold: 'Access your data.',
                text: 'Request a copy of all personal information we hold about you at any time.',
              },
              {
                bold: 'Request corrections.',
                text: 'If any information we hold is inaccurate, you may request that we correct it.',
              },
              {
                bold: 'Request deletion.',
                text: 'You may request that we delete your personal data, subject to legal retention requirements.',
              },
              {
                bold: 'Opt out of non-essential communications.',
                text: 'Unsubscribe from community updates and marketing at any time.',
              },
              {
                bold: 'Data portability.',
                text: 'Request an export of your data in a standard, machine-readable format (JSON or CSV).',
              },
            ].map((item) => (
              <li key={item.bold} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                <span>
                  <strong className="text-text-primary">{item.bold}</strong> {item.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact */}
        <section
          aria-labelledby="contact-heading"
          className="mb-8 rounded-xl border border-border bg-white p-6 md:p-8"
        >
          <h2 id="contact-heading" className="font-heading text-xl font-semibold text-text-primary">
            Contact
          </h2>
          <div className="mt-4 text-sm leading-relaxed text-text-secondary">
            <p>
              If you have questions about this privacy policy or wish to exercise any of your
              rights:
            </p>
            <div className="mt-4 space-y-1">
              <p>
                <strong className="text-text-primary">Email:</strong>{' '}
                <a href="mailto:privacy@co-op.care" className="text-sage hover:text-sage-dark">
                  privacy@co-op.care
                </a>
              </p>
              <p>
                <strong className="text-text-primary">Location:</strong> Boulder, Colorado
              </p>
            </div>
          </div>
        </section>

        <div className="rounded-lg border border-gold/30 bg-gold/5 px-5 py-4">
          <p className="text-xs leading-relaxed text-text-secondary">
            <strong className="text-gold-dark">Pre-launch notice:</strong> This is a pre-launch
            privacy policy. The final policy will be reviewed by legal counsel before public launch.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
