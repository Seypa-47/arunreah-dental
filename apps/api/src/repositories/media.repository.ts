import { eq, or } from 'drizzle-orm';
import {
  branches,
  clinicSettings,
  doctors,
  services,
  showcaseSections,
  showcases,
} from '../db/schema';
import type { DatabaseClient } from '../db/client';

/**
 * Media keys are stored directly by the small number of CMS domains. A media
 * table would duplicate those references without providing additional value.
 */
export async function isMediaKeyReferenced(database: DatabaseClient, key: string) {
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
      .select({ id: showcaseSections.id })
      .from(showcaseSections)
      .where(eq(showcaseSections.imageKey, key))
      .limit(1),
  ]);

  return references.some((result) => result.length > 0);
}
