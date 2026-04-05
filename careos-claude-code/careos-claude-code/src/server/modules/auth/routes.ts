/**
 * Auth Routes — Register, Login, Refresh, 2FA Setup/Verify, Forgot Password
 */
import type { FastifyInstance } from 'fastify';
import { config } from '../../config/settings.js';
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from '../../common/constants.js';
import { ValidationError, NotFoundError } from '../../common/errors.js';
import { authService } from './service.js';
import { registerSchema, loginSchema, verify2FASchema } from './schemas.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getUserById } from '../../database/queries/index.js';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProd(),
  sameSite: 'strict' as const,
  path: '/api',
};

export const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /register — Create account
   */
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid registration data', formatZodErrors(parsed.error));
    }

    const { accessToken, refreshToken } = await authService.register(parsed.data);

    reply
      .setCookie(COOKIE_ACCESS_TOKEN, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
      })
      .setCookie(COOKIE_REFRESH_TOKEN, refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/api/v1/auth/refresh',
      })
      .status(201)
      .send({ message: 'Account created' });
  });

  /**
   * POST /login — Authenticate
   */
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid login data', formatZodErrors(parsed.error));
    }

    const { accessToken, refreshToken, requires2FA } = await authService.login(parsed.data);

    reply
      .setCookie(COOKIE_ACCESS_TOKEN, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60,
      })
      .setCookie(COOKIE_REFRESH_TOKEN, refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60,
        path: '/api/v1/auth/refresh',
      })
      .send({ requires2FA });
  });

  /**
   * POST /refresh — Rotate refresh token
   */
  app.post('/refresh', async (request, reply) => {
    const refreshToken = request.cookies[COOKIE_REFRESH_TOKEN];
    if (!refreshToken) {
      throw new ValidationError('Missing refresh token');
    }

    const tokens = await authService.refresh(refreshToken);

    reply
      .setCookie(COOKIE_ACCESS_TOKEN, tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60,
      })
      .setCookie(COOKIE_REFRESH_TOKEN, tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60,
        path: '/api/v1/auth/refresh',
      })
      .send({ message: 'Token refreshed' });
  });

  /**
   * POST /2fa/setup — Initialize TOTP 2FA (requires auth)
   */
  app.post('/2fa/setup', { preHandler: [requireAuth] }, async (request, reply) => {
    const { secret, otpauthUrl } = await authService.setup2FA(request.userId!);
    reply.send({ secret, otpauthUrl });
  });

  /**
   * POST /2fa/verify — Verify TOTP code (requires auth)
   */
  app.post('/2fa/verify', { preHandler: [requireAuth] }, async (request, reply) => {
    const parsed = verify2FASchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid 2FA code format', formatZodErrors(parsed.error));
    }

    const { accessToken, refreshToken } = await authService.verify2FA(request.userId!, parsed.data);

    reply
      .setCookie(COOKIE_ACCESS_TOKEN, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60,
      })
      .setCookie(COOKIE_REFRESH_TOKEN, refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60,
        path: '/api/v1/auth/refresh',
      })
      .send({ message: '2FA verified' });
  });

  /**
   * GET /me — Return current authenticated user (safe fields only)
   */
  app.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = await getUserById(request.userId!);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Return safe user object — never expose passwordHash or twoFactorSecret
    reply.send({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      roles: user.roles,
      activeRole: user.activeRole,
      twoFactorEnabled: user.twoFactorEnabled,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  /**
   * POST /forgot-password — Request password reset email
   * Always returns success to prevent email enumeration attacks.
   */
  app.post('/forgot-password', async (request, reply) => {
    const body = request.body as { email?: string };
    if (!body.email || typeof body.email !== 'string') {
      throw new ValidationError('Email is required');
    }

    try {
      // In production, this would look up the user and send a reset token via email.
      // We always return success to prevent leaking whether an email is registered.
      app.log.info(`[Auth] Password reset requested for ${body.email.replace(/@.*/, '@***')}`);
    } catch {
      // Swallow — never reveal whether user exists
    }

    reply.send({
      message: 'If an account exists with that email, you will receive reset instructions.',
    });
  });

  /**
   * POST /logout — Clear cookies
   */
  app.post('/logout', async (_request, reply) => {
    reply
      .clearCookie(COOKIE_ACCESS_TOKEN, COOKIE_OPTIONS)
      .clearCookie(COOKIE_REFRESH_TOKEN, { ...COOKIE_OPTIONS, path: '/api/v1/auth/refresh' })
      .send({ message: 'Logged out' });
  });
}

/**
 * Format Zod errors into a simple key-message map
 */
function formatZodErrors(error: {
  issues: Array<{ path: (string | number)[]; message: string }>;
}): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    result[key] = issue.message;
  }
  return result;
}
