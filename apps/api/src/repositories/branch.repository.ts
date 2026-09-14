import { and, asc, count, desc, eq, like, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { AdminBranchListQuery, CreateBranchInput, UpdateBranchInput } from '@arunreah/shared';
import { appointments, branches } from '../db/schema';
import type { DatabaseClient } from '../db/client';

export async function findBranchById(database: DatabaseClient, id: string) {
  const [branch] = await database.select().from(branches).where(eq(branches.id, id)).limit(1);
  return branch;
}

export async function findBranchBySlug(database: DatabaseClient, slug: string) {
  const [branch] = await database.select().from(branches).where(eq(branches.slug, slug)).limit(1);
  return branch;
}

export async function createBranch(database: DatabaseClient, input: CreateBranchInput) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await database.insert(branches).values({
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return findBranchById(database, id);
}

export async function updateBranch(database: DatabaseClient, id: string, input: UpdateBranchInput) {
  await database
    .update(branches)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(branches.id, id));

  return findBranchById(database, id);
}

export async function deleteBranch(database: DatabaseClient, id: string) {
  await database.delete(branches).where(eq(branches.id, id));
}

export async function countAppointmentsForBranch(database: DatabaseClient, branchId: string) {
  const [result] = await database
    .select({ value: count() })
    .from(appointments)
    .where(eq(appointments.branchId, branchId));

  return result?.value ?? 0;
}

function buildAdminBranchFilters(query: AdminBranchListQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.status) conditions.push(eq(branches.status, query.status));

  if (query.search) {
    const search = `%${query.search}%`;
    conditions.push(
      or(
        like(branches.nameEn, search),
        like(branches.nameKm, search),
        like(branches.addressEn, search),
        like(branches.addressKm, search),
        like(branches.phone, search),
      )!,
    );
  }

  if (conditions.length === 0) return undefined;
  return and(...conditions);
}

export async function listAdminBranches(database: DatabaseClient, query: AdminBranchListQuery) {
  const where = buildAdminBranchFilters(query);
  const sortColumns = {
    name: branches.nameEn,
    displayOrder: branches.displayOrder,
    createdAt: branches.createdAt,
    updatedAt: branches.updatedAt,
  } as const;
  const sortColumn = sortColumns[query.sort];
  const sortDirection = query.order === 'desc' ? desc : asc;
  const offset = (query.page - 1) * query.limit;

  const [items, totalResult] = await Promise.all([
    database
      .select()
      .from(branches)
      .where(where)
      .orderBy(sortDirection(sortColumn), asc(branches.id))
      .limit(query.limit)
      .offset(offset),
    database.select({ value: count() }).from(branches).where(where),
  ]);

  return { items, total: totalResult[0]?.value ?? 0 };
}

export async function listPublicBranches(database: DatabaseClient) {
  return database
    .select()
    .from(branches)
    .where(and(eq(branches.status, 'PUBLISHED'), eq(branches.showOnBranchesPage, true)))
    .orderBy(asc(branches.displayOrder), asc(branches.id));
}

export async function findPublicBranchBySlug(database: DatabaseClient, slug: string) {
  const [branch] = await database
    .select()
    .from(branches)
    .where(
      and(
        eq(branches.slug, slug),
        eq(branches.status, 'PUBLISHED'),
        eq(branches.showOnBranchesPage, true),
      ),
    )
    .limit(1);

  return branch;
}
