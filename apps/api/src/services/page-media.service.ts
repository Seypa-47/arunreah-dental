import { defaultImagePresentation, type CreatePageMediaInput, type PageMediaPlacement, type UpdatePageMediaInput } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { HttpError } from '../shared/http-error';
import { localize } from '../shared/localize';
import * as repository from '../repositories/page-media.repository';
import * as presentationRepository from '../repositories/image-presentation.repository';

async function withPresentations(db: DatabaseClient, items: Awaited<ReturnType<typeof repository.listAdmin>>) {
  const presentations = await presentationRepository.listForPageMedia(db, items.map((item) => item.id));
  const byOwnerId = new Map(presentations.map((item) => [item.ownerId, { positionX: item.positionX, positionY: item.positionY, zoom: item.zoom }]));
  return items.map((item) => ({ ...item, imagePresentation: byOwnerId.get(item.id) ?? defaultImagePresentation }));
}
export async function listAdmin(db: DatabaseClient, placement: PageMediaPlacement) { return { items: await withPresentations(db, await repository.listAdmin(db, placement)) }; }
export async function listPublic(db: DatabaseClient, placement: PageMediaPlacement, lang: 'en' | 'km') { return { items: (await withPresentations(db, await repository.listPublic(db, placement))).map((item) => ({ id: item.id, imageKey: item.imageKey, imagePresentation: item.imagePresentation, title: localize(item.titleEn, item.titleKm, lang), body: localize(item.bodyEn, item.bodyKm, lang), badge: localize(item.badgeEn, item.badgeKm, lang), benefits: localize(item.benefitsEn, item.benefitsKm, lang), discount: localize(item.discountEn, item.discountKm, lang), validUntil: item.validUntil, displayOrder: item.displayOrder })) }; }
export async function create(db: DatabaseClient, input: CreatePageMediaInput) { const { imagePresentation, ...pageMediaInput } = input; const item = await repository.create(db, pageMediaInput); if (!item) throw new Error('Page media could not be created.'); if (imagePresentation) await presentationRepository.upsertForPageMedia(db, item.id, imagePresentation); return (await withPresentations(db, [item]))[0]; }
export async function update(db: DatabaseClient, id: string, input: UpdatePageMediaInput) { if (!await repository.find(db, id)) throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.'); const { imagePresentation, ...pageMediaInput } = input; const item = await repository.update(db, id, pageMediaInput); if (!item) throw new Error('Page media could not be updated.'); if (imagePresentation) await presentationRepository.upsertForPageMedia(db, item.id, imagePresentation); return (await withPresentations(db, [item]))[0]; }
export async function remove(db: DatabaseClient, id: string) { if (!await repository.find(db, id)) throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.'); await presentationRepository.removeForPageMedia(db, id); await repository.remove(db, id); }
