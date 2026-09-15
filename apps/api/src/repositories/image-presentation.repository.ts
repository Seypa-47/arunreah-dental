import { and, eq, or } from 'drizzle-orm';
import type { ImagePresentation, ImagePresentationOwnerType } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { imagePresentations } from '../db/schema/image-presentations';

type WriteDatabase = DatabaseClient | Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];
export type ImagePresentationOwner = { ownerType: ImagePresentationOwnerType; ownerId: string; slot: string };

export async function listForOwners(db: DatabaseClient, owners: ImagePresentationOwner[]) {
  if (owners.length === 0) return [];
  return db.select().from(imagePresentations).where(or(...owners.map((owner) => and(
    eq(imagePresentations.ownerType, owner.ownerType),
    eq(imagePresentations.ownerId, owner.ownerId),
    eq(imagePresentations.slot, owner.slot),
  ))));
}

export async function upsert(db: WriteDatabase, owner: ImagePresentationOwner, input: ImagePresentation) {
  const now = new Date().toISOString();
  await db.insert(imagePresentations).values({ id: crypto.randomUUID(), ...owner, ...input, createdAt: now, updatedAt: now }).onConflictDoUpdate({
    target: [imagePresentations.ownerType, imagePresentations.ownerId, imagePresentations.slot],
    set: { ...input, updatedAt: now },
  });
}

export async function removeForOwners(db: WriteDatabase, owners: Pick<ImagePresentationOwner, 'ownerType' | 'ownerId'>[]) {
  if (owners.length === 0) return;
  await db.delete(imagePresentations).where(or(...owners.map((owner) => and(
    eq(imagePresentations.ownerType, owner.ownerType),
    eq(imagePresentations.ownerId, owner.ownerId),
  ))));
}

export const listForPageMedia = (db: DatabaseClient, ownerIds: string[]) =>
  listForOwners(db, ownerIds.map((ownerId) => ({ ownerType: 'PAGE_MEDIA', ownerId, slot: 'PRIMARY' })));
export const upsertForPageMedia = (db: WriteDatabase, ownerId: string, input: ImagePresentation) =>
  upsert(db, { ownerType: 'PAGE_MEDIA', ownerId, slot: 'PRIMARY' }, input);
export const removeForPageMedia = (db: WriteDatabase, ownerId: string) =>
  removeForOwners(db, [{ ownerType: 'PAGE_MEDIA', ownerId }]);
