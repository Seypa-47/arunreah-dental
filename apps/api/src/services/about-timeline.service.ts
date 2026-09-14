import type { CreateAboutTimelineInput, UpdateAboutTimelineInput } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { HttpError } from '../shared/http-error';
import * as repository from '../repositories/about-timeline.repository';

export async function listAdmin(db: DatabaseClient) { return { items: await repository.list(db) }; }
export async function listPublic(db: DatabaseClient, lang: 'en' | 'km') {
  return { items: (await repository.list(db, true)).map((item) => ({ id: item.id, year: item.year, title: lang === 'km' ? item.titleKm : item.titleEn, body: lang === 'km' ? item.bodyKm : item.bodyEn, displayOrder: item.displayOrder })) };
}
export async function create(db: DatabaseClient, input: CreateAboutTimelineInput) { const item = await repository.create(db, input); if (!item) throw new Error('Timeline item could not be created.'); return item; }
export async function update(db: DatabaseClient, id: string, input: UpdateAboutTimelineInput) { if (!await repository.find(db, id)) throw new HttpError(404, 'NOT_FOUND', 'Timeline item was not found.'); const item = await repository.update(db, id, input); if (!item) throw new Error('Timeline item could not be updated.'); return item; }
export async function remove(db: DatabaseClient, id: string) { if (!await repository.find(db, id)) throw new HttpError(404, 'NOT_FOUND', 'Timeline item was not found.'); await repository.remove(db, id); }
