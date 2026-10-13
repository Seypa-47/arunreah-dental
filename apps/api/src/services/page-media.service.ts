import {
  defaultImagePresentation,
  type CreatePageMediaInput,
  type PageMediaPlacement,
  type PublicPageMedia,
  type UpdatePageMediaInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { HttpError } from '../shared/http-error';
import { localize } from '../shared/localize';
import * as repository from '../repositories/page-media.repository';
import * as presentationRepository from '../repositories/image-presentation.repository';

async function withPresentations(
  db: DatabaseClient,
  items: Awaited<ReturnType<typeof repository.listAdmin>>,
) {
  const presentations = await presentationRepository.listForPageMedia(
    db,
    items.map((item) => item.id),
  );
  const byOwnerId = new Map(
    presentations.map((item) => [
      item.ownerId,
      { positionX: item.positionX, positionY: item.positionY, zoom: item.zoom },
    ]),
  );
  return items.map((item) => ({
    ...item,
    imagePresentation: byOwnerId.get(item.id) ?? defaultImagePresentation,
  }));
}
export async function listAdmin(db: DatabaseClient, placement: PageMediaPlacement) {
  return { items: await withPresentations(db, await repository.listAdmin(db, placement)) };
}
export async function listPublic(
  db: DatabaseClient,
  placement: PageMediaPlacement,
  lang: 'en' | 'km',
) {
  const items = await withPresentations(db, await repository.listPublic(db, placement));
  return {
    items: items.map((item) => toPublicItem(item, lang)),
  };
}

function toPublicItem(
  item: Awaited<ReturnType<typeof withPresentations>>[number],
  lang: 'en' | 'km',
): PublicPageMedia {
  return {
    id: item.id,
    imageKey: item.imageKey,
    imagePresentation: item.imagePresentation,
    title: localize(item.titleEn, item.titleKm, lang),
    body: localize(item.bodyEn, item.bodyKm, lang),
    badge: localize(item.badgeEn, item.badgeKm, lang),
    benefits: localize(item.benefitsEn, item.benefitsKm, lang),
    discount: localize(item.discountEn, item.discountKm, lang),
    validUntil: item.validUntil,
    displayOrder: item.displayOrder,
  };
}

export async function listAllPublic(db: DatabaseClient, lang: 'en' | 'km') {
  const empty = (): PublicPageMedia[] => [];
  const grouped = {
    HOME_PROMOTIONS: empty(),
    HOME_HERO: empty(),
    ABOUT_HERO: empty(),
    ABOUT_CLINIC_GALLERY_PSA_CHAS: empty(),
    ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG: empty(),
    ABOUT_PROFESSIONAL_DEVELOPMENT: empty(),
    ABOUT_ADVANCED_FACILITIES: empty(),
    SERVICES_HERO: empty(),
    DOCTORS_HERO: empty(),
    DOCTORS_PATIENT_EDUCATION: empty(),
    BRANCHES_HERO: empty(),
    CONTACT_HERO: empty(),
    SHOWCASES_HERO: empty(),
    BOOKING_HERO: empty(),
  } satisfies Record<PageMediaPlacement, PublicPageMedia[]>;
  const items = await withPresentations(db, await repository.listAllPublic(db));
  for (const item of items) grouped[item.placement].push(toPublicItem(item, lang));
  return grouped;
}
export async function create(db: DatabaseClient, input: CreatePageMediaInput) {
  const item = await repository.create(db, input);
  if (!item) throw new Error('Page media could not be created.');
  return (await withPresentations(db, [item]))[0];
}
export async function update(db: DatabaseClient, id: string, input: UpdatePageMediaInput) {
  if (!(await repository.find(db, id)))
    throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.');
  const item = await repository.update(db, id, input);
  if (!item) throw new Error('Page media could not be updated.');
  return (await withPresentations(db, [item]))[0];
}
export async function remove(db: DatabaseClient, id: string) {
  if (!(await repository.find(db, id)))
    throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.');
  await repository.remove(db, id);
}
