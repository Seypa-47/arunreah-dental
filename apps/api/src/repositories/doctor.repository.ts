import { and, asc, count, desc, eq, inArray, like, or, type SQL } from 'drizzle-orm';
import type {
  AdminDoctorListQuery,
  CreateDoctorInput,
  ReorderDoctorsInput,
  TeamCategory,
  UpdateDoctorInput,
} from '@arunreah/shared';
import {
  appointments,
  doctorBranches,
  doctorEducation,
  doctorExpertise,
  doctorProfileItems,
  doctorRelatedDoctors,
  doctors,
  imagePresentations,
} from '../db/schema';
import type { DatabaseClient } from '../db/client';
import { atomicBatch, type AtomicBatchStatement } from '../db/transaction';
import { upsertStatement } from './image-presentation.repository';

export type AdminDoctorRepositoryQuery = AdminDoctorListQuery & { bookable?: boolean };
export type PublicDoctorListFilters = { category?: TeamCategory; bookable?: boolean };
type DoctorProfileItem = typeof doctorProfileItems.$inferSelect;

function toDoctorRow(input: UpdateDoctorInput) {
  const {
    expertise: _expertise,
    education: _education,
    profileItems: _profileItems,
    relatedDoctorIds: _relatedDoctorIds,
    branchIds: _branchIds,
    titleEn,
    titleKm,
    aboutEn,
    aboutKm,
    photoImagePresentation: _photoImagePresentation,
    ...row
  } = input;
  void _expertise;
  void _education;
  void _profileItems;
  void _relatedDoctorIds;
  void _branchIds;
  void _photoImagePresentation;
  return {
    ...row,
    ...(titleEn !== undefined ? { roleEn: titleEn } : {}),
    ...(titleKm !== undefined ? { roleKm: titleKm } : {}),
    ...(aboutEn !== undefined ? { biographyEn: aboutEn } : {}),
    ...(aboutKm !== undefined ? { biographyKm: aboutKm } : {}),
  };
}

function toCreatedDoctorRow(input: CreateDoctorInput) {
  const {
    expertise: _expertise,
    education: _education,
    profileItems: _profileItems,
    relatedDoctorIds: _relatedDoctorIds,
    branchIds: _branchIds,
    titleEn,
    titleKm,
    aboutEn,
    aboutKm,
    photoImagePresentation: _photoImagePresentation,
    ...row
  } = input;
  void _expertise;
  void _education;
  void _profileItems;
  void _relatedDoctorIds;
  void _branchIds;
  void _photoImagePresentation;
  return {
    ...row,
    roleEn: titleEn,
    roleKm: titleKm,
    biographyEn: aboutEn,
    biographyKm: aboutKm,
  };
}

export async function findDoctorById(database: DatabaseClient, id: string) {
  const [doctor] = await database.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return doctor;
}

export async function findDoctorBySlug(database: DatabaseClient, slug: string) {
  const [doctor] = await database.select().from(doctors).where(eq(doctors.slug, slug)).limit(1);
  return doctor;
}

export async function findPublicDoctorBySlug(database: DatabaseClient, slug: string) {
  const [doctor] = await database
    .select()
    .from(doctors)
    .where(and(eq(doctors.slug, slug), eq(doctors.status, 'PUBLISHED')))
    .limit(1);
  return doctor;
}

export async function createDoctor(database: DatabaseClient, input: CreateDoctorInput) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const statements: [AtomicBatchStatement, ...AtomicBatchStatement[]] = [
    database
      .insert(doctors)
      .values({ id, ...toCreatedDoctorRow(input), createdAt: now, updatedAt: now }),
  ];
  statements.push(
    ...replaceExpertiseStatements(database, id, input.expertise),
    ...replaceEducationStatements(database, id, input.education),
    ...replaceProfileItemStatements(database, id, input.profileItems),
    ...replaceRelatedDoctorStatements(database, id, input.relatedDoctorIds),
    ...replaceDoctorBranchStatements(database, id, input.branchIds),
  );
  if (input.photoImagePresentation)
    statements.push(
      upsertStatement(
        database,
        { ownerType: 'DOCTOR', ownerId: id, slot: 'PRIMARY' },
        input.photoImagePresentation,
      ),
    );
  await atomicBatch(database, statements);
  return findDoctorById(database, id);
}

export async function updateDoctor(database: DatabaseClient, id: string, input: UpdateDoctorInput) {
  const row = toDoctorRow(input);
  const statements: AtomicBatchStatement[] = [];
  if (Object.keys(row).length > 0)
    statements.push(
      database
        .update(doctors)
        .set({ ...row, updatedAt: new Date().toISOString() })
        .where(eq(doctors.id, id)),
    );
  if (input.expertise !== undefined)
    statements.push(...replaceExpertiseStatements(database, id, input.expertise));
  if (input.education !== undefined)
    statements.push(...replaceEducationStatements(database, id, input.education));
  if (input.profileItems !== undefined)
    statements.push(...replaceProfileItemStatements(database, id, input.profileItems));
  if (input.relatedDoctorIds !== undefined)
    statements.push(...replaceRelatedDoctorStatements(database, id, input.relatedDoctorIds));
  if (input.branchIds !== undefined)
    statements.push(...replaceDoctorBranchStatements(database, id, input.branchIds));
  if (input.photoImagePresentation)
    statements.push(
      upsertStatement(
        database,
        { ownerType: 'DOCTOR', ownerId: id, slot: 'PRIMARY' },
        input.photoImagePresentation,
      ),
    );
  if (statements.length)
    await atomicBatch(database, statements as [AtomicBatchStatement, ...AtomicBatchStatement[]]);
  return findDoctorById(database, id);
}

function replaceExpertiseStatements(
  database: DatabaseClient,
  doctorId: string,
  items: CreateDoctorInput['expertise'],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    database.delete(doctorExpertise).where(eq(doctorExpertise.doctorId, doctorId)),
  ];
  if (items.length > 0) {
    const now = new Date().toISOString();
    statements.push(
      database.insert(doctorExpertise).values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          doctorId,
          nameEn: item.titleEn,
          nameKm: item.titleKm,
          displayOrder: item.displayOrder,
          createdAt: now,
          updatedAt: now,
        })),
      ),
    );
  }
  return statements;
}

function replaceEducationStatements(
  database: DatabaseClient,
  doctorId: string,
  items: CreateDoctorInput['education'],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    database.delete(doctorEducation).where(eq(doctorEducation.doctorId, doctorId)),
  ];
  if (items.length > 0) {
    const now = new Date().toISOString();
    statements.push(
      database.insert(doctorEducation).values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          doctorId,
          degreeEn: item.qualificationEn,
          degreeKm: item.qualificationKm,
          institutionEn: item.institutionEn,
          institutionKm: item.institutionKm,
          yearLabel: item.yearLabel,
          displayOrder: item.displayOrder,
          createdAt: now,
          updatedAt: now,
        })),
      ),
    );
  }
  return statements;
}

function replaceProfileItemStatements(
  database: DatabaseClient,
  doctorId: string,
  items: CreateDoctorInput['profileItems'],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    database.delete(doctorProfileItems).where(eq(doctorProfileItems.doctorId, doctorId)),
  ];
  if (items.length > 0) {
    const now = new Date().toISOString();
    statements.push(
      database.insert(doctorProfileItems).values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          doctorId,
          kind: item.kind,
          icon: item.icon ?? null,
          titleEn: item.titleEn,
          titleKm: item.titleKm,
          subtitleEn: item.subtitleEn ?? null,
          subtitleKm: item.subtitleKm ?? null,
          meta: item.meta ?? null,
          displayOrder: item.displayOrder,
          createdAt: now,
          updatedAt: now,
        })),
      ),
    );
  }
  return statements;
}

export async function replaceProfileItems(
  database: DatabaseClient,
  doctorId: string,
  items: CreateDoctorInput['profileItems'],
) {
  const statements = replaceProfileItemStatements(database, doctorId, items);
  await atomicBatch(database, statements as [AtomicBatchStatement, ...AtomicBatchStatement[]]);
}

function replaceRelatedDoctorStatements(
  database: DatabaseClient,
  doctorId: string,
  relatedDoctorIds: string[],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    database.delete(doctorRelatedDoctors).where(eq(doctorRelatedDoctors.doctorId, doctorId)),
  ];
  if (relatedDoctorIds.length > 0) {
    const now = new Date().toISOString();
    statements.push(
      database.insert(doctorRelatedDoctors).values(
        relatedDoctorIds.map((relatedDoctorId, displayOrder) => ({
          id: crypto.randomUUID(),
          doctorId,
          relatedDoctorId,
          displayOrder,
          createdAt: now,
          updatedAt: now,
        })),
      ),
    );
  }
  return statements;
}

function replaceDoctorBranchStatements(
  database: DatabaseClient,
  doctorId: string,
  branchIds: string[],
): AtomicBatchStatement[] {
  const statements: AtomicBatchStatement[] = [
    database.delete(doctorBranches).where(eq(doctorBranches.doctorId, doctorId)),
  ];
  if (branchIds.length > 0) {
    const now = new Date().toISOString();
    statements.push(
      database.insert(doctorBranches).values(
        branchIds.map((branchId, displayOrder) => ({
          id: crypto.randomUUID(),
          doctorId,
          branchId,
          displayOrder,
          createdAt: now,
          updatedAt: now,
        })),
      ),
    );
  }
  return statements;
}

export async function getDoctorBranchIds(
  database: DatabaseClient,
  doctorId: string,
): Promise<string[]> {
  const rows = await database
    .select({ branchId: doctorBranches.branchId })
    .from(doctorBranches)
    .where(eq(doctorBranches.doctorId, doctorId))
    .orderBy(asc(doctorBranches.displayOrder));
  return rows.map((r) => r.branchId);
}

export async function getDoctorBranchIdsForDoctors(
  database: DatabaseClient,
  doctorIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (doctorIds.length === 0) return map;
  const rows = await database
    .select({
      doctorId: doctorBranches.doctorId,
      branchId: doctorBranches.branchId,
    })
    .from(doctorBranches)
    .where(inArray(doctorBranches.doctorId, doctorIds))
    .orderBy(asc(doctorBranches.displayOrder));
  for (const row of rows) {
    const current = map.get(row.doctorId) ?? [];
    current.push(row.branchId);
    map.set(row.doctorId, current);
  }
  return map;
}

export async function getExpertise(database: DatabaseClient, doctorId: string) {
  return database
    .select()
    .from(doctorExpertise)
    .where(eq(doctorExpertise.doctorId, doctorId))
    .orderBy(asc(doctorExpertise.displayOrder));
}

export async function getEducation(database: DatabaseClient, doctorId: string) {
  return database
    .select()
    .from(doctorEducation)
    .where(eq(doctorEducation.doctorId, doctorId))
    .orderBy(asc(doctorEducation.displayOrder));
}

export async function getProfileItems(database: DatabaseClient, doctorId: string) {
  return database
    .select()
    .from(doctorProfileItems)
    .where(eq(doctorProfileItems.doctorId, doctorId))
    .orderBy(asc(doctorProfileItems.kind), asc(doctorProfileItems.displayOrder));
}

export async function getProfileItemsForDoctors(
  database: DatabaseClient,
  doctorIds: string[],
): Promise<Map<string, DoctorProfileItem[]>> {
  const map = new Map<string, DoctorProfileItem[]>();
  if (doctorIds.length === 0) return map;
  const rows = await database
    .select()
    .from(doctorProfileItems)
    .where(inArray(doctorProfileItems.doctorId, doctorIds))
    .orderBy(
      asc(doctorProfileItems.doctorId),
      asc(doctorProfileItems.kind),
      asc(doctorProfileItems.displayOrder),
    );
  for (const row of rows) {
    const current = map.get(row.doctorId) ?? [];
    current.push(row);
    map.set(row.doctorId, current);
  }
  return map;
}

export async function listDoctorIdsByCategory(database: DatabaseClient, category: TeamCategory) {
  return database
    .select({ id: doctors.id })
    .from(doctors)
    .where(eq(doctors.category, category))
    .orderBy(asc(doctors.displayOrder), asc(doctors.id));
}

export async function reorderDoctorsWithinCategory(
  database: DatabaseClient,
  input: ReorderDoctorsInput,
) {
  const updatedAt = new Date().toISOString();
  const statements: AtomicBatchStatement[] = input.ids.map((id, displayOrder) =>
    database
      .update(doctors)
      .set({ displayOrder, updatedAt })
      .where(and(eq(doctors.id, id), eq(doctors.category, input.category))),
  );
  if (statements.length)
    await atomicBatch(database, statements as [AtomicBatchStatement, ...AtomicBatchStatement[]]);
}

export async function getRelatedDoctors(database: DatabaseClient, doctorId: string) {
  return database
    .select({ relation: doctorRelatedDoctors, doctor: doctors })
    .from(doctorRelatedDoctors)
    .innerJoin(doctors, eq(doctorRelatedDoctors.relatedDoctorId, doctors.id))
    .where(eq(doctorRelatedDoctors.doctorId, doctorId))
    .orderBy(asc(doctorRelatedDoctors.displayOrder));
}

export async function doctorsExist(database: DatabaseClient, ids: string[]) {
  if (ids.length === 0) return [];
  return database.select({ id: doctors.id }).from(doctors).where(inArray(doctors.id, ids));
}

export async function countAppointmentsForDoctor(database: DatabaseClient, doctorId: string) {
  const [result] = await database
    .select({ value: count() })
    .from(appointments)
    .where(eq(appointments.doctorId, doctorId));
  return result?.value ?? 0;
}

export async function deleteDoctor(database: DatabaseClient, id: string) {
  await atomicBatch(database, [
    database
      .delete(imagePresentations)
      .where(and(eq(imagePresentations.ownerType, 'DOCTOR'), eq(imagePresentations.ownerId, id))),
    database
      .delete(doctorRelatedDoctors)
      .where(
        or(eq(doctorRelatedDoctors.doctorId, id), eq(doctorRelatedDoctors.relatedDoctorId, id)),
      ),
    database.delete(doctorExpertise).where(eq(doctorExpertise.doctorId, id)),
    database.delete(doctorEducation).where(eq(doctorEducation.doctorId, id)),
    database.delete(doctorBranches).where(eq(doctorBranches.doctorId, id)),
    database.delete(doctors).where(eq(doctors.id, id)),
  ]);
}

function buildFilters(query: AdminDoctorRepositoryQuery): SQL | undefined {
  const conditions: SQL[] = [];
  if (query.status) conditions.push(eq(doctors.status, query.status));
  if (query.featured !== undefined) conditions.push(eq(doctors.featured, query.featured));
  if (query.specialty) conditions.push(eq(doctors.specialtyEn, query.specialty));
  if (query.category) conditions.push(eq(doctors.category, query.category));
  if (query.bookable !== undefined) conditions.push(eq(doctors.bookable, query.bookable));
  if (query.search) {
    const search = `%${query.search}%`;
    conditions.push(
      or(
        like(doctors.nameEn, search),
        like(doctors.nameKm, search),
        like(doctors.roleEn, search),
        like(doctors.roleKm, search),
        like(doctors.specialtyEn, search),
        like(doctors.specialtyKm, search),
        like(doctors.slug, search),
      )!,
    );
  }
  return conditions.length === 0 ? undefined : and(...conditions);
}

export async function listAdminDoctors(
  database: DatabaseClient,
  query: AdminDoctorRepositoryQuery,
) {
  const where = buildFilters(query);
  const columns = {
    name: doctors.nameEn,
    displayOrder: doctors.displayOrder,
    createdAt: doctors.createdAt,
    updatedAt: doctors.updatedAt,
  } as const;
  const order = query.order === 'desc' ? desc : asc;
  const [items, total] = await Promise.all([
    database
      .select()
      .from(doctors)
      .where(where)
      .orderBy(order(columns[query.sort]), asc(doctors.id))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
    database.select({ value: count() }).from(doctors).where(where),
  ]);
  return { items, total: total[0]?.value ?? 0 };
}

export async function listPublicDoctors(
  database: DatabaseClient,
  filters: PublicDoctorListFilters = {},
) {
  const conditions: SQL[] = [eq(doctors.status, 'PUBLISHED')];
  if (filters.category) conditions.push(eq(doctors.category, filters.category));
  if (filters.bookable !== undefined) conditions.push(eq(doctors.bookable, filters.bookable));
  return database
    .select()
    .from(doctors)
    .where(and(...conditions))
    .orderBy(asc(doctors.category), asc(doctors.displayOrder), asc(doctors.id));
}
