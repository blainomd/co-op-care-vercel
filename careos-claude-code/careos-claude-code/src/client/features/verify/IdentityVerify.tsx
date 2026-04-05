/**
 * IdentityVerify — Driver's license identity verification flow
 *
 * Four-step mobile-first flow:
 *   1. Phone number entry (generalmedicine.co style)
 *   2. Camera capture of driver's license front
 *   3. Processing animation with sage-green pulse
 *   4. Consent checkboxes + verified data preview
 *
 * Currently uses mock OCR — Jacob will wire Persona/Jumio server-side.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import type { VerifiedIdentity } from '@shared/types/identity.types';

type Step = 'phone' | 'capture' | 'processing' | 'consent';

interface IdentityVerifyProps {
  onComplete: (data: VerifiedIdentity) => void;
}

// ─── Mock OCR ──────────────────────────────────────────────────────
// Simulates extracting data from a license image.
// Replace with Persona/Jumio API call in production.
function mockExtractLicenseData(phone: string): VerifiedIdentity {
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    address: {
      street: '1234 Pearl St',
      city: 'Boulder',
      state: 'CO',
      zip: '80302',
    },
    phone,
    documentType: 'drivers_license',
    documentState: 'CO',
    verifiedAt: new Date().toISOString(),
    provider: 'mock',
    confidence: 0.94,
  };
}

// ─── Phone Step ────────────────────────────────────────────────────
function PhoneStep({
  phone,
  setPhone,
  onContinue,
}: {
  phone: string;
  setPhone: (v: string) => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 10;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-navy">Verify your identity</h1>
          <p className="mt-2 font-body text-sm text-text-secondary">
            We need to confirm you're a real person before you can give or receive care through
            co-op.care.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <label htmlFor="phone" className="block font-body text-sm font-medium text-text-primary">
            Mobile phone number
          </label>

          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-warm-gray px-4 py-3 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20">
            <span className="font-body text-sm font-medium text-text-secondary select-none">
              +1
            </span>
            <div className="h-5 w-px bg-border" />
            <input
              ref={inputRef}
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full bg-transparent font-body text-base text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>

          <p className="mt-2 font-body text-xs text-text-muted">
            We'll send a verification code to this number.
          </p>

          <button
            onClick={onContinue}
            disabled={!isValid}
            className="mt-6 w-full rounded-xl bg-sage py-3 font-body text-sm font-semibold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>

        <p className="mt-6 text-center font-body text-xs text-text-muted">
          Your information is protected under our HIPAA-compliant privacy practices. We will never
          sell your data.
        </p>
      </div>
    </div>
  );
}

// ─── Capture Step ──────────────────────────────────────────────────
function CaptureStep({ onCapture }: { onCapture: (blob: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setError(
        'Camera access is required to scan your license. Please allow camera permissions and try again.',
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    void startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    stopCamera();

    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      'image/jpeg',
      0.9,
    );
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
              />
            </svg>
          </div>
          <p className="font-body text-sm text-text-secondary">{error}</p>
          <button
            onClick={() => {
              setError(null);
              void startCamera();
            }}
            className="mt-4 rounded-xl bg-sage px-6 py-2.5 font-body text-sm font-semibold text-white hover:bg-sage-dark"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-navy-dark">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark overlay with card-shaped cutout */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Top/bottom overlays */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Card-shaped clear window */}
        <div className="relative z-10 mx-6 w-full max-w-sm">
          <div
            className="aspect-[1.586/1] w-full rounded-2xl border-2 border-white/80 shadow-lg"
            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
          />
          <p className="mt-4 text-center font-body text-sm font-medium text-white/90">
            Position the front of your license inside the frame
          </p>
        </div>
      </div>

      {/* Capture button */}
      {cameraReady && (
        <button
          onClick={handleCapture}
          className="pointer-events-auto absolute bottom-12 z-20 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg backdrop-blur-sm transition-transform active:scale-90"
          aria-label="Take photo"
        >
          <div className="h-12 w-12 rounded-full bg-white" />
        </button>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// ─── Processing Step ───────────────────────────────────────────────
function ProcessingStep() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6">
      <div className="text-center">
        {/* Sage-green pulse animation */}
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-sage/20" />
          <div className="absolute inset-2 animate-pulse rounded-full bg-sage/30" />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-sage">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mt-6 font-heading text-xl font-bold text-navy">Reading your license...</h2>
        <p className="mt-2 font-body text-sm text-text-secondary">
          Extracting your information securely. This only takes a moment.
        </p>
      </div>
    </div>
  );
}

// ─── Consent Step ──────────────────────────────────────────────────
function ConsentStep({
  identity,
  onConfirm,
}: {
  identity: VerifiedIdentity;
  onConfirm: () => void;
}) {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [telehealth, setTelehealth] = useState(false);
  const [hipaa, setHipaa] = useState(false);

  const allChecked = terms && privacy && telehealth && hipaa;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Verified badge */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-7 w-7 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-3 font-heading text-xl font-bold text-navy">Verified</h2>
          <p className="mt-1 font-body text-sm text-text-secondary">
            We found your information. Please confirm it's correct.
          </p>
        </div>

        {/* Extracted data preview */}
        <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <DataRow label="Name" value={`${identity.firstName} ${identity.lastName}`} />
          <DataRow label="Date of birth" value={formatDOB(identity.dateOfBirth)} />
          <DataRow label="Address" value={formatAddress(identity.address)} />
          <DataRow label="Phone" value={identity.phone} />
          <DataRow
            label="Document"
            value={`${identity.documentState ?? ''} ${docLabel(identity.documentType)}`}
            last
          />
        </div>

        {/* Consent checkboxes */}
        <div className="mt-6 space-y-3">
          <ConsentCheckbox
            checked={terms}
            onChange={setTerms}
            label="I agree to the co-op.care Terms of Service"
          />
          <ConsentCheckbox
            checked={privacy}
            onChange={setPrivacy}
            label="I acknowledge the Privacy Policy"
          />
          <ConsentCheckbox
            checked={telehealth}
            onChange={setTelehealth}
            label="I consent to telehealth services"
          />
          <ConsentCheckbox
            checked={hipaa}
            onChange={setHipaa}
            label="I acknowledge the HIPAA Notice of Privacy Practices"
          />
        </div>

        <button
          onClick={onConfirm}
          disabled={!allChecked}
          className="mt-6 w-full rounded-xl bg-sage py-3 font-body text-sm font-semibold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm &amp; continue
        </button>

        <p className="mt-4 text-center font-body text-xs text-text-muted">
          Confidence score: {Math.round(identity.confidence * 100)}% · Provider: {identity.provider}
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────

function DataRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-start justify-between py-2.5 ${last ? '' : 'border-b border-border/60'}`}
    >
      <span className="font-body text-xs font-medium text-text-muted">{label}</span>
      <span className="ml-4 text-right font-body text-sm text-text-primary">{value}</span>
    </div>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border text-sage accent-sage focus:ring-sage"
      />
      <span className="font-body text-sm text-text-secondary">{label}</span>
    </label>
  );
}

function formatDOB(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function formatAddress(addr: VerifiedIdentity['address']): string {
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
}

function docLabel(type: VerifiedIdentity['documentType']): string {
  switch (type) {
    case 'drivers_license':
      return "Driver's License";
    case 'state_id':
      return 'State ID';
    case 'passport':
      return 'Passport';
  }
}

// ─── Main Component ────────────────────────────────────────────────

export default function IdentityVerify({ onComplete }: IdentityVerifyProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);

  const handlePhoneContinue = () => {
    setStep('capture');
  };

  const handleCapture = (_blob: Blob) => {
    setStep('processing');

    // Simulate OCR processing delay (1.8s)
    // In production, send blob to Persona/Jumio API
    setTimeout(() => {
      const digits = phone.replace(/\D/g, '');
      const formattedPhone = `+1${digits}`;
      const extracted = mockExtractLicenseData(formattedPhone);
      setIdentity(extracted);
      setStep('consent');
    }, 1800);
  };

  const handleConfirm = () => {
    if (identity) {
      onComplete(identity);
    }
  };

  switch (step) {
    case 'phone':
      return <PhoneStep phone={phone} setPhone={setPhone} onContinue={handlePhoneContinue} />;
    case 'capture':
      return <CaptureStep onCapture={handleCapture} />;
    case 'processing':
      return <ProcessingStep />;
    case 'consent':
      return identity ? <ConsentStep identity={identity} onConfirm={handleConfirm} /> : null;
  }
}
