import { and, asc, count, desc, eq, inArray, like, or } from 'drizzle-orm';
import type {
  CreateServiceInput,
  ImagePresentation,
  ServiceListQuery,
  UpdateServiceInput,
} from '@arunreah/shared';
import {
  appointments,
  imagePresentations,
  serviceBenefits,
  serviceDetailSections,
  serviceRelatedServices,
  services,
} from '../db/schema';
import type { DatabaseClient } from '../db/client';
import { atomicBatch, type AtomicBatchStatement } from '../db/transaction';
import { upsertStatement } from './image-presentation.repository';
export async function findServiceById(db: DatabaseClient, id: string) {
  const [x] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return x;
}
export async function findServiceBySlug(db: DatabaseClient, slug: string) {
  const [x] = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return x;
}
export async function findPublicServiceBySlug(db: DatabaseClient, slug: string) {
  const [x] = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, slug), eq(services.status, 'PUBLISHED')))
    .limit(1);
  if (x) return x;
  const published = await listPublicServices(db);
  return published.find(
    (item) =>
      item.id === slug ||
      (item.slug === item.id &&
        item.nameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') === slug),
  );
}
export async function createService(db: DatabaseClient, input: CreateServiceInput) {
  const id = crypto.randomUUID(),
    now = new Date().toISOString();
  const {
    benefits,
    detailSections,
    relatedServiceIds,
    imagePresentation,
    heroImagePresentation,
    aboutImagePresentation,
    ...row
  } = input;
  const statements: [AtomicBatchStatement, ...AtomicBatchStatement[]] = [
    db.insert(services).values({ id, ...row, createdAt: now, updatedAt: now }),
  ];
  statements.push(
    ...replaceBenefitsStatements(db, id, benefits),
    ...replaceDetailSectionStatements(db, id, detailSections, []),
    ...replaceRelatedStatements(db, id, relatedServiceIds),
  );
  if (imagePresentation)
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'SERVICE', ownerId: id, slot: 'PRIMARY' },
        imagePresentation,
      ),
    );
  if (heroImagePresentation)
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'SERVICE', ownerId: id, slot: 'HERO' },
        heroImagePresentation,
      ),
    );
  if (aboutImagePresentation)
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'SERVICE', ownerId: id, slot: 'ABOUT' },
        aboutImagePresentation,
      ),
    );
  await atomicBatch(db, statements);
  return findServiceById(db, id);
}
export async function updateService(db: DatabaseClient, id: string, input: UpdateServiceInput) {
  const presentationInput = input as UpdateServiceInput & {
    imagePresentation?: ImagePresentation;
    heroImagePresentation?: ImagePresentation;
    aboutImagePresentation?: ImagePresentation;
  };
  const {
    benefits,
    detailSections,
    relatedServiceIds,
    imagePresentation,
    heroImagePresentation,
    aboutImagePresentation,
    ...row
  } = presentationInput;
  const previousSections =
    detailSections === undefined
      ? []
      : await db
          .select({ id: serviceDetailSections.id })
          .from(serviceDetailSections)
          .where(eq(serviceDetailSections.serviceId, id));
  const statements: AtomicBatchStatement[] = [];
  if (Object.keys(row).length)
    statements.push(
      db
        .update(services)
        .set({ ...row, updatedAt: new Date().toISOString() })
        .where(eq(services.id, id)),
    );
  if (benefits !== undefined) statements.push(...replaceBenefitsStatements(db, id, benefits));
  if (detailSections !== undefined)
    statements.push(
      ...replaceDetailSectionStatements(
        db,
        id,
        detailSections,
        previousSections.map(({ id: ownerId }) => ownerId),
      ),
    );
  if (relatedServiceIds !== undefined)
    statements.push(...replaceRelatedStatements(db, id, relatedServiceIds));
  if (imagePresentation)
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'SERVICE', ownerId: id, slot: 'PRIMARY' },
        imagePresentation,
      ),
    );
  if (heroImagePresentation)
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'SERVICE', ownerId: id, slot: 'HERO' },
        heroImagePresentation,
      ),
    );
  if (aboutImagePresentation)
    statements.push(
      upsertStatement(
        db,
        { ownerType: 'SERVICE', ownerId: id, slot: 'ABOUT' },
        aboutImagePresentation,
      ),
    );
  if (statements.length)
    await atomicBatch(db, statements as [AtomicBatchStatement, ...AtomicBatchStatement[]]);
  return findServiceById(db, id);
}
function replaceBenefitsStatements(
  db: DatabaseClient,
  id: string,
  items: CreateServiceInput['benefits'],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    db.delete(serviceBenefits).where(eq(serviceBenefits.serviceId, id)),
  ];
  for (const item of items)
    statements.push(
      db.insert(serviceBenefits).values({
        id: crypto.randomUUID(),
        serviceId: id,
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
  return statements;
}
function replaceDetailSectionStatements(
  db: DatabaseClient,
  id: string,
  items: CreateServiceInput['detailSections'],
  previousOwnerIds: string[],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [];
  if (previousOwnerIds.length) {
    statements.push(
      db
        .delete(imagePresentations)
        .where(
          and(
            eq(imagePresentations.ownerType, 'SERVICE_DETAIL_SECTION'),
            inArray(imagePresentations.ownerId, previousOwnerIds),
          ),
        ),
    );
  }
  statements.push(db.delete(serviceDetailSections).where(eq(serviceDetailSections.serviceId, id)));
  if (items.length > 0) {
    const now = new Date().toISOString();
    const rows = items.map(({ imagePresentation, ...item }) => ({
      imagePresentation,
      row: { id: crypto.randomUUID(), serviceId: id, ...item, createdAt: now, updatedAt: now },
    }));
    statements.push(db.insert(serviceDetailSections).values(rows.map(({ row }) => row)));
    for (const { imagePresentation, row } of rows) {
      if (imagePresentation && row.imageKey)
        statements.push(
          upsertStatement(
            db,
            { ownerType: 'SERVICE_DETAIL_SECTION', ownerId: row.id, slot: 'PRIMARY' },
            imagePresentation,
          ),
        );
    }
  }
  return statements;
}
function replaceRelatedStatements(
  db: DatabaseClient,
  id: string,
  ids: string[],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    db.delete(serviceRelatedServices).where(eq(serviceRelatedServices.serviceId, id)),
  ];
  for (const [i, relatedServiceId] of ids.entries())
    statements.push(
      db.insert(serviceRelatedServices).values({
        id: crypto.randomUUID(),
        serviceId: id,
        relatedServiceId,
        displayOrder: i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
  return statements;
}
export async function getBenefits(db: DatabaseClient, id: string) {
  return db
    .select()
    .from(serviceBenefits)
    .where(eq(serviceBenefits.serviceId, id))
    .orderBy(asc(serviceBenefits.displayOrder));
}
export async function getDetailSections(db: DatabaseClient, id: string) {
  return db
    .select()
    .from(serviceDetailSections)
    .where(eq(serviceDetailSections.serviceId, id))
    .orderBy(asc(serviceDetailSections.displayOrder));
}
export async function getRelated(db: DatabaseClient, id: string) {
  return db
    .select({ relation: serviceRelatedServices, service: services })
    .from(serviceRelatedServices)
    .innerJoin(services, eq(serviceRelatedServices.relatedServiceId, services.id))
    .where(eq(serviceRelatedServices.serviceId, id))
    .orderBy(asc(serviceRelatedServices.displayOrder));
}
export async function countAppointmentsForService(db: DatabaseClient, id: string) {
  const [x] = await db
    .select({ value: count() })
    .from(appointments)
    .where(eq(appointments.serviceId, id));
  return x?.value ?? 0;
}
export async function deleteService(db: DatabaseClient, id: string) {
  const sectionIds = await db
    .select({ id: serviceDetailSections.id })
    .from(serviceDetailSections)
    .where(eq(serviceDetailSections.serviceId, id));
  await atomicBatch(db, [
    db.delete(imagePresentations).where(
      or(
        and(eq(imagePresentations.ownerType, 'SERVICE'), eq(imagePresentations.ownerId, id)),
        sectionIds.length
          ? and(
              eq(imagePresentations.ownerType, 'SERVICE_DETAIL_SECTION'),
              inArray(
                imagePresentations.ownerId,
                sectionIds.map((item) => item.id),
              ),
            )
          : undefined,
      ),
    ),
    db
      .delete(serviceRelatedServices)
      .where(
        or(
          eq(serviceRelatedServices.serviceId, id),
          eq(serviceRelatedServices.relatedServiceId, id),
        ),
      ),
    db.delete(serviceBenefits).where(eq(serviceBenefits.serviceId, id)),
    db.delete(serviceDetailSections).where(eq(serviceDetailSections.serviceId, id)),
    db.delete(services).where(eq(services.id, id)),
  ]);
}
export async function listPublicServices(db: DatabaseClient) {
  return db
    .select()
    .from(services)
    .where(eq(services.status, 'PUBLISHED'))
    .orderBy(asc(services.displayOrder), asc(services.id));
}
export async function listAdminServices(db: DatabaseClient, q: ServiceListQuery) {
  const c = [] as ReturnType<typeof eq>[];
  if (q.status) c.push(eq(services.status, q.status));
  if (q.featured !== undefined) c.push(eq(services.featured, q.featured));
  if (q.category) c.push(eq(services.category, q.category));
  const where = and(
    ...c,
    q.search
      ? or(
          like(services.nameEn, `%${q.search}%`),
          like(services.nameKm, `%${q.search}%`),
          like(services.slug, `%${q.search}%`),
        )
      : undefined,
  );
  const cols = {
    name: services.nameEn,
    displayOrder: services.displayOrder,
    createdAt: services.createdAt,
    updatedAt: services.updatedAt,
  } as const;
  const order = q.order === 'desc' ? desc : asc;
  const [items, total] = await Promise.all([
    db
      .select()
      .from(services)
      .where(where)
      .orderBy(order(cols[q.sort]))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),
    db.select({ value: count() }).from(services).where(where),
  ]);
  return { items, total: total[0]?.value ?? 0 };
}
export async function servicesExist(db: DatabaseClient, ids: string[]) {
  if (!ids.length) return [];
  return db.select({ id: services.id }).from(services).where(inArray(services.id, ids));
}
