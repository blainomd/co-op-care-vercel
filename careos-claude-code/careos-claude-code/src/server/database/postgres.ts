/**
 * PostgreSQL Connection Client
 * Operational database — aligned with Health Samurai/Aidbox (FHIR on PostgreSQL)
 */
import pg from 'pg';
const { Pool } = pg;
import { config } from '../config/settings.js';
import { logger } from '../common/logger.js';
import { DatabaseError } from '../common/errors.js';

let pool: pg.Pool | null = null;

/**
 * Build the SSL config for PostgreSQL.
 *
 * - Development: no TLS (plain TCP to local Docker)
 * - Production: TLS required, certificate verification ON by default.
 *
 * For cloud providers that issue self-signed certs (Supabase, Railway):
 *   Set POSTGRES_SSL_REJECT_UNAUTHORIZED=false in the environment.
 *   Better: set POSTGRES_SSL_CA to the provider's PEM CA bundle so
 *   rejectUnauthorized can stay true (AWS RDS, GCP CloudSQL).
 *
 * HIPAA requirement: encryption in transit is non-negotiable in production.
 */
function buildSSLConfig(): boolean | { ca?: string; rejectUnauthorized: boolean } {
  if (!config.isProd()) return false;

  const ca = process.env['POSTGRES_SSL_CA'];
  const rejectUnauthorized = process.env['POSTGRES_SSL_REJECT_UNAUTHORIZED'] !== 'false';

  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized };
}

export async function connectPostgres(): Promise<pg.Pool> {
  if (pool) return pool;

  try {
    pool = new Pool({
      connectionString: config.database.url,
      max: config.database.poolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: buildSSLConfig(),
    });

    // Verify connectivity
    const client = await pool.connect();
    client.release();

    logger.info(
      { url: config.database.url.replace(/\/\/.*@/, '//<credentials>@') },
      'PostgreSQL connected',
    );

    return pool;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to PostgreSQL');
    throw new DatabaseError('postgres_connect');
  }
}

export function getPostgres(): pg.Pool {
  if (!pool) {
    throw new DatabaseError('PostgreSQL not initialized — call connectPostgres() first');
  }
  return pool;
}

/** Alias for getPostgres — used by query builders */
export const getPool = getPostgres;

export async function closePostgres(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL disconnected');
  }
}

/**
 * Initialize PostgreSQL schema — tables, indexes, relations
 * Called once at startup. Reads and executes schema.sql.
 */
export async function initPostgresSchema(client: pg.Pool): Promise<void> {
  const { readFile } = await import('fs/promises');
  const { dirname, join } = await import('path');

  const __dirname = dirname(__filename);
  const schemaPath = join(__dirname, 'schema.sql');

  try {
    const schema = await readFile(schemaPath, 'utf-8');
    await client.query(schema);
    logger.info('PostgreSQL schema initialized');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize PostgreSQL schema');
    throw new DatabaseError('postgres_schema_init');
  }
}
