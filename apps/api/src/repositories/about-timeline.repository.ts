import { asc, eq } from 'drizzle-orm';
import type { CreateAboutTimelineInput, UpdateAboutTimelineInput } from '@arunreah/shared';
import { aboutTimeline } from '../db/schema/about-timeline';
import type { DatabaseClient } from '../db/client';

export const list = (db: DatabaseClient, publishedOnly = false) => db.select().from(aboutTimeline).where(publishedOnly ? eq(aboutTimeline.status, 'PUBLISHED') : undefined).orderBy(asc(aboutTimeline.displayOrder), asc(aboutTimeline.year), asc(aboutTimeline.id));
export const find = async (db: DatabaseClient, id: string) => (await db.select().from(aboutTimeline).where(eq(aboutTimeline.id, id)).limit(1))[0];
export async function create(db: DatabaseClient, input: CreateAboutTimelineInput) { const id = crypto.randomUUID(); const now = new Date().toISOString(); await db.insert(aboutTimeline).values({ id, ...input, createdAt: now, updatedAt: now }); return find(db, id); }
export async function update(db: DatabaseClient, id: string, input: UpdateAboutTimelineInput) { await db.update(aboutTimeline).set({ ...input, updatedAt: new Date().toISOString() }).where(eq(aboutTimeline.id, id)); return find(db, id); }
export const remove = (db: DatabaseClient, id: string) => db.delete(aboutTimeline).where(eq(aboutTimeline.id, id));
