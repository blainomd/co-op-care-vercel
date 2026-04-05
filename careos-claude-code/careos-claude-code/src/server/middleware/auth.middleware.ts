/**
 * JWT RS256 Auth Middleware
 * Verifies access tokens from HttpOnly cookies or Authorization header.
 */
import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import type { UserRole } from '@shared/constants/business-rules';
import { ROLES_REQUIRING_2FA } from '@shared/constants/business-rules';
import { UnauthorizedError, ForbiddenError } from '../common/errors.js';
import { ROLE_PERMISSIONS } from '../config/roles.js';
import { COOKIE_ACCESS_TOKEN } from '../common/constants.js';
import { verifyAccessToken } from '../modules/auth/jwt.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    userRoles?: UserRole[];
    activeRole?: UserRole;
    twoFactorVerified?: boolean;
  }
}

/**
 * Require authentication — verifies JWT from cookie or Authorization header.
 */
export async function requireAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  // Try HttpOnly cookie first, then Authorization header
  const token =
    request.cookies[COOKIE_ACCESS_TOKEN] ?? extractBearerToken(request.headers.authorization);

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const payload = await verifyAccessToken(token);
    request.userId = payload.sub;
    request.userRoles = payload.roles;
    request.activeRole = payload.activeRole;
    request.twoFactorVerified = payload.twoFactorVerified;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Require specific role(s) — use after requireAuth.
 */
export function requireRole(...roles: UserRole[]) {
  return async function checkRole(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const activeRole = request.activeRole;
    if (!activeRole || !roles.includes(activeRole)) {
      throw new ForbiddenError('Insufficient permissions for this resource');
    }

    // Enforce 2FA for privileged roles before allowing access
    if (ROLES_REQUIRING_2FA.includes(activeRole) && !request.twoFactorVerified) {
      throw new ForbiddenError('2FA verification required for this role');
    }

    // Check endpoint-level RBAC
    const permission = ROLE_PERMISSIONS[activeRole];
    const isAllowed = permission.endpoints.some((prefix) => request.url.startsWith(prefix));
    if (!isAllowed) {
      throw new ForbiddenError('Role does not have access to this endpoint');
    }

    // Auto-enforce 2FA for roles that require it — cannot be accidentally skipped
    if (ROLES_REQUIRING_2FA.includes(activeRole) && !request.twoFactorVerified) {
      throw new ForbiddenError('2FA verification required for this role');
    }
  };
}

/**
 * Require 2FA verification for sensitive roles (medical_director, admin).
 */
export function require2FA(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  const activeRole = request.activeRole;
  if (activeRole && ROLES_REQUIRING_2FA.includes(activeRole)) {
    if (!request.twoFactorVerified) {
      throw new ForbiddenError('2FA verification required for this role');
    }
  }
  done();
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}
