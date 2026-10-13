import { and, asc, eq } from 'drizzle-orm';
import type {
  CreatePageMediaInput,
  PageMediaPlacement,
  UpdatePageMediaInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { atomicBatch, type AtomicBatchStatement } from '../db/transaction';
import { imagePresentations } from '../db/schema/image-presentations';
import { pageMedia } from '../db/schema/page-media';
import { upsertStatement } from './image-presentation.repository';

export const listAdmin = (db: DatabaseClient, placement: PageMediaPlacement) =>
  db
    .select()
    .from(pageMedia)
    .where(eq(pageMedia.placement, placement))
    .orderBy(asc(pageMedia.displayOrder), asc(pageMedia.id));

export const listPublic = (db: DatabaseClient, placement: PageMediaPlacement) =>
  db
    .select()
    .from(pageMedia)
    .where(and(eq(pageMedia.placement, placement), eq(pageMedia.status, 'PUBLISHED')))
    .orderBy(asc(pageMedia.displayOrder), asc(pageMedia.id));

export const listAllPublic = (db: DatabaseClient) =>
  db
    .select()
    .from(pageMedia)
    .where(eq(pageMedia.status, 'PUBLISHED'))
    .orderBy(asc(pageMedia.placement), asc(pageMedia.displayOrder), asc(pageMedia.id));

export const find = async (db: DatabaseClient, id: string) =>
  (await db.select().from(pageMedia).where(eq(pageMedia.id, id)).limit(1))[0];

export async function create(db: DatabaseClient, input: CreatePageMediaInput) {
  const { imagePresentation, ...pageMediaInput } = input;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const statements: [AtomicBatchStatement, ...AtomicBatchStatement[]] = [
    db.insert(pageMedia).values({
      id,
      ...pageMediaInput,
      titleEn: pageMediaInput.titleEn ?? null,
      titleKm: pageMediaInput.titleKm ?? null,
      bodyEn: pageMediaInput.bodyEn ?? null,
      bodyKm: pageMediaInput.bodyKm ?? null,
      badgeEn: pageMediaInput.badgeEn ?? null,
      badgeKm: pageMediaInput.badgeKm ?? null,
      discountEn: pageMediaInput.discountEn ?? null,
      discountKm: pageMediaInput.discountKm ?? null,
      benefitsEn: pageMediaInput.benefitsEn ?? null,
      benefitsKm: pageMediaInput.benefitsKm ?? null,
      validUntil: pageMediaInput.validUntil ?? null,
      createdAt: now,
      updatedAt: now,
    }),
  ];
  if (imagePresentation) {
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'PAGE_MEDIA', ownerId: id, slot: 'PRIMARY' },
        imagePresentation,
      ),
    );
  }
  await atomicBatch(db, statements);
  return find(db, id);
}

export async function update(db: DatabaseClient, id: string, input: UpdatePageMediaInput) {
  const { imagePresentation, ...pageMediaInput } = input;
  const statements: [AtomicBatchStatement, ...AtomicBatchStatement[]] = [
    db
      .update(pageMedia)
      .set({ ...pageMediaInput, updatedAt: new Date().toISOString() })
      .where(eq(pageMedia.id, id)),
  ];
  if (imagePresentation) {
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'PAGE_MEDIA', ownerId: id, slot: 'PRIMARY' },
        imagePresentation,
      ),
    );
  }
  await atomicBatch(db, statements);
  return find(db, id);
}

export async function remove(db: DatabaseClient, id: string) {
  await atomicBatch(db, [
    db
      .delete(imagePresentations)
      .where(
        and(eq(imagePresentations.ownerType, 'PAGE_MEDIA'), eq(imagePresentations.ownerId, id)),
      ),
    db.delete(pageMedia).where(eq(pageMedia.id, id)),
  ]);
}
