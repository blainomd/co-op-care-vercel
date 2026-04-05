/**
 * Auth Routes — Integration Tests
 *
 * Tests real HTTP flows via Fastify inject (no running server needed).
 * DB and Redis are mocked. JWT keys are generated fresh per run.
 *
 * Covers:
 *   - POST /register, /login, /logout, /me
 *   - 401 for unauthenticated requests
 *   - 403 for wrong role (RBAC)
 *   - 403 for medical_director without 2FA verified (auto-enforcement)
 *   - 200 for correct role + valid token
 */
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import bcrypt from 'bcryptjs';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';

import { authRoutes } from './routes.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { errorHandler } from '../../middleware/error-handler.middleware.js';
import { signAccessToken, resetKeyCache } from './jwt.js';

// ── Mocks (hoisted before imports resolve) ──────────────────────────────────

vi.mock('../../database/queries/index.js', () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
  getUserById: vi.fn(),
  setTwoFactorSecret: vi.fn(),
  enableTwoFactor: vi.fn(),
}));

vi.mock('../../database/redis.js', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { getUserByEmail, createUser, getUserById } from '../../database/queries/index.js';
import type { UserRecord } from '../../database/queries/index.js';
import { cache } from '../../database/redis.js';

// ── Test app builder ─────────────────────────────────────────────────────────

async function buildTestApp() {
  const app = Fastify({ logger: false });

  await app.register(cookie);

  // Error handler must be set BEFORE registering plugins so child scopes inherit it
  app.setErrorHandler(errorHandler);

  // Auth routes at the same prefix as production (no rate-limit in tests)
  await app.register(authRoutes, { prefix: '/api/v1/auth' });

  // Sentinel routes — one per tier/module so we can verify cross-role blocking
  app.get(
    '/api/v1/families/test',
    { preHandler: [requireAuth, requireRole('conductor', 'admin')] },
    async () => ({ ok: true }),
  );
  app.get(
    '/api/v1/assessments/test',
    { preHandler: [requireAuth, requireRole('medical_director', 'admin')] },
    async () => ({ ok: true }),
  );
  app.get(
    '/api/v1/workers/test',
    { preHandler: [requireAuth, requireRole('worker_owner', 'conductor', 'admin')] },
    async () => ({ ok: true }),
  );
  app.get('/api/v1/admin/test', { preHandler: [requireAuth, requireRole('admin')] }, async () => ({
    ok: true,
  }));
  app.get(
    '/api/v1/timebank/test',
    { preHandler: [requireAuth, requireRole('conductor', 'timebank_member', 'admin')] },
    async () => ({ ok: true }),
  );
  app.get(
    '/api/v1/employer/test',
    { preHandler: [requireAuth, requireRole('employer_hr', 'admin')] },
    async () => ({ ok: true }),
  );

  await app.ready();
  return app;
}

// ── Test fixtures ────────────────────────────────────────────────────────────

let app: Awaited<ReturnType<typeof buildTestApp>>;
let testPasswordHash: string;
let conductorToken: string;
let mdVerifiedToken: string;
let mdUnverifiedToken: string;
let adminVerifiedToken: string;
let adminUnverifiedToken: string;
let workerToken: string;
let timebankMemberToken: string;
let employerHrToken: string;

beforeAll(async () => {
  // Inject RS256 key pair so JWT sign/verify works without real env
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  process.env['JWT_PRIVATE_KEY'] = privateKey;
  process.env['JWT_PUBLIC_KEY'] = publicKey;

  // 1-round hash is fast in tests; bcrypt.compare reads rounds from the hash itself
  testPasswordHash = await bcrypt.hash('TestP@ss1!', 1);

  app = await buildTestApp();

  // Pre-sign tokens for RBAC tests
  conductorToken = await signAccessToken({
    sub: 'user:conductor1',
    roles: ['conductor'],
    activeRole: 'conductor',
    twoFactorVerified: true,
  });

  mdVerifiedToken = await signAccessToken({
    sub: 'user:md1',
    roles: ['medical_director'],
    activeRole: 'medical_director',
    twoFactorVerified: true,
  });

  mdUnverifiedToken = await signAccessToken({
    sub: 'user:md2',
    roles: ['medical_director'],
    activeRole: 'medical_director',
    twoFactorVerified: false, // logged in but hasn't completed 2FA yet
  });

  adminVerifiedToken = await signAccessToken({
    sub: 'user:admin1',
    roles: ['admin'],
    activeRole: 'admin',
    twoFactorVerified: true,
  });

  adminUnverifiedToken = await signAccessToken({
    sub: 'user:admin2',
    roles: ['admin'],
    activeRole: 'admin',
    twoFactorVerified: false,
  });

  workerToken = await signAccessToken({
    sub: 'user:worker1',
    roles: ['worker_owner'],
    activeRole: 'worker_owner',
    twoFactorVerified: true,
  });

  timebankMemberToken = await signAccessToken({
    sub: 'user:tb1',
    roles: ['timebank_member'],
    activeRole: 'timebank_member',
    twoFactorVerified: true,
  });

  employerHrToken = await signAccessToken({
    sub: 'user:hr1',
    roles: ['employer_hr'],
    activeRole: 'employer_hr',
    twoFactorVerified: true,
  });
});

afterEach(() => {
  resetKeyCache();
  vi.clearAllMocks();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: 'user:conductor1',
    email: 'family@co-op.care',
    passwordHash: testPasswordHash,
    firstName: 'Jane',
    lastName: 'Doe',
    roles: ['conductor'],
    activeRole: 'conductor',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    phone: null,
    avatarUrl: null,
    location: null,
    backgroundCheckStatus: 'not_started',
    skills: [],
    rating: null,
    ratingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as UserRecord;
}

// ── POST /register ────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('creates an account and returns 201 with cookies set', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(null);
    vi.mocked(createUser).mockResolvedValue(mockUser());
    vi.mocked(cache.set).mockResolvedValue(undefined);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'family@co-op.care',
        password: 'TestP@ss1!',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'conductor',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ message: 'Account created' });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 409 when email already exists', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(mockUser());

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'family@co-op.care',
        password: 'TestP@ss1!',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'conductor',
      },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('CONFLICT');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'bad' },
    });

    expect(res.statusCode).toBe(400);
  });
});

// ── POST /login ───────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  it('returns 200 and requires2FA:false for a conductor', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(mockUser());
    vi.mocked(cache.set).mockResolvedValue(undefined);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'family@co-op.care', password: 'TestP@ss1!' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ requires2FA: false });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 200 and requires2FA:true for a medical_director with 2FA enabled', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(
      mockUser({
        roles: ['medical_director'],
        activeRole: 'medical_director',
        twoFactorEnabled: true,
      }),
    );
    vi.mocked(cache.set).mockResolvedValue(undefined);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'md@co-op.care', password: 'TestP@ss1!' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ requires2FA: true });
  });

  it('returns 401 for wrong password', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(mockUser());

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'family@co-op.care', password: 'WrongPassword!' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('UNAUTHORIZED');
  });

  it('returns 401 for unknown email', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(null);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'nobody@co-op.care', password: 'TestP@ss1!' },
    });

    expect(res.statusCode).toBe(401);
  });
});

// ── GET /me ───────────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  it('returns 401 with no token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/auth/me' });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('UNAUTHORIZED');
  });

  it('returns 401 with a tampered token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: 'Bearer totallyinvalidtoken' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 and safe user fields with a valid token', async () => {
    vi.mocked(getUserById).mockResolvedValue(mockUser());

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${conductorToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.email).toBe('family@co-op.care');
    // HIPAA: sensitive fields must never be in the response
    expect(body.passwordHash).toBeUndefined();
    expect(body.twoFactorSecret).toBeUndefined();
  });
});

// ── POST /logout ──────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('returns 200 and clears cookies', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/auth/logout' });
    expect(res.statusCode).toBe(200);
    // Both cookies should be cleared (max-age=0 or expires in past)
    const cookies = res.headers['set-cookie'] as string | string[];
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain('careos_access');
    expect(cookieStr).toContain('careos_refresh');
  });
});

// ── RBAC enforcement ──────────────────────────────────────────────────────────

describe('Role-based access control', () => {
  it('conductor can access family routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: `Bearer ${conductorToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('conductor is blocked from assessment routes (wrong role)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${conductorToken}` },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe('FORBIDDEN');
  });

  it('medical_director with verified 2FA can access assessment routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${mdVerifiedToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('medical_director WITHOUT verified 2FA is blocked — auto-enforcement', async () => {
    // This is the key test for the requireRole 2FA merge.
    // Even with a valid token and the correct role, accessing clinical routes
    // without completing 2FA must return 403.
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${mdUnverifiedToken}` },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe('FORBIDDEN');
  });

  it('unauthenticated request to any protected route returns 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/families/test' });
    expect(res.statusCode).toBe(401);
  });
});

// ── Cross-tier blocking ───────────────────────────────────────────────────────

describe('Cross-tier access blocking', () => {
  it('timebank_member cannot access family routes (conductor-tier)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: `Bearer ${timebankMemberToken}` },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe('FORBIDDEN');
  });

  it('timebank_member cannot access assessment routes (clinical-tier)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${timebankMemberToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('timebank_member can access timebank routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/timebank/test',
      headers: { authorization: `Bearer ${timebankMemberToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('worker_owner cannot access admin routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/test',
      headers: { authorization: `Bearer ${workerToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('worker_owner cannot access assessment routes (clinical-tier)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${workerToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('worker_owner can access worker routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/workers/test',
      headers: { authorization: `Bearer ${workerToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('employer_hr cannot access family routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: `Bearer ${employerHrToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('employer_hr cannot access assessment routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${employerHrToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('employer_hr can access employer routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/employer/test',
      headers: { authorization: `Bearer ${employerHrToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('conductor cannot access admin routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/test',
      headers: { authorization: `Bearer ${conductorToken}` },
    });
    expect(res.statusCode).toBe(403);
  });
});

// ── Admin tier 2FA enforcement ────────────────────────────────────────────────

describe('Admin 2FA enforcement', () => {
  it('admin with verified 2FA can access admin routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/test',
      headers: { authorization: `Bearer ${adminVerifiedToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('admin with verified 2FA can access assessment routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${adminVerifiedToken}` },
    });
    expect(res.statusCode).toBe(200);
  });

  it('admin WITHOUT verified 2FA is blocked from admin routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/test',
      headers: { authorization: `Bearer ${adminUnverifiedToken}` },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error).toBe('FORBIDDEN');
  });

  it('admin WITHOUT verified 2FA is blocked from assessment routes', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/assessments/test',
      headers: { authorization: `Bearer ${adminUnverifiedToken}` },
    });
    expect(res.statusCode).toBe(403);
  });
});

// ── Malformed / fabricated tokens ────────────────────────────────────────────

describe('Token security', () => {
  it('rejects a token with a fabricated non-existent role', async () => {
    // Sign a token that claims a role not in USER_ROLES — must be blocked by requireRole
    const fakeToken = await signAccessToken({
      sub: 'user:attacker',
      roles: ['superadmin' as never],
      activeRole: 'superadmin' as never,
      twoFactorVerified: true,
    });
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: `Bearer ${fakeToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('rejects a token with no activeRole', async () => {
    const noRoleToken = await signAccessToken({
      sub: 'user:norole',
      roles: [],
      activeRole: undefined as never,
      twoFactorVerified: true,
    });
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: `Bearer ${noRoleToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('rejects a structurally valid but unsigned token (tampered signature)', async () => {
    // Take a real token, corrupt the signature segment
    const parts = conductorToken.split('.');
    const corrupted = `${parts[0]}.${parts[1]}.invalidsignature`;
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: `Bearer ${corrupted}` },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBe('UNAUTHORIZED');
  });

  it('rejects a token that is just a random string', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: 'Bearer notavalidjwtatall' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects Authorization header with wrong scheme (Basic instead of Bearer)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/families/test',
      headers: { authorization: `Basic ${conductorToken}` },
    });
    expect(res.statusCode).toBe(401);
  });
});
