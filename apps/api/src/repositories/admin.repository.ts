import { and, count, eq } from 'drizzle-orm';
import type { AdminRole, CreateAdminInput, UpdateAdminInput } from '@arunreah/shared';
import { admins } from '../db/schema';
import type { DatabaseClient } from '../db/client';
import type { AdminRecord } from '../shared/admin';

export async function findAdminByEmail(database: DatabaseClient, email: string) {
  const [admin] = await database.select().from(admins).where(eq(admins.email, email)).limit(1);

  return admin;
}

export async function findAdminById(database: DatabaseClient, id: string) {
  const [admin] = await database.select().from(admins).where(eq(admins.id, id)).limit(1);

  return admin;
}

export async function listAdmins(database: DatabaseClient) {
  return database.select().from(admins).orderBy(admins.createdAt);
}

export async function createAdmin(
  database: DatabaseClient,
  input: CreateAdminInput,
  passwordHash: string,
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await database.insert(admins).values({
    id,
    displayName: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return findAdminById(database, id);
}

export async function updateAdmin(database: DatabaseClient, id: string, input: UpdateAdminInput) {
  const changes: {
    displayName?: string;
    email?: string;
    role?: AdminRole;
    isActive?: boolean;
    updatedAt: string;
  } = {
    updatedAt: new Date().toISOString(),
  };

  if (input.name !== undefined) changes.displayName = input.name;
  if (input.email !== undefined) changes.email = input.email;
  if (input.role !== undefined) changes.role = input.role;
  if (input.isActive !== undefined) changes.isActive = input.isActive;

  await database.update(admins).set(changes).where(eq(admins.id, id));

  return findAdminById(database, id);
}

export async function countActiveSuperAdmins(database: DatabaseClient): Promise<number> {
  const [result] = await database
    .select({ value: count() })
    .from(admins)
    .where(and(eq(admins.role, 'SUPER_ADMIN'), eq(admins.isActive, true)));

  return result?.value ?? 0;
}

export function isActiveSuperAdmin(admin: Pick<AdminRecord, 'role' | 'isActive'>): boolean {
  return admin.role === 'SUPER_ADMIN' && admin.isActive;
}
