import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

export function getDB() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url || url.includes('REPLACE_WITH_YOUR')) {
      throw new Error('DATABASE_URL is not set correctly in env');
    }
    sql = neon(url);
  }
  return sql;
}
