// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Database Migration Runner — PostgreSQL schema migrations
 *
 * Reads .ts migration files from this directory, tracks applied migrations
 * in a `_migrations` table, and applies pending migrations in order.
 *
 * Each migration file must export:
 *   up(db: pg.Pool)   — apply the migration
 *   down(db: pg.Pool) — revert the migration
 */
import { readdir } from 'fs/promises';
import { join, basename, dirname } from 'path';
import type pg from 'pg';
import { logger } from '../../common/logger.js';

const __dirname = dirname(__filename);

export interface Migration {
  up: (db: pg.Pool) => Promise<void>;
  down: (db: pg.Pool) => Promise<void>;
}

interface MigrationRecord {
  id: string;
  name: string;
  appliedAt: string;
}

/**
 * Ensure the _migrations tracking table exists in PostgreSQL.
 */
async function ensureMigrationsTable(db: pg.Pool): Promise<void> {
  await db.query(`
    DEFINE TABLE IF NOT EXISTS _migrations SCHEMAFULL;
    DEFINE FIELD IF NOT EXISTS name ON _migrations TYPE string;
    DEFINE FIELD IF NOT EXISTS appliedAt ON _migrations TYPE datetime DEFAULT time::now();
    DEFINE INDEX IF NOT EXISTS idx_migrations_name ON _migrations FIELDS name UNIQUE;
  `);
}

/**
 * Get the list of already-applied migration names from the database.
 */
async function getAppliedMigrations(db: pg.Pool): Promise<Set<string>> {
  const [result] = await db.query<[MigrationRecord[]]>(
    'SELECT name FROM _migrations ORDER BY name ASC',
  );
  const names = new Set<string>();
  if (Array.isArray(result)) {
    for (const row of result) {
      names.add(row.name);
    }
  }
  return names;
}

/**
 * Discover migration files in the migrations directory.
 * Migration files must match the pattern: NNN-*.ts (e.g., 001-initial-schema.ts)
 * Excludes runner.ts itself.
 */
async function discoverMigrations(): Promise<string[]> {
  const files = await readdir(__dirname);
  return files.filter((f) => /^\d{3}-.*\.ts$/.test(f)).sort();
}

/**
 * Run all pending migrations in order.
 *
 * Migrations are .ts files in the same directory as this runner, named
 * with a numeric prefix (e.g., 001-initial-schema.ts). Each must export
 * `up(db)` and `down(db)` functions.
 *
 * @param db - Connected PostgreSQL pool
 * @returns Number of migrations applied
 */
export async function runMigrations(db: pg.Pool): Promise<number> {
  await ensureMigrationsTable(db);

  const applied = await getAppliedMigrations(db);
  const migrationFiles = await discoverMigrations();

  let count = 0;

  for (const file of migrationFiles) {
    const migrationName = basename(file, '.ts');

    if (applied.has(migrationName)) {
      logger.debug({ migration: migrationName }, 'Migration already applied, skipping');
      continue;
    }

    logger.info({ migration: migrationName }, 'Applying migration...');

    try {
      const migrationPath = join(__dirname, file);
      const migration: Migration = await import(migrationPath);

      if (typeof migration.up !== 'function') {
        throw new Error(`Migration ${migrationName} does not export an up() function`);
      }

      await migration.up(db);

      await db.query('CREATE _migrations SET name = $name, appliedAt = time::now()', {
        name: migrationName,
      });

      logger.info({ migration: migrationName }, 'Migration applied successfully');
      count++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ migration: migrationName, error: message }, 'Migration failed');
      throw new Error(`Migration ${migrationName} failed: ${message}`);
    }
  }

  if (count === 0) {
    logger.info('No pending migrations');
  } else {
    logger.info({ count }, 'All pending migrations applied');
  }

  return count;
}

/**
 * Roll back the most recently applied migration.
 *
 * @param db - Connected PostgreSQL pool
 * @returns The name of the rolled-back migration, or null if none to roll back
 */
export async function rollbackMigration(db: pg.Pool): Promise<string | null> {
  await ensureMigrationsTable(db);

  const [result] = await db.query<[MigrationRecord[]]>(
    'SELECT * FROM _migrations ORDER BY name DESC LIMIT 1',
  );

  if (!Array.isArray(result) || result.length === 0) {
    logger.info('No migrations to roll back');
    return null;
  }

  const lastMigration = result[0]!;
  const migrationName = lastMigration.name;
  const file = `${migrationName}.ts`;

  logger.info({ migration: migrationName }, 'Rolling back migration...');

  try {
    const migrationPath = join(__dirname, file);
    const migration: Migration = await import(migrationPath);

    if (typeof migration.down !== 'function') {
      throw new Error(`Migration ${migrationName} does not export a down() function`);
    }

    await migration.down(db);

    await db.query('DELETE FROM _migrations WHERE name = $name', { name: migrationName });

    logger.info({ migration: migrationName }, 'Migration rolled back successfully');
    return migrationName;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ migration: migrationName, error: message }, 'Rollback failed');
    throw new Error(`Rollback of ${migrationName} failed: ${message}`);
  }
}
