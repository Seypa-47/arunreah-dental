import { describe, expect, it, vi } from 'vitest';
import { createDoctorSchema, updateDoctorSchema } from '@arunreah/shared';
import type { SQL } from 'drizzle-orm';
import { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';
import type { DatabaseClient } from '../src/db/client';
import { doctorProfileItems, doctors } from '../src/db/schema';
import {
  createDoctor,
  getProfileItems,
  listAdminDoctors,
  listPublicDoctors,
  replaceProfileItems,
  updateDoctor,
} from '../src/repositories/doctor.repository';

const storedDoctor = {
  id: 'doctor-1',
  slug: 'sok-dara',
  status: 'PUBLISHED' as const,
  featured: false,
  displayOrder: 0,
  nameEn: 'Dr. Sok Dara',
  nameKm: 'វេជ្ជបណ្ឌិត សុខ ដារ៉ា',
  roleEn: null,
  roleKm: null,
  specialtyEn: null,
  specialtyKm: null,
  shortBioEn: null,
  shortBioKm: null,
  biographyEn: null,
  biographyKm: null,
  photoKey: null,
  yearsExperience: null,
  successfulProcedures: null,
  patientSatisfaction: null,
  phone: null,
  category: 'DENTIST' as const,
  bookable: true,
  departmentEn: null,
  departmentKm: null,
  teamNoteEn: null,
  teamNoteKm: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function readDatabase(row = storedDoctor): DatabaseClient {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [row],
        }),
      }),
    }),
  } as unknown as DatabaseClient;
}

describe('doctor repository Our Team persistence', () => {
  it('persists the new parent fields and profile items on create', async () => {
    const inserted = new Map<unknown, unknown>();
    const deleted: unknown[] = [];
    const database = {
      ...readDatabase(),
      batch: async (statements: Promise<unknown>[]) => Promise.all(statements),
      insert: (table: unknown) => ({
        values: async (values: unknown) => {
          inserted.set(table, values);
        },
      }),
      delete: (table: unknown) => ({
        where: async () => {
          deleted.push(table);
        },
      }),
    } as unknown as DatabaseClient;
    const input = createDoctorSchema.parse({
      slug: 'sok-dara',
      nameEn: 'Dr. Sok Dara',
      nameKm: 'វេជ្ជបណ្ឌិត សុខ ដារ៉ា',
      category: 'GENERAL_PRACTITIONER',
      bookable: true,
      departmentEn: 'General Medicine',
      departmentKm: 'វេជ្ជសាស្ត្រទូទៅ',
      teamNoteEn: 'Weekdays',
      teamNoteKm: 'ថ្ងៃធ្វើការ',
      profileItems: [
        {
          kind: 'EXPERIENCE',
          titleEn: 'Community care',
          titleKm: 'ការថែទាំសហគមន៍',
        },
      ],
    });

    await createDoctor(database, input);

    expect(inserted.get(doctors)).toEqual(
      expect.objectContaining({
        category: 'GENERAL_PRACTITIONER',
        bookable: true,
        departmentEn: 'General Medicine',
        departmentKm: 'វេជ្ជសាស្ត្រទូទៅ',
        teamNoteEn: 'Weekdays',
        teamNoteKm: 'ថ្ងៃធ្វើការ',
      }),
    );
    expect(deleted).toContain(doctorProfileItems);
    expect(inserted.get(doctorProfileItems)).toEqual([
      expect.objectContaining({
        kind: 'EXPERIENCE',
        icon: null,
        titleEn: 'Community care',
        titleKm: 'ការថែទាំសហគមន៍',
        displayOrder: 0,
      }),
    ]);
  });

  it('persists partial updates without treating profile items as doctor columns', async () => {
    const set = vi.fn((value: unknown) => {
      void value;
      return { where: async () => undefined };
    });
    const database = {
      ...readDatabase(),
      batch: async (statements: Promise<unknown>[]) => Promise.all(statements),
      update: (table: unknown) => {
        expect(table).toBe(doctors);
        return { set };
      },
    } as unknown as DatabaseClient;
    const input = updateDoctorSchema.parse({
      category: 'ASSISTANT',
      bookable: false,
      departmentEn: 'Clinical Support',
      teamNoteKm: 'ក្រុមជំនួយ',
    });

    await updateDoctor(database, storedDoctor.id, input);

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'ASSISTANT',
        bookable: false,
        departmentEn: 'Clinical Support',
        teamNoteKm: 'ក្រុមជំនួយ',
        updatedAt: expect.any(String),
      }),
    );
    expect(set.mock.calls[0]?.[0]).not.toHaveProperty('profileItems');
  });

  it('replaces profile items by deleting first and inserting normalized nullable fields', async () => {
    const calls: string[] = [];
    const values = vi.fn(async (value: unknown) => {
      void value;
      calls.push('insert');
    });
    const database = {
      batch: async (statements: Promise<unknown>[]) => Promise.all(statements),
      delete: (table: unknown) => {
        expect(table).toBe(doctorProfileItems);
        return {
          where: async () => {
            calls.push('delete');
          },
        };
      },
      insert: (table: unknown) => {
        expect(table).toBe(doctorProfileItems);
        return { values };
      },
    } as unknown as DatabaseClient;

    await replaceProfileItems(database, storedDoctor.id, [
      {
        kind: 'RESPONSIBILITY',
        icon: 'appointments',
        titleEn: 'Manage appointments',
        titleKm: 'គ្រប់គ្រងការណាត់ជួប',
        displayOrder: 2,
      },
    ]);

    expect(calls).toEqual(['delete', 'insert']);
    expect(values).toHaveBeenCalledWith([
      expect.objectContaining({
        doctorId: storedDoctor.id,
        icon: 'appointments',
        subtitleEn: null,
        subtitleKm: null,
        meta: null,
        displayOrder: 2,
      }),
    ]);
  });

  it('reads profile items in kind and display order', async () => {
    const rows = [{ id: 'profile-1' }];
    const orderBy = vi.fn(async () => rows);
    const database = {
      select: () => ({
        from: (table: unknown) => {
          expect(table).toBe(doctorProfileItems);
          return { where: () => ({ orderBy }) };
        },
      }),
    } as unknown as DatabaseClient;

    await expect(getProfileItems(database, storedDoctor.id)).resolves.toEqual(rows);
    expect(orderBy).toHaveBeenCalledTimes(1);
    expect(orderBy.mock.calls[0]).toHaveLength(2);
  });
});

describe('doctor repository Our Team filters', () => {
  const dialect = new SQLiteSyncDialect();

  it('defaults the public list to all published categories in category and display order', async () => {
    let whereClause: SQL | undefined;
    const orderBy = vi.fn(async () => [storedDoctor]);
    const database = {
      select: () => ({
        from: () => ({
          where: (where: SQL | undefined) => {
            whereClause = where;
            return { orderBy };
          },
        }),
      }),
    } as unknown as DatabaseClient;

    await listPublicDoctors(database);

    expect(dialect.sqlToQuery(whereClause!).params).toEqual(['PUBLISHED']);
    expect(orderBy.mock.calls[0]).toHaveLength(3);
  });

  it('filters the public list by publication, category, and bookable state', async () => {
    let whereClause: SQL | undefined;
    const database = {
      select: () => ({
        from: () => ({
          where: (where: SQL | undefined) => {
            whereClause = where;
            return { orderBy: async () => [storedDoctor] };
          },
        }),
      }),
    } as unknown as DatabaseClient;

    await listPublicDoctors(database, { category: 'ASSISTANT', bookable: false });

    expect(whereClause).toBeDefined();
    expect(dialect.sqlToQuery(whereClause!).params).toEqual(['PUBLISHED', 'ASSISTANT', 0]);
  });

  it('adds category and bookable filters to the admin list query', async () => {
    const whereClauses: Array<SQL | undefined> = [];
    const database = {
      select: (selection?: unknown) => ({
        from: () => ({
          where: (where: SQL | undefined) => {
            whereClauses.push(where);
            if (selection !== undefined) return Promise.resolve([{ value: 1 }]);
            return {
              orderBy: () => ({
                limit: () => ({ offset: async () => [storedDoctor] }),
              }),
            };
          },
        }),
      }),
    } as unknown as DatabaseClient;

    await listAdminDoctors(database, {
      page: 1,
      limit: 20,
      category: 'RECEPTIONIST',
      bookable: false,
      sort: 'displayOrder',
      order: 'asc',
    });

    expect(whereClauses).toHaveLength(2);
    expect(dialect.sqlToQuery(whereClauses[0]!).params).toEqual(['RECEPTIONIST', 0]);
  });
});
