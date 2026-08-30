import type { CreateAdminInput, UpdateAdminInput } from '@arunreah/shared';
import {
  countActiveSuperAdmins,
  createAdmin,
  findAdminByEmail,
  findAdminById,
  isActiveSuperAdmin,
  updateAdmin,
} from '../repositories/admin.repository';
import type { DatabaseClient } from '../db/client';
import { HttpError } from '../shared/http-error';
import { toSafeAdmin } from '../shared/admin';
import { normalizeAdminEmail } from './auth.service';
import { hashPassword } from './password.service';

export async function createManagedAdmin(database: DatabaseClient, input: CreateAdminInput) {
  const email = normalizeAdminEmail(input.email);
  const existing = await findAdminByEmail(database, email);

  if (existing) {
    throw new HttpError(409, 'CONFLICT', 'An administrator with this email already exists.');
  }

  const admin = await createAdmin(
    database,
    { ...input, email },
    await hashPassword(input.password),
  );

  if (!admin) {
    throw new Error('Created administrator could not be loaded.');
  }

  return toSafeAdmin(admin);
}

export async function updateManagedAdmin(
  database: DatabaseClient,
  actorAdminId: string,
  targetAdminId: string,
  input: UpdateAdminInput,
) {
  const target = await findAdminById(database, targetAdminId);

  if (!target) {
    throw new HttpError(404, 'NOT_FOUND', 'Administrator not found.');
  }

  if (input.email !== undefined) {
    const email = normalizeAdminEmail(input.email);
    const existing = await findAdminByEmail(database, email);

    if (existing && existing.id !== target.id) {
      throw new HttpError(409, 'CONFLICT', 'An administrator with this email already exists.');
    }

    input = { ...input, email };
  }

  const nextRole = input.role ?? target.role;
  const nextIsActive = input.isActive ?? target.isActive;
  const removesActiveSuperAdmin =
    isActiveSuperAdmin(target) && (nextRole !== 'SUPER_ADMIN' || !nextIsActive);

  if (actorAdminId === target.id && removesActiveSuperAdmin) {
    throw new HttpError(
      409,
      'CONFLICT',
      'You cannot disable or remove your own super-admin access.',
    );
  }

  if (removesActiveSuperAdmin && (await countActiveSuperAdmins(database)) <= 1) {
    throw new HttpError(409, 'CONFLICT', 'At least one active super administrator is required.');
  }

  const admin = await updateAdmin(database, targetAdminId, input);

  if (!admin) {
    throw new Error('Updated administrator could not be loaded.');
  }

  return toSafeAdmin(admin);
}
