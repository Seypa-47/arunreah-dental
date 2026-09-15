import type { DatabaseClient } from './client';

type Transaction = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];

/**
 * Production D1 clients always expose transactions. The fallback keeps the
 * route-level repository mocks used in isolated tests compatible; it is never
 * selected by `createDbClient` in the Worker runtime.
 */
export async function inTransaction<T>(
  database: DatabaseClient,
  callback: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  if (typeof database.transaction === 'function') return database.transaction(callback);
  return callback(database as unknown as Transaction);
}
