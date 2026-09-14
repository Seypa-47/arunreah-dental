import { and, asc, eq } from 'drizzle-orm';
import type { CreatePageMediaInput, PageMediaPlacement, UpdatePageMediaInput } from '@arunreah/shared';
import { pageMedia } from '../db/schema/page-media';
import type { DatabaseClient } from '../db/client';

export const list = (db: DatabaseClient, placement: PageMediaPlacement, publishedOnly = false) => db.select().from(pageMedia).where(publishedOnly ? and(eq(pageMedia.placement, placement), eq(pageMedia.status, 'PUBLISHED')) : eq(pageMedia.placement, placement)).orderBy(asc(pageMedia.displayOrder), asc(pageMedia.id));
export const find = async (db: DatabaseClient, id: string) => (await db.select().from(pageMedia).where(eq(pageMedia.id, id)).limit(1))[0];
export async function create(db: DatabaseClient, input: CreatePageMediaInput) { const id = crypto.randomUUID(); const now = new Date().toISOString(); await db.insert(pageMedia).values({ id, ...input, titleEn: input.titleEn ?? null, titleKm: input.titleKm ?? null, bodyEn: input.bodyEn ?? null, bodyKm: input.bodyKm ?? null, createdAt: now, updatedAt: now }); return find(db, id); }
export async function update(db: DatabaseClient, id: string, input: UpdatePageMediaInput) { await db.update(pageMedia).set({ ...input, updatedAt: new Date().toISOString() }).where(eq(pageMedia.id, id)); return find(db, id); }
export const remove = (db: DatabaseClient, id: string) => db.delete(pageMedia).where(eq(pageMedia.id, id));
