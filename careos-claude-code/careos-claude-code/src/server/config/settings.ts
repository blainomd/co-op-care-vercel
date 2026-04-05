/**
 * CareOS Server Configuration
 * All env vars centralized here. Never scatter process.env across modules.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

/**
 * Validate critical configuration at startup.
 * Fails fast with clear error messages in production.
 */
export function validateConfig(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // JWT keys are required for any authenticated endpoint
  if (!process.env['JWT_PRIVATE_KEY']) {
    errors.push('JWT_PRIVATE_KEY is not set — authentication will not work');
  }
  if (!process.env['JWT_PUBLIC_KEY']) {
    errors.push('JWT_PUBLIC_KEY is not set — token verification will not work');
  }

  const isProd = (process.env['NODE_ENV'] ?? 'development') === 'production';

  if (isProd) {
    // DATABASE_URL and REDIS_URL are required — all PHI lives in PostgreSQL, sessions in Redis
    if (!process.env['DATABASE_URL']) {
      errors.push('DATABASE_URL is not set — PostgreSQL is required for all PHI storage');
    }
    if (!process.env['REDIS_URL']) {
      errors.push('REDIS_URL is not set — Redis is required for session tokens and TOTP secrets');
    }

    // Wildcard CORS is never acceptable in production — it would expose PHI to any origin
    const corsOrigins = process.env['CORS_ORIGINS'] ?? '';
    if (
      corsOrigins
        .split(',')
        .map((o) => o.trim())
        .includes('*')
    ) {
      errors.push('CORS_ORIGINS cannot be "*" in production — this would expose PHI to any origin');
    }

    // Stripe keys must use live prefixes in production
    const stripeSecret = process.env['STRIPE_SECRET_KEY'] ?? '';
    if (stripeSecret && !stripeSecret.startsWith('sk_live_')) {
      errors.push('STRIPE_SECRET_KEY must start with "sk_live_" in production');
    }
    if (!stripeSecret) {
      errors.push('STRIPE_SECRET_KEY is not set in production');
    }

    const stripeWebhook = process.env['STRIPE_WEBHOOK_SECRET'] ?? '';
    if (stripeWebhook && !stripeWebhook.startsWith('whsec_')) {
      errors.push('STRIPE_WEBHOOK_SECRET must start with "whsec_" in production');
    }
    if (!stripeWebhook) {
      errors.push('STRIPE_WEBHOOK_SECRET is not set in production');
    }

    if (!process.env['STRIPE_MEMBERSHIP_PRICE_ID']) {
      errors.push('STRIPE_MEMBERSHIP_PRICE_ID is not set in production');
    }
  }

  // Production-only guards: database, Redis, and CORS wildcard
  if (process.env['NODE_ENV'] === 'production') {
    if (!process.env['DATABASE_URL']) {
      errors.push('DATABASE_URL is required in production');
    }
    if (!process.env['REDIS_URL']) {
      errors.push('REDIS_URL is required in production');
    }
    const corsOrigins = process.env['CORS_ORIGINS'] ?? '';
    if (corsOrigins === '*' || corsOrigins.includes('*')) {
      errors.push('CORS_ORIGINS must not contain wildcard (*) in production');
    }
  }

  // Optional but important — warn if missing
  if (!process.env['TWILIO_ACCOUNT_SID']) {
    warnings.push('TWILIO_ACCOUNT_SID not set — SMS notifications will be disabled');
  }
  if (!process.env['SENDGRID_API_KEY']) {
    warnings.push('SENDGRID_API_KEY not set — email notifications will be disabled');
  }
  if (!process.env['VAPID_PUBLIC_KEY'] || !process.env['VAPID_PRIVATE_KEY']) {
    warnings.push('VAPID keys not set — push notifications will be disabled');
  }
  if (!process.env['WEB3_RPC_URL'] && process.env['WEB3_ENABLED'] === 'true') {
    warnings.push('WEB3_ENABLED is true but WEB3_RPC_URL is not set');
  }

  // Log warnings
  for (const w of warnings) {
    // Use console.warn here because logger depends on config (circular)
    console.warn(`[config] WARNING: ${w}`);
  }

  // Fail fast on errors
  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`[config] FATAL: ${e}`);
    }
    throw new Error(
      `Configuration validation failed with ${errors.length} error(s):\n  - ${errors.join('\n  - ')}`,
    );
  }
}

export const config = {
  env: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),
  corsOrigins: optionalEnv('CORS_ORIGINS', 'http://localhost:5173').split(','),

  database: {
    url: optionalEnv('DATABASE_URL', 'postgresql://careos:careos@localhost:5432/careos'),
    poolMax: parseInt(optionalEnv('DATABASE_POOL_MAX', '20'), 10),
  },

  aidbox: {
    url: optionalEnv('AIDBOX_URL', 'http://localhost:8888'),
    clientId: optionalEnv('AIDBOX_CLIENT_ID', 'root'),
    clientSecret: optionalEnv('AIDBOX_CLIENT_SECRET', 'secret'),
  },

  redis: {
    url: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    privateKey: process.env['JWT_PRIVATE_KEY'] ?? '',
    publicKey: process.env['JWT_PUBLIC_KEY'] ?? '',
    accessExpiry: optionalEnv('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optionalEnv('JWT_REFRESH_EXPIRY', '7d'),
  },

  stripe: {
    secretKey: process.env['STRIPE_SECRET_KEY'] ?? '',
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] ?? '',
    membershipPriceId: process.env['STRIPE_MEMBERSHIP_PRICE_ID'] ?? '',
  },

  twilio: {
    accountSid: process.env['TWILIO_ACCOUNT_SID'] ?? '',
    authToken: process.env['TWILIO_AUTH_TOKEN'] ?? '',
    phoneNumber: process.env['TWILIO_PHONE_NUMBER'] ?? '',
  },

  sendgrid: {
    apiKey: process.env['SENDGRID_API_KEY'] ?? '',
    fromEmail: optionalEnv('SENDGRID_FROM_EMAIL', 'hello@co-op.care'),
  },

  vapid: {
    publicKey: process.env['VAPID_PUBLIC_KEY'] ?? '',
    privateKey: process.env['VAPID_PRIVATE_KEY'] ?? '',
    mailto: optionalEnv('VAPID_MAILTO', 'mailto:blaine@co-op.care'),
  },

  anthropic: {
    apiKey: process.env['ANTHROPIC_API_KEY'] ?? '',
  },

  web3: {
    enabled: process.env['WEB3_ENABLED'] === 'true',
    rpcUrl: process.env['WEB3_RPC_URL'] ?? '',
    privateKey: process.env['WEB3_PRIVATE_KEY'] ?? '',
    careHourTokenAddress: process.env['WEB3_CARE_HOUR_TOKEN_ADDRESS'] ?? '',
    coopGovernanceAddress: process.env['WEB3_COOP_GOVERNANCE_ADDRESS'] ?? '',
    credentialRegistryAddress: process.env['WEB3_CREDENTIAL_REGISTRY_ADDRESS'] ?? '',
  },

  isDev(): boolean {
    return this.env === 'development';
  },

  isProd(): boolean {
    return this.env === 'production';
  },
} as const;
