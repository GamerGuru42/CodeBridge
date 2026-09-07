// tests/test-db-adapter.mjs
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { DatabaseSync } from 'node:sqlite';

function getDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/^DATABASE_URL=(.*)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const dbUrl = getDbUrl();

class TestDbAdapter {
  constructor() {
    if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
      this.isPg = true;
      this.sql = postgres(dbUrl, {
        ssl: 'require',
        prepare: false,
        max: 10,
        idle_timeout: 30,
        connect_timeout: 20,
      });
    } else {
      this.isPg = false;
      const dbPath = path.resolve(process.cwd(), './data/codebridge.db');
      this.sqlite = new DatabaseSync(dbPath);
    }
  }

  formatQuery(query) {
    let pIdx = 1;
    return query
      .replace(/\?/g, () => `$${pIdx++}`)
      .replace(/datetime\('now'\)/gi, 'NOW()')
      .replace(/date\('now'\)/gi, 'CURRENT_DATE');
  }

  async get(query, params = []) {
    if (this.isPg) {
      const text = this.formatQuery(query);
      const rows = await this.sql.unsafe(text, params);
      return rows[0] || null;
    } else {
      return this.sqlite.prepare(query).get(...params) || null;
    }
  }

  async all(query, params = []) {
    if (this.isPg) {
      const text = this.formatQuery(query);
      const rows = await this.sql.unsafe(text, params);
      return rows;
    } else {
      return this.sqlite.prepare(query).all(...params);
    }
  }

  async run(query, params = []) {
    if (this.isPg) {
      const text = this.formatQuery(query);
      return await this.sql.unsafe(text, params);
    } else {
      return this.sqlite.prepare(query).run(...params);
    }
  }

  async close() {
    if (this.isPg) {
      await this.sql.end({ timeout: 1 });
    } else {
      this.sqlite.close();
    }
  }
}

export const testDb = new TestDbAdapter();
