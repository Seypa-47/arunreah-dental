import type { DatabaseClient } from './client';

type Transaction = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];

/**
 * Cloudflare D1 in standard Worker runtime does not support SQL BEGIN/COMMIT statements.
 * Calling drizzle's database.transaction() issues raw BEGIN statements that Cloudflare
 * rejects with error code 7500. Executing the callback directly executes all queries
 * sequentially against the database client.
 */
export async function inTransaction<T>(
  database: DatabaseClient,
  callback: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  return callback(database as unknown as Transaction);
}

