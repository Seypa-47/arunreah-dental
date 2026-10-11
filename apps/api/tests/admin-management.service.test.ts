import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminRole } from '@arunreah/shared';

type FakeAdminRecord = {
  id: string;
  displayName: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const state = vi.hoisted(() => ({
  admins: new Map<string, FakeAdminRecord>(),
  nextId: 1,
}));

vi.mock('../src/repositories/admin.repository', () => ({
  findAdminByEmail: async (_db: unknown, email: string) =>
    [...state.admins.values()].find((admin) => admin.email === email),
  findAdminById: async (_db: unknown, id: string) => state.admins.get(id),
  createAdmin: async (
    _db: unknown,
    input: { name: string; email: string; role: AdminRole },
    passwordHash: string,
  ) => {
    const admin: FakeAdminRecord = {
      id: `created-admin-${state.nextId++}`,
      displayName: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    state.admins.set(admin.id, admin);
    return admin;
  },
  updateAdmin: async (
    _db: unknown,
    id: string,
    input: { name?: string; email?: string; role?: AdminRole; isActive?: boolean },
    requireAnotherActiveSuperAdmin = false,
  ) => {
    const existing = state.admins.get(id);
    if (!existing) return undefined;

    if (requireAnotherActiveSuperAdmin) {
      const anotherActiveSuperAdmin = [...state.admins.values()].some(
        (admin) => admin.id !== id && admin.role === 'SUPER_ADMIN' && admin.isActive,
      );
      if (!anotherActiveSuperAdmin) return undefined;
    }

    const updated: FakeAdminRecord = {
      ...existing,
      displayName: input.name ?? existing.displayName,
      email: input.email ?? existing.email,
      role: input.role ?? existing.role,
      isActive: input.isActive ?? existing.isActive,
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    state.admins.set(id, updated);
    return updated;
  },
  countActiveSuperAdmins: async () =>
    [...state.admins.values()].filter((admin) => admin.role === 'SUPER_ADMIN' && admin.isActive)
      .length,
  isActiveSuperAdmin: (admin: { role: AdminRole; isActive: boolean }) =>
    admin.role === 'SUPER_ADMIN' && admin.isActive,
}));

vi.mock('../src/services/password.service', () => ({
  hashPassword: async (password: string) => `hashed:${password}`,
}));

const { createManagedAdmin, updateManagedAdmin } = await import('../src/services/admin.service');

function seedAdmin(overrides: Partial<FakeAdminRecord> & { id: string }): FakeAdminRecord {
  const admin: FakeAdminRecord = {
    displayName: 'Fixture Admin',
    email: 'fixture@example.com',
    passwordHash: 'hash',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
  state.admins.set(admin.id, admin);
  return admin;
}

beforeEach(() => {
  state.admins.clear();
  state.nextId = 1;
});

describe('createManagedAdmin', () => {
  it('creates an admin with a normalized email and never returns the password hash', async () => {
    const admin = await createManagedAdmin({} as never, {
      name: 'New Admin',
      email: ' New.Admin@Example.com ',
      password: 'CorrectPassword123!',
      role: 'RECEPTIONIST',
    });

    expect(admin).toEqual({
      id: expect.any(String),
      name: 'New Admin',
      email: 'new.admin@example.com',
      role: 'RECEPTIONIST',
      isActive: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect('passwordHash' in admin).toBe(false);
  });

  it('rejects creating an admin with an email already in use, case-insensitively', async () => {
    seedAdmin({ id: 'existing', email: 'taken@example.com' });

    await expect(
      createManagedAdmin({} as never, {
        name: 'Duplicate',
        email: 'TAKEN@example.com',
        password: 'CorrectPassword123!',
        role: 'RECEPTIONIST',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'CONFLICT' });
  });
});

describe('updateManagedAdmin', () => {
  it('rejects updating an unknown admin', async () => {
    await expect(
      updateManagedAdmin({} as never, 'actor-id', 'missing-id', { name: 'X' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });

  it('rejects updating an admin to an email already used by someone else', async () => {
    seedAdmin({ id: 'target', email: 'target@example.com', role: 'RECEPTIONIST' });
    seedAdmin({ id: 'other', email: 'other@example.com', role: 'RECEPTIONIST' });

    await expect(
      updateManagedAdmin({} as never, 'actor-id', 'target', { email: 'other@example.com' }),
    ).rejects.toMatchObject({ status: 409, code: 'CONFLICT' });
  });

  it('blocks a super admin from demoting or deactivating their own account', async () => {
    seedAdmin({ id: 'self', role: 'SUPER_ADMIN', isActive: true });
    seedAdmin({ id: 'other-super', email: 'other-super@example.com', role: 'SUPER_ADMIN', isActive: true });

    await expect(
      updateManagedAdmin({} as never, 'self', 'self', { role: 'CMS_ADMIN' }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
      message: expect.stringContaining('own super-admin access'),
    });
    await expect(
      updateManagedAdmin({} as never, 'self', 'self', { isActive: false }),
    ).rejects.toMatchObject({ status: 409, code: 'CONFLICT' });
  });

  it('blocks removing the last active super admin even when acted on by someone else', async () => {
    seedAdmin({ id: 'sole-super', role: 'SUPER_ADMIN', isActive: true });

    await expect(
      updateManagedAdmin({} as never, 'another-actor', 'sole-super', { role: 'CMS_ADMIN' }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
      message: expect.stringContaining('At least one active super administrator'),
    });
  });

  it('allows demoting a super admin when another active super admin remains', async () => {
    seedAdmin({ id: 'demote-me', email: 'demote@example.com', role: 'SUPER_ADMIN', isActive: true });
    seedAdmin({ id: 'other-super', email: 'other-super@example.com', role: 'SUPER_ADMIN', isActive: true });

    const updated = await updateManagedAdmin({} as never, 'another-actor', 'demote-me', {
      role: 'CMS_ADMIN',
    });

    expect(updated).toMatchObject({ id: 'demote-me', role: 'CMS_ADMIN' });
  });
});
