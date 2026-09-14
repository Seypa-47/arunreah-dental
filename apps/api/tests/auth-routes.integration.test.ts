import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminRecord } from '../src/shared/admin';
import { HttpError } from '../src/shared/http-error';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type SessionRecord = {
  sessionId: string;
  adminId: string;
  displayName: string;
  email: string;
  role: AuthenticatedAdmin['role'];
};

const state = vi.hoisted(() => ({
  admins: new Map<string, AdminRecord>(),
  sessions: new Map<string, SessionRecord>(),
  createdSessions: [] as Array<{ id: string; adminId: string; tokenHash: string; expiresAt: string }>,
  failedLoginKeys: [] as string[],
  revokedSessionIds: [] as string[],
}));

vi.mock('../src/db/client', () => ({
  createDbClient: () => ({}),
}));

vi.mock('../src/repositories/admin.repository', () => ({
  findAdminByEmail: async (_database: unknown, email: string) => state.admins.get(email),
  listAdmins: async () => [...state.admins.values()],
}));

vi.mock('../src/repositories/session.repository', () => ({
  createAdminSession: async (
    _database: unknown,
    input: { id: string; adminId: string; tokenHash: string; expiresAt: string },
  ) => {
    state.createdSessions.push(input);
  },
  revokeAdminSession: async (_database: unknown, sessionId: string) => {
    state.revokedSessionIds.push(sessionId);
  },
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
  getLoginRateLimit: async () => undefined,
  saveLoginRateLimit: async (_database: unknown, input: { key: string }) => {
    state.failedLoginKeys.push(input.key);
  },
  clearLoginRateLimit: async () => undefined,
}));

vi.mock('../src/services/password.service', () => ({
  hashPassword: async () => 'password-hash',
  verifyPassword: async (password: string, passwordHash: string) =>
    password === 'CorrectPassword123!' && passwordHash === 'password-hash',
}));

vi.mock('../src/services/admin.service', () => ({
  createManagedAdmin: async (_database: unknown, input: { name: string; email: string; role: string }) => ({
    id: 'created-admin-id',
    name: input.name,
    email: input.email,
    role: input.role,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
  updateManagedAdmin: async (
    _database: unknown,
    _actorAdminId: string,
    targetAdminId: string,
    input: { name?: string; email?: string; role?: string; isActive?: boolean },
  ) => {
    if (targetAdminId === 'protected-admin') {
      throw new HttpError(409, 'CONFLICT', 'At least one active super administrator is required.');
    }

    return {
      id: targetAdminId,
      name: input.name ?? 'Updated Admin',
      email: input.email ?? 'updated@example.com',
      role: input.role ?? 'RECEPTIONIST',
      isActive: input.isActive ?? true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
  },
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

function adminFixture(
  overrides: Partial<AdminRecord> = {},
): AdminRecord & { displayName: string } {
  return {
    id: 'super-admin-id',
    name: 'Super Admin',
    displayName: 'Super Admin',
    email: 'super@example.com',
    passwordHash: 'password-hash',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

async function authenticatedHeaders(role: AuthenticatedAdmin['role'] = 'SUPER_ADMIN') {
  const token = `test-token-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session-id`,
    adminId: `${role}-admin-id`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });

  return { Cookie: `arunreah_admin_session=${token}` };
}

beforeEach(() => {
  state.admins.clear();
  state.sessions.clear();
  state.createdSessions.length = 0;
  state.failedLoginKeys.length = 0;
  state.revokedSessionIds.length = 0;
});

describe('authentication API routes', () => {
  it('logs in an active admin and returns only safe identity fields', async () => {
    state.admins.set('super@example.com', adminFixture());

    const response = await app.request(
      'http://localhost/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ' SUPER@EXAMPLE.COM ', password: 'CorrectPassword123!' }),
      },
      testBindings,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toContain('HttpOnly');
    expect(await response.json()).toEqual({
      success: true,
      data: {
        admin: {
          id: 'super-admin-id',
          name: 'Super Admin',
          email: 'super@example.com',
          role: 'SUPER_ADMIN',
        },
      },
    });
    expect(state.createdSessions).toHaveLength(1);
    expect(state.createdSessions[0]?.tokenHash).not.toContain('CorrectPassword123!');
  });

  it.each([
    ['invalid password', adminFixture(), 'WrongPassword123!'],
    ['unknown email', undefined, 'CorrectPassword123!'],
    ['inactive admin', adminFixture({ isActive: false }), 'CorrectPassword123!'],
  ])('rejects %s with the same generic credentials response', async (_case, admin, password) => {
    if (admin) state.admins.set('super@example.com', admin);

    const response = await app.request(
      'http://localhost/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'super@example.com', password }),
      },
      testBindings,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' },
    });
    expect(state.createdSessions).toHaveLength(0);
  });

  it('returns the current admin for a valid session and rejects missing or expired sessions', async () => {
    const headers = await authenticatedHeaders();
    const validResponse = await app.request('http://localhost/api/auth/me', { headers }, testBindings);

    expect(validResponse.status).toBe(200);
    await expect(validResponse.json()).resolves.toMatchObject({
      success: true,
      data: { admin: { role: 'SUPER_ADMIN', email: 'super_admin@example.com' } },
    });

    const noSessionResponse = await app.request('http://localhost/api/auth/me', undefined, testBindings);
    expect(noSessionResponse.status).toBe(401);

    const expiredResponse = await app.request(
      'http://localhost/api/auth/me',
      { headers: { Cookie: 'arunreah_admin_session=expired-token' } },
      testBindings,
    );
    expect(expiredResponse.status).toBe(401);
  });

  it('revokes the authenticated session during logout', async () => {
    const headers = await authenticatedHeaders();
    const response = await app.request(
      'http://localhost/api/auth/logout',
      { method: 'POST', headers },
      testBindings,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, data: { loggedOut: true } });
    expect(state.revokedSessionIds).toEqual(['SUPER_ADMIN-session-id']);
    expect(response.headers.get('Set-Cookie')).toContain('arunreah_admin_session=');
  });
});

describe('admin-management API routes', () => {
  it('allows a super admin to list, create, and update safe admin records', async () => {
    state.admins.set('super@example.com', adminFixture());
    const headers = await authenticatedHeaders();

    const listResponse = await app.request('http://localhost/api/admin/admins', { headers }, testBindings);
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toMatchObject({
      success: true,
      data: { admins: [{ id: 'super-admin-id', role: 'SUPER_ADMIN' }] },
    });

    const createResponse = await app.request(
      'http://localhost/api/admin/admins',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Reception Staff',
          email: 'reception@example.com',
          password: 'CorrectPassword123!',
          role: 'RECEPTIONIST',
        }),
      },
      testBindings,
    );
    expect(createResponse.status).toBe(201);
    await expect(createResponse.json()).resolves.toMatchObject({
      success: true,
      data: { admin: { role: 'RECEPTIONIST', isActive: true } },
    });

    const updateResponse = await app.request(
      'http://localhost/api/admin/admins/receptionist-id',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'CMS_ADMIN' }),
      },
      testBindings,
    );
    expect(updateResponse.status).toBe(200);
    await expect(updateResponse.json()).resolves.toMatchObject({
      success: true,
      data: { admin: { id: 'receptionist-id', role: 'CMS_ADMIN' } },
    });
  });

  it('rejects a non-super-admin and returns protected-operation conflicts', async () => {
    const receptionistHeaders = await authenticatedHeaders('RECEPTIONIST');
    const forbiddenResponse = await app.request(
      'http://localhost/api/admin/admins',
      { headers: receptionistHeaders },
      testBindings,
    );
    expect(forbiddenResponse.status).toBe(403);

    const superAdminHeaders = await authenticatedHeaders();
    const protectedResponse = await app.request(
      'http://localhost/api/admin/admins/protected-admin',
      {
        method: 'PATCH',
        headers: { ...superAdminHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      },
      testBindings,
    );
    expect(protectedResponse.status).toBe(409);
    await expect(protectedResponse.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'At least one active super administrator is required.',
      },
    });
  });
});
