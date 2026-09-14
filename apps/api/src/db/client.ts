import { drizzle } from 'drizzle-orm/d1';

export function createDbClient(database: D1Database) {
  return drizzle(database);
}
