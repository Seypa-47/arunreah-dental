import type { CreatePageMediaInput, PageMediaPlacement, UpdatePageMediaInput } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { HttpError } from '../shared/http-error';
import * as repository from '../repositories/page-media.repository';

const admin = (item: NonNullable<Awaited<ReturnType<typeof repository.find>>>) => item;
export async function listAdmin(db: DatabaseClient, placement: PageMediaPlacement) { return { items: (await repository.list(db, placement)).map(admin) }; }
export async function listPublic(db: DatabaseClient, placement: PageMediaPlacement, lang: 'en' | 'km') { return { items: (await repository.list(db, placement, true)).map((item) => ({ id: item.id, imageKey: item.imageKey, title: lang === 'km' ? item.titleKm : item.titleEn, body: lang === 'km' ? item.bodyKm : item.bodyEn, displayOrder: item.displayOrder })) }; }
export async function create(db: DatabaseClient, input: CreatePageMediaInput) { const item = await repository.create(db, input); if (!item) throw new Error('Page media could not be created.'); return admin(item); }
export async function update(db: DatabaseClient, id: string, input: UpdatePageMediaInput) { if (!await repository.find(db, id)) throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.'); const item = await repository.update(db, id, input); if (!item) throw new Error('Page media could not be updated.'); return admin(item); }
export async function remove(db: DatabaseClient, id: string) { if (!await repository.find(db, id)) throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.'); await repository.remove(db, id); }
