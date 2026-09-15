import { and, asc, count, desc, eq, inArray, like, or } from 'drizzle-orm';
import type { CreateServiceInput, ImagePresentation, ServiceListQuery, UpdateServiceInput } from '@arunreah/shared';
import { appointments, serviceBenefits, serviceDetailSections, serviceRelatedServices, services } from '../db/schema';
import type { DatabaseClient } from '../db/client';
import { inTransaction } from '../db/transaction';
import { upsert } from './image-presentation.repository';
type WriteDatabase = DatabaseClient | Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];
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
  return x;
}
export async function createService(db: DatabaseClient, input: CreateServiceInput) {
  const id = crypto.randomUUID(),
    now = new Date().toISOString();
  const { benefits, detailSections, relatedServiceIds, imagePresentation, heroImagePresentation, aboutImagePresentation, ...row } = input;
  await inTransaction(db, async (transaction) => {
    await transaction.insert(services).values({ id, ...row, createdAt: now, updatedAt: now });
    await replaceBenefits(transaction, id, benefits);
    await replaceDetailSections(transaction, id, detailSections);
    await replaceRelated(transaction, id, relatedServiceIds);
    if (imagePresentation) await upsert(transaction, { ownerType: 'SERVICE', ownerId: id, slot: 'PRIMARY' }, imagePresentation);
    if (heroImagePresentation) await upsert(transaction, { ownerType: 'SERVICE', ownerId: id, slot: 'HERO' }, heroImagePresentation);
    if (aboutImagePresentation) await upsert(transaction, { ownerType: 'SERVICE', ownerId: id, slot: 'ABOUT' }, aboutImagePresentation);
  });
  return findServiceById(db, id);
}
export async function updateService(db: DatabaseClient, id: string, input: UpdateServiceInput) {
  const presentationInput = input as UpdateServiceInput & {
    imagePresentation?: ImagePresentation;
    heroImagePresentation?: ImagePresentation;
    aboutImagePresentation?: ImagePresentation;
  };
  const { benefits, detailSections, relatedServiceIds, imagePresentation, heroImagePresentation, aboutImagePresentation, ...row } = presentationInput;
  await inTransaction(db, async (transaction) => {
    if (Object.keys(row).length)
      await transaction
        .update(services)
        .set({ ...row, updatedAt: new Date().toISOString() })
        .where(eq(services.id, id));
    if (benefits !== undefined) await replaceBenefits(transaction, id, benefits);
    if (detailSections !== undefined) await replaceDetailSections(transaction, id, detailSections);
    if (relatedServiceIds !== undefined) await replaceRelated(transaction, id, relatedServiceIds);
    if (imagePresentation) await upsert(transaction, { ownerType: 'SERVICE', ownerId: id, slot: 'PRIMARY' }, imagePresentation);
    if (heroImagePresentation) await upsert(transaction, { ownerType: 'SERVICE', ownerId: id, slot: 'HERO' }, heroImagePresentation);
    if (aboutImagePresentation) await upsert(transaction, { ownerType: 'SERVICE', ownerId: id, slot: 'ABOUT' }, aboutImagePresentation);
  });
  return findServiceById(db, id);
}
async function replaceBenefits(
  db: WriteDatabase,
  id: string,
  items: CreateServiceInput['benefits'],
) {
  await db.delete(serviceBenefits).where(eq(serviceBenefits.serviceId, id));
  for (const item of items)
    await db.insert(serviceBenefits).values({
      id: crypto.randomUUID(),
      serviceId: id,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
}
async function replaceDetailSections(
  db: WriteDatabase,
  id: string,
  items: CreateServiceInput['detailSections'],
) {
  await db.delete(serviceDetailSections).where(eq(serviceDetailSections.serviceId, id));
  if (items.length > 0) {
    const now = new Date().toISOString();
    await db.insert(serviceDetailSections).values(
      items.map((item) => ({ id: crypto.randomUUID(), serviceId: id, ...item, createdAt: now, updatedAt: now })),
    );
  }
}
async function replaceRelated(db: WriteDatabase, id: string, ids: string[]) {
  await db.delete(serviceRelatedServices).where(eq(serviceRelatedServices.serviceId, id));
  for (const [i, relatedServiceId] of ids.entries())
    await db.insert(serviceRelatedServices).values({
      id: crypto.randomUUID(),
      serviceId: id,
      relatedServiceId,
      displayOrder: i,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
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
  await inTransaction(db, async (transaction) => {
    await transaction.delete(serviceRelatedServices).where(
      or(eq(serviceRelatedServices.serviceId, id), eq(serviceRelatedServices.relatedServiceId, id)),
    );
    await transaction.delete(serviceBenefits).where(eq(serviceBenefits.serviceId, id));
    await transaction.delete(serviceDetailSections).where(eq(serviceDetailSections.serviceId, id));
    await transaction.delete(services).where(eq(services.id, id));
  });
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
