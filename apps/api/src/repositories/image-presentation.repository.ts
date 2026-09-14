import { and, eq, inArray } from 'drizzle-orm';
import type { ImagePresentation } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { imagePresentations } from '../db/schema/image-presentations';

const PAGE_MEDIA = 'PAGE_MEDIA';
const PRIMARY = 'PRIMARY';

export async function listForPageMedia(db: DatabaseClient, ownerIds: string[]) {
  if (ownerIds.length === 0) return [];
  return db.select().from(imagePresentations).where(and(eq(imagePresentations.ownerType, PAGE_MEDIA), eq(imagePresentations.slot, PRIMARY), inArray(imagePresentations.ownerId, ownerIds)));
}

export async function upsertForPageMedia(db: DatabaseClient, ownerId: string, input: ImagePresentation) {
  const now = new Date().toISOString();
  await db.insert(imagePresentations).values({ id: crypto.randomUUID(), ownerType: PAGE_MEDIA, ownerId, slot: PRIMARY, ...input, createdAt: now, updatedAt: now }).onConflictDoUpdate({
    target: [imagePresentations.ownerType, imagePresentations.ownerId, imagePresentations.slot],
    set: { ...input, updatedAt: now },
  });
}

export const removeForPageMedia = (db: DatabaseClient, ownerId: string) => db.delete(imagePresentations).where(and(eq(imagePresentations.ownerType, PAGE_MEDIA), eq(imagePresentations.ownerId, ownerId), eq(imagePresentations.slot, PRIMARY)));
