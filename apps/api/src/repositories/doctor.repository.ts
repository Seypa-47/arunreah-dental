import { and, asc, count, desc, eq, inArray, like, or, type SQL } from 'drizzle-orm';
import type { AdminDoctorListQuery, CreateDoctorInput, UpdateDoctorInput } from '@arunreah/shared';
import {
  appointments,
  doctorEducation,
  doctorExpertise,
  doctorRelatedDoctors,
  doctors,
} from '../db/schema';
import type { DatabaseClient } from '../db/client';

function toDoctorRow(input: UpdateDoctorInput) {
  const {
    expertise: _expertise,
    education: _education,
    relatedDoctorIds: _relatedDoctorIds,
    titleEn,
    titleKm,
    aboutEn,
    aboutKm,
    ...row
  } = input;
  void _expertise;
  void _education;
  void _relatedDoctorIds;
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
    relatedDoctorIds: _relatedDoctorIds,
    titleEn,
    titleKm,
    aboutEn,
    aboutKm,
    ...row
  } = input;
  void _expertise;
  void _education;
  void _relatedDoctorIds;
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
  await database
    .insert(doctors)
    .values({ id, ...toCreatedDoctorRow(input), createdAt: now, updatedAt: now });
  await replaceExpertise(database, id, input.expertise);
  await replaceEducation(database, id, input.education);
  await replaceRelatedDoctors(database, id, input.relatedDoctorIds);
  return findDoctorById(database, id);
}

export async function updateDoctor(database: DatabaseClient, id: string, input: UpdateDoctorInput) {
  const row = toDoctorRow(input);
  if (Object.keys(row).length > 0) {
    await database
      .update(doctors)
      .set({ ...row, updatedAt: new Date().toISOString() })
      .where(eq(doctors.id, id));
  }
  if (input.expertise !== undefined) await replaceExpertise(database, id, input.expertise);
  if (input.education !== undefined) await replaceEducation(database, id, input.education);
  if (input.relatedDoctorIds !== undefined) {
    await replaceRelatedDoctors(database, id, input.relatedDoctorIds);
  }
  return findDoctorById(database, id);
}

async function replaceExpertise(
  database: DatabaseClient,
  doctorId: string,
  items: CreateDoctorInput['expertise'],
) {
  await database.delete(doctorExpertise).where(eq(doctorExpertise.doctorId, doctorId));
  if (items.length > 0) {
    const now = new Date().toISOString();
    await database.insert(doctorExpertise).values(
      items.map((item) => ({
        id: crypto.randomUUID(),
        doctorId,
        nameEn: item.titleEn,
        nameKm: item.titleKm,
        displayOrder: item.displayOrder,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }
}

async function replaceEducation(
  database: DatabaseClient,
  doctorId: string,
  items: CreateDoctorInput['education'],
) {
  await database.delete(doctorEducation).where(eq(doctorEducation.doctorId, doctorId));
  if (items.length > 0) {
    const now = new Date().toISOString();
    await database.insert(doctorEducation).values(
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
    );
  }
}

async function replaceRelatedDoctors(
  database: DatabaseClient,
  doctorId: string,
  relatedDoctorIds: string[],
) {
  await database.delete(doctorRelatedDoctors).where(eq(doctorRelatedDoctors.doctorId, doctorId));
  if (relatedDoctorIds.length > 0) {
    const now = new Date().toISOString();
    await database.insert(doctorRelatedDoctors).values(
      relatedDoctorIds.map((relatedDoctorId, displayOrder) => ({
        id: crypto.randomUUID(),
        doctorId,
        relatedDoctorId,
        displayOrder,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }
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
  await database.delete(doctors).where(eq(doctors.id, id));
}

function buildFilters(query: AdminDoctorListQuery): SQL | undefined {
  const conditions: SQL[] = [];
  if (query.status) conditions.push(eq(doctors.status, query.status));
  if (query.featured !== undefined) conditions.push(eq(doctors.featured, query.featured));
  if (query.specialty) conditions.push(eq(doctors.specialtyEn, query.specialty));
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

export async function listAdminDoctors(database: DatabaseClient, query: AdminDoctorListQuery) {
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

export async function listPublicDoctors(database: DatabaseClient) {
  return database
    .select()
    .from(doctors)
    .where(eq(doctors.status, 'PUBLISHED'))
    .orderBy(asc(doctors.displayOrder), asc(doctors.id));
}
