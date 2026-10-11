import type { DatabaseClient } from './client';

export type AtomicBatchStatement = Parameters<DatabaseClient['batch']>[0][number];

/**
 * D1 executes every prepared statement in batch() as one transaction. If any
 * statement fails, D1 rolls the complete batch back. This deliberately avoids
 * drizzle.transaction(), whose BEGIN/COMMIT SQL is unsupported by D1 Workers.
 */
export async function atomicBatch(
  database: DatabaseClient,
  statements: [AtomicBatchStatement, ...AtomicBatchStatement[]],
) {
  return database.batch(statements);
}
