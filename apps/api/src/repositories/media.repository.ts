import { eq, or, sql } from 'drizzle-orm';
import {
  branches,
  clinicSettings,
  doctors,
  pageMedia,
  serviceDetailSections,
  services,
  showcaseSections,
  showcases,
  mediaDeletionLocks,
} from '../db/schema';
import type { DatabaseClient } from '../db/client';
type WriteDatabase = DatabaseClient | Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];

/**
 * Media keys are stored directly by the small number of CMS domains. A media
 * table would duplicate those references without providing additional value.
 */
export async function isMediaKeyReferenced(database: WriteDatabase, key: string) {
  const references = await Promise.all([
    database
      .select({ id: clinicSettings.id })
      .from(clinicSettings)
      .where(eq(clinicSettings.logoKey, key))
      .limit(1),
    database
      .select({ id: branches.id })
      .from(branches)
      .where(or(eq(branches.heroImageKey, key), eq(branches.branchImageKey, key)))
      .limit(1),
    database
      .select({ id: services.id })
      .from(services)
      .where(
        or(
          eq(services.imageKey, key),
          eq(services.heroImageKey, key),
          eq(services.aboutImageKey, key),
        ),
      )
      .limit(1),
    database.select({ id: doctors.id }).from(doctors).where(eq(doctors.photoKey, key)).limit(1),
    database
      .select({ id: showcases.id })
      .from(showcases)
      .where(eq(showcases.coverImageKey, key))
      .limit(1),
    database
      .select({ id: serviceDetailSections.id })
      .from(serviceDetailSections)
      .where(eq(serviceDetailSections.imageKey, key))
      .limit(1),
    database
      .select({ id: showcaseSections.id })
      .from(showcaseSections)
      .where(eq(showcaseSections.imageKey, key))
      .limit(1),
    database
      .select({ id: pageMedia.id })
      .from(pageMedia)
      .where(eq(pageMedia.imageKey, key))
      .limit(1),
  ]);

  return references.some((result) => result.length > 0);
}

export async function createMediaDeletionLock(database: DatabaseClient, key: string) {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const locked = await database.get<{ key: string }>(sql`
    INSERT INTO media_deletion_locks (key, created_at)
    SELECT ${key}, ${now.toISOString()}
    WHERE NOT EXISTS (
      SELECT 1 FROM clinic_settings WHERE logo_key = ${key}
      UNION ALL SELECT 1 FROM branches WHERE hero_image_key = ${key} OR branch_image_key = ${key}
      UNION ALL SELECT 1 FROM services WHERE image_key = ${key} OR hero_image_key = ${key} OR about_image_key = ${key}
      UNION ALL SELECT 1 FROM doctors WHERE photo_key = ${key}
      UNION ALL SELECT 1 FROM showcases WHERE cover_image_key = ${key}
      UNION ALL SELECT 1 FROM service_detail_sections WHERE image_key = ${key}
      UNION ALL SELECT 1 FROM showcase_sections WHERE image_key = ${key}
      UNION ALL SELECT 1 FROM page_media WHERE image_key = ${key}
    )
    ON CONFLICT(key) DO UPDATE SET created_at = excluded.created_at
    WHERE media_deletion_locks.created_at <= ${staleBefore}
      AND NOT EXISTS (
        SELECT 1 FROM clinic_settings WHERE logo_key = ${key}
        UNION ALL SELECT 1 FROM branches WHERE hero_image_key = ${key} OR branch_image_key = ${key}
        UNION ALL SELECT 1 FROM services WHERE image_key = ${key} OR hero_image_key = ${key} OR about_image_key = ${key}
        UNION ALL SELECT 1 FROM doctors WHERE photo_key = ${key}
        UNION ALL SELECT 1 FROM showcases WHERE cover_image_key = ${key}
        UNION ALL SELECT 1 FROM service_detail_sections WHERE image_key = ${key}
        UNION ALL SELECT 1 FROM showcase_sections WHERE image_key = ${key}
        UNION ALL SELECT 1 FROM page_media WHERE image_key = ${key}
      )
    RETURNING key
  `);
  return Boolean(locked);
}

export async function removeMediaDeletionLock(database: WriteDatabase, key: string) {
  await database.delete(mediaDeletionLocks).where(eq(mediaDeletionLocks.key, key));
}

export async function cleanupStaleMediaDeletionLocks(
  database: DatabaseClient,
  staleBefore: string,
  limit: number,
) {
  return database.run(sql`
    DELETE FROM media_deletion_locks
    WHERE rowid IN (
      SELECT rowid FROM media_deletion_locks
      WHERE created_at <= ${staleBefore}
      ORDER BY created_at ASC
      LIMIT ${limit}
    )
  `);
}
