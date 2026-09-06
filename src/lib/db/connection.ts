// src/lib/db/connection.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import path from 'node:path';
import fs from 'node:fs';
import postgres from 'postgres';
import { DatabaseSync } from 'node:sqlite';
import { CREATE_TABLES_SQL } from './schema';

export interface TransactionContext {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid?: number | bigint }>;
  rawTx?: any;
}

interface DbExecutor {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid?: number | bigint }>;
}

const txStorage = new AsyncLocalStorage<DbExecutor>();

let pgClient: postgres.Sql | null = null;
let sqliteClient: DatabaseSync | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Normalizes SQL query for PostgreSQL by replacing ? with $1, $2, ...
 * and translating SQLite datetime/date functions.
 */
export function formatPgQuery(sql: string, params: any[] = []): { text: string; values: any[] } {
  let paramIndex = 1;
  const text = sql
    .replace(/\?/g, () => `$${paramIndex++}`)
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/date\('now'\)/gi, 'CURRENT_DATE');
  return { text, values: params };
}

/**
 * Returns true if a PostgreSQL connection string is configured.
 */
export function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
  return Boolean(url && (url.startsWith('postgres://') || url.startsWith('postgresql://')));
}

/**
 * Retrieves the PostgreSQL client instance for Supabase.
 */
export function getPgClient(): postgres.Sql {
  if (pgClient) {
    return pgClient;
  }

  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured for PostgreSQL/Supabase.');
  }

  // Use prepare: false for Supabase Supavisor connection pooler (port 6543 / transaction mode)
  pgClient = postgres(url, {
    prepare: false,
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return pgClient;
}

/**
 * Retrieves local SQLite client fallback for offline dev/tests.
 */
export function getSqliteClient(): DatabaseSync {
  if (sqliteClient) {
    return sqliteClient;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const dataDir = isServerless ? '/tmp' : path.resolve(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch {
    // Ignore if directory exists or filesystem is read-only
  }

  const dbPath = path.join(dataDir, 'codebridge.db');
  sqliteClient = new DatabaseSync(dbPath);
  sqliteClient.exec('PRAGMA foreign_keys = ON;');
  sqliteClient.exec('PRAGMA journal_mode = WAL;');
  sqliteClient.exec(CREATE_TABLES_SQL);

  try {
    const cols = sqliteClient.prepare('PRAGMA table_info(users);').all() as any[];
    const hasGoogleId = cols.some((c: any) => c.name === 'google_id');
    if (!hasGoogleId) {
      sqliteClient.exec('ALTER TABLE users ADD COLUMN google_id TEXT;');
    }
    sqliteClient.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');

    // Phase 3 migrations for SQLite
    const repCols = sqliteClient.prepare('PRAGMA table_info(representatives);').all() as any[];
    if (!repCols.some((c: any) => c.name === 'referral_code')) {
      sqliteClient.exec('ALTER TABLE representatives ADD COLUMN referral_code TEXT;');
      sqliteClient.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_rep_referral_code ON representatives(referral_code);');
    }

    const leadCols = sqliteClient.prepare('PRAGMA table_info(leads);').all() as any[];
    if (!leadCols.some((c: any) => c.name === 'client_id')) {
      sqliteClient.exec(`
        ALTER TABLE leads ADD COLUMN client_id TEXT REFERENCES clients(id);
        ALTER TABLE leads ADD COLUMN service_id TEXT REFERENCES services(id);
        ALTER TABLE leads ADD COLUMN timeline TEXT;
        ALTER TABLE leads ADD COLUMN referral_source TEXT NOT NULL DEFAULT 'DIRECT';
      `);
    }

    const notifCols = sqliteClient.prepare('PRAGMA table_info(notifications);').all() as any[];
    if (!notifCols.some((c: any) => c.name === 'link_url')) {
      sqliteClient.exec('ALTER TABLE notifications ADD COLUMN link_url TEXT;');
    }

    const msgCols = sqliteClient.prepare('PRAGMA table_info(messages);').all() as any[];
    if (!msgCols.some((c: any) => c.name === 'lead_id')) {
      sqliteClient.exec(`
        ALTER TABLE messages ADD COLUMN lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE;
        ALTER TABLE messages ADD COLUMN message_type TEXT NOT NULL DEFAULT 'CHAT';
      `);
    }
  } catch (err) {
    console.error('Error applying SQLite migrations:', err);
  }

  return sqliteClient;
}

/**
 * Ensures PostgreSQL schema has required columns and indexes.
 */
async function ensurePostgresSchema(pg: postgres.Sql): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await pg.unsafe(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT;
          CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
          
          -- Phase 3 Migrations
          ALTER TABLE representatives ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
          
          ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_id TEXT REFERENCES clients(id);
          ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_id TEXT REFERENCES services(id);
          ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline TEXT;
          ALTER TABLE leads ADD COLUMN IF NOT EXISTS referral_source TEXT NOT NULL DEFAULT 'DIRECT';
          
          ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
          
          ALTER TABLE messages ADD COLUMN IF NOT EXISTS lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE;
          ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'CHAT';
        `);
      } catch (err: any) {
        console.error('Error ensuring PostgreSQL schema:', err.message);
      }
    })();
  }
  await initPromise;
}

/**
 * Resets client instances (useful for testing or hot-reloads).
 */
export function resetClient(): void {
  if (pgClient) {
    try {
      pgClient.end({ timeout: 1 }).catch(() => {});
    } catch {}
    pgClient = null;
  }
  if (sqliteClient) {
    try {
      sqliteClient.close();
    } catch {}
    sqliteClient = null;
  }
  initPromise = null;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const activeTx = txStorage.getStore();
  if (activeTx) {
    return activeTx.query<T>(sql, params);
  }

  if (isPostgresConfigured()) {
    const pg = getPgClient();
    await ensurePostgresSchema(pg);
    const { text, values } = formatPgQuery(sql, params);
    const rows = await pg.unsafe(text, values);
    return Array.from(rows).map((r) => ({ ...r })) as T[];
  }

  const sqlite = getSqliteClient();
  const stmt = sqlite.prepare(sql);
  const rows = stmt.all(...params);
  return rows.map((r: any) => ({ ...r })) as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const activeTx = txStorage.getStore();
  if (activeTx) {
    return activeTx.queryOne<T>(sql, params);
  }

  if (isPostgresConfigured()) {
    const pg = getPgClient();
    await ensurePostgresSchema(pg);
    const { text, values } = formatPgQuery(sql, params);
    const rows = await pg.unsafe(text, values);
    if (!rows || rows.length === 0) {
      return null;
    }
    return { ...rows[0] } as T;
  }

  const sqlite = getSqliteClient();
  const stmt = sqlite.prepare(sql);
  const row = stmt.get(...params);
  return row ? ({ ...row } as T) : null;
}

export async function execute(
  sql: string,
  params: any[] = []
): Promise<{ changes: number; lastInsertRowid?: number | bigint }> {
  const activeTx = txStorage.getStore();
  if (activeTx) {
    return activeTx.execute(sql, params);
  }

  if (isPostgresConfigured()) {
    const pg = getPgClient();
    await ensurePostgresSchema(pg);
    const { text, values } = formatPgQuery(sql, params);
    const result = await pg.unsafe(text, values);
    return { changes: result.count || 0 };
  }

  const sqlite = getSqliteClient();
  const stmt = sqlite.prepare(sql);
  const res = stmt.run(...params);
  return {
    changes: Number(res.changes),
    lastInsertRowid: res.lastInsertRowid,
  };
}

export async function transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
  if (isPostgresConfigured()) {
    const pg = getPgClient();
    await ensurePostgresSchema(pg);
    const result = await pg.begin(async (txSql: any) => {
      const txContext: TransactionContext = {
        rawTx: txSql,
        query: async <R = any>(sql: string, params: any[] = []): Promise<R[]> => {
          const { text, values } = formatPgQuery(sql, params);
          const rows = await txSql.unsafe(text, values);
          return Array.from(rows).map((r: any) => ({ ...r })) as R[];
        },
        queryOne: async <R = any>(sql: string, params: any[] = []): Promise<R | null> => {
          const { text, values } = formatPgQuery(sql, params);
          const rows = await txSql.unsafe(text, values);
          return rows && rows.length > 0 ? ({ ...rows[0] } as R) : null;
        },
        execute: async (sql: string, params: any[] = []): Promise<{ changes: number }> => {
          const { text, values } = formatPgQuery(sql, params);
          const result = await txSql.unsafe(text, values);
          return { changes: result.count || 0 };
        },
      };

      return txStorage.run(txContext, async () => {
        return fn(txContext);
      });
    });
    return result as T;
  }

  // SQLite fallback transaction
  const sqlite = getSqliteClient();
  sqlite.exec('BEGIN TRANSACTION;');

  const txContext: TransactionContext = {
    query: async <R = any>(sql: string, params: any[] = []): Promise<R[]> => {
      const stmt = sqlite.prepare(sql);
      const rows = stmt.all(...params);
      return rows.map((r: any) => ({ ...r })) as R[];
    },
    queryOne: async <R = any>(sql: string, params: any[] = []): Promise<R | null> => {
      const stmt = sqlite.prepare(sql);
      const row = stmt.get(...params);
      return row ? ({ ...row } as R) : null;
    },
    execute: async (sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number | bigint }> => {
      const stmt = sqlite.prepare(sql);
      const res = stmt.run(...params);
      return {
        changes: Number(res.changes),
        lastInsertRowid: res.lastInsertRowid,
      };
    },
  };

  return txStorage.run(txContext, async () => {
    try {
      const result = await fn(txContext);
      sqlite.exec('COMMIT;');
      return result;
    } catch (err) {
      try {
        sqlite.exec('ROLLBACK;');
      } catch {}
      throw err;
    }
  });
}
