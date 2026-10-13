import { sql } from 'drizzle-orm';
import type { DatabaseClient } from '../db/client';

export async function reserveProviderUsageAlert(database: DatabaseClient, alertKey: string) {
  const result = await database.run(
    sql`INSERT OR IGNORE INTO provider_usage_alerts (alert_key) VALUES (${alertKey})`,
  );
  return (result.meta.changes ?? 0) > 0;
}

export async function releaseProviderUsageAlert(database: DatabaseClient, alertKey: string) {
  await database.run(sql`DELETE FROM provider_usage_alerts WHERE alert_key = ${alertKey}`);
}
