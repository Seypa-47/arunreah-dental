import { and, asc, count, desc, eq, inArray, like, or } from 'drizzle-orm';
import type { CreateServiceInput, ServiceListQuery, UpdateServiceInput } from '@arunreah/shared';
import { appointments, serviceBenefits, serviceRelatedServices, services } from '../db/schema';
import type { DatabaseClient } from '../db/client';
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
  const { benefits, relatedServiceIds, ...row } = input;
  await db.insert(services).values({ id, ...row, createdAt: now, updatedAt: now });
  await replaceBenefits(db, id, benefits);
  await replaceRelated(db, id, relatedServiceIds);
  return findServiceById(db, id);
}
export async function updateService(db: DatabaseClient, id: string, input: UpdateServiceInput) {
  const { benefits, relatedServiceIds, ...row } = input;
  if (Object.keys(row).length)
    await db
      .update(services)
      .set({ ...row, updatedAt: new Date().toISOString() })
      .where(eq(services.id, id));
  if (benefits !== undefined) await replaceBenefits(db, id, benefits);
  if (relatedServiceIds !== undefined) await replaceRelated(db, id, relatedServiceIds);
  return findServiceById(db, id);
}
async function replaceBenefits(
  db: DatabaseClient,
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
async function replaceRelated(db: DatabaseClient, id: string, ids: string[]) {
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
  await db.delete(services).where(eq(services.id, id));
}
export async function listPublicServices(db: DatabaseClient) {
  return db
    .select()
    .from(services)
    .where(eq(services.status, 'PUBLISHED'))
    .orderBy(asc(services.displayOrder));
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
