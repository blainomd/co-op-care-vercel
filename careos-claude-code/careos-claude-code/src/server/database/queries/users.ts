// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * User Query Builders — PostgreSQL CRUD for the user table
 */
import { getPostgres } from '../postgres.js';
import type { UserRole } from '@shared/constants/business-rules';

/** Internal DB record shape — includes passwordHash (never expose to client). */
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  roles: UserRole[];
  activeRole: UserRole;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  avatarUrl: string | null;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  backgroundCheckStatus: string;
  skills: string[];
  rating: number | null;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: UserRole[];
  activeRole: UserRole;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const db = getPostgres();
  const [user] = await db.create('user', {
    ...input,
    phone: input.phone ?? null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    avatarUrl: null,
    location: null,
    backgroundCheckStatus: 'not_started',
    skills: [],
    rating: null,
    ratingCount: 0,
  } as Record<string, unknown>);
  return user as unknown as UserRecord;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const db = getPostgres();
  const result = await db.query<[UserRecord[]]>('SELECT * FROM type::thing("user", $id) LIMIT 1', {
    id,
  });
  return result[0]?.[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getPostgres();
  const result = await db.query<[UserRecord[]]>('SELECT * FROM user WHERE email = $email LIMIT 1', {
    email,
  });
  return result[0]?.[0] ?? null;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserRecord, 'id' | 'createdAt'>>,
): Promise<UserRecord | null> {
  const db = getPostgres();
  const result = await db.query<[UserRecord[]]>(
    `UPDATE type::thing("user", $id) MERGE $data RETURN AFTER`,
    { id, data: { ...data, updatedAt: new Date().toISOString() } },
  );
  return result[0]?.[0] ?? null;
}

export async function deleteUser(id: string): Promise<void> {
  const db = getPostgres();
  await db.query('DELETE type::thing("user", $id)', { id });
}

export async function setTwoFactorSecret(userId: string, secret: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE type::thing("user", $id) SET twoFactorSecret = $secret, updatedAt = time::now()`,
    { id: userId, secret },
  );
}

export async function enableTwoFactor(userId: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE type::thing("user", $id) SET twoFactorEnabled = true, updatedAt = time::now()`,
    { id: userId },
  );
}

export async function updateUserLocation(
  userId: string,
  longitude: number,
  latitude: number,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE type::thing("user", $id) SET location = { type: 'Point', coordinates: [$lng, $lat] }, updatedAt = time::now()`,
    { id: userId, lng: longitude, lat: latitude },
  );
}

export async function listUsersByRole(role: UserRole): Promise<UserRecord[]> {
  const db = getPostgres();
  const result = await db.query<[UserRecord[]]>(
    'SELECT * FROM user WHERE $role IN roles ORDER BY lastName ASC',
    { role },
  );
  return result[0] ?? [];
}

export async function findNearbyUsers(
  longitude: number,
  latitude: number,
  radiusMiles: number,
  skills?: string[],
): Promise<Array<UserRecord & { distanceMiles: number }>> {
  const db = getPostgres();
  const radiusMeters = radiusMiles * 1609.34;
  const skillFilter = skills?.length ? 'AND array::intersect(skills, $skills) != []' : '';

  const result = await db.query<[Array<UserRecord & { distanceMiles: number }>]>(
    `SELECT *, geo::distance(location, { type: 'Point', coordinates: [$lng, $lat] }) / 1609.34 AS distanceMiles
     FROM user
     WHERE location != NONE
       AND geo::distance(location, { type: 'Point', coordinates: [$lng, $lat] }) < $radius
       ${skillFilter}
     ORDER BY distanceMiles ASC`,
    { lng: longitude, lat: latitude, radius: radiusMeters, skills: skills ?? [] },
  );
  return result[0] ?? [];
}

export interface CandidateUserRecord {
  id: string;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  skills: string[];
  rating: number | null;
  ratingCount: number;
}

export async function findAvailableUsers(
  excludeUserId: string,
  limit: number,
): Promise<CandidateUserRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CandidateUserRecord[]]>(
    `SELECT id, location, skills, rating, ratingCount
     FROM user
     WHERE id != type::thing("user", $excludeUserId)
     LIMIT $limit`,
    { excludeUserId, limit },
  );
  return result[0] ?? [];
}
