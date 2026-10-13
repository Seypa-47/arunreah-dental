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
  createdSessions: [] as Array<{
    id: string;
    adminId: string;
    tokenHash: string;
    expiresAt: string;
  }>,
  failedLoginKeys: [] as string[],
  loginRateLimits: new Map<string, { attempts: number; lockedUntil: string | null }>(),
  revokedSessionIds: [] as string[],
  revokedAllSessionAdminIds: [] as string[],
  passwordResetTokens: new Map<string, string>(),
  passwordResetEmails: [] as Array<{ recipient: string; token: string }>,
  updatedPasswords: [] as Array<{ adminId: string; passwordHash: string }>,
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
  revokeAllAdminSessions: async (_database: unknown, adminId: string) => {
    state.revokedAllSessionAdminIds.push(adminId);
  },
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
  getLoginRateLimit: async (_database: unknown, key: string) => state.loginRateLimits.get(key),
  saveLoginRateLimit: async (
    _database: unknown,
    input: { key: string; attemptLimit: number; lockedUntil: string },
  ) => {
    state.failedLoginKeys.push(input.key);
    const attempts = (state.loginRateLimits.get(input.key)?.attempts ?? 0) + 1;
    const record = {
      attempts,
      lockedUntil: attempts >= input.attemptLimit ? input.lockedUntil : null,
    };
    state.loginRateLimits.set(input.key, record);
    return record;
  },
  clearLoginRateLimit: async (_database: unknown, key: string) => {
    state.loginRateLimits.delete(key);
  },
  cleanupExpiredAuthenticationRecords: async () => undefined,
}));

vi.mock('../src/repositories/password-reset.repository', () => ({
  createPasswordResetToken: async (
    _database: unknown,
    input: { adminId: string; tokenHash: string },
  ) => {
    state.passwordResetTokens.clear();
    state.passwordResetTokens.set(input.tokenHash, input.adminId);
  },
  consumePasswordResetToken: async (_database: unknown, tokenHash: string) => {
    const adminId = state.passwordResetTokens.get(tokenHash);
    if (!adminId) return undefined;
    state.passwordResetTokens.delete(tokenHash);
    return { adminId };
  },
  updateAdminPassword: async (_database: unknown, adminId: string, passwordHash: string) => {
    state.updatedPasswords.push({ adminId, passwordHash });
    return { id: adminId };
  },
  cleanupExpiredPasswordResetTokens: async () => undefined,
}));

vi.mock('../src/services/password-reset-email.service', () => ({
  sendAdminPasswordResetEmail: async (recipient: string, token: string) => {
    state.passwordResetEmails.push({ recipient, token });
    return true;
  },
}));

vi.mock('../src/services/maintenance.service', () => ({
  runBestEffortMaintenance: async () => undefined,
}));

vi.mock('../src/services/password.service', () => ({
  hashPassword: async () => 'password-hash',
  verifyPassword: async (password: string, passwordHash: string) =>
    password === 'CorrectPassword123!' && passwordHash === 'password-hash',
}));

vi.mock('../src/services/admin.service', () => ({
  createManagedAdmin: async (
    _database: unknown,
    input: { name: string; email: string; role: string },
  ) => ({
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
    if (targetAdminId === '550e8400-e29b-41d4-a716-446655440506') {
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

function adminFixture(overrides: Partial<AdminRecord> = {}): AdminRecord & { displayName: string } {
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
  state.loginRateLimits.clear();
  state.revokedSessionIds.length = 0;
  state.revokedAllSessionAdminIds.length = 0;
  state.passwordResetTokens.clear();
  state.passwordResetEmails.length = 0;
  state.updatedPasswords.length = 0;
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

  it('atomically enforces credential limits across concurrent failed logins', async () => {
    state.admins.set('super@example.com', adminFixture());

    const responses = await Promise.all(
      Array.from({ length: 8 }, () =>
        app.request(
          'http://localhost/api/auth/login',
          {
            method: 'POST',
            headers: {
              'CF-Connecting-IP': '203.0.113.10',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'super@example.com', password: 'WrongPassword123!' }),
          },
          testBindings,
        ),
      ),
    );

    const statuses = responses.map((response) => response.status);
    expect(statuses.filter((status) => status === 401)).toHaveLength(4);
    expect(statuses.filter((status) => status === 429)).toHaveLength(4);
    expect(state.createdSessions).toHaveLength(0);
  });

  it('returns the current admin for a valid session and rejects missing or expired sessions', async () => {
    const headers = await authenticatedHeaders();
    const validResponse = await app.request(
      'http://localhost/api/auth/me',
      { headers },
      testBindings,
    );

    expect(validResponse.status).toBe(200);
    await expect(validResponse.json()).resolves.toMatchObject({
      success: true,
      data: { admin: { role: 'SUPER_ADMIN', email: 'super_admin@example.com' } },
    });

    const noSessionResponse = await app.request(
      'http://localhost/api/auth/me',
      undefined,
      testBindings,
    );
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

  it('returns the same password-reset request response for known and unknown emails', async () => {
    state.admins.set('super@example.com', adminFixture());
    const expectedMessage =
      'If an active administrator account matches that email, a reset link will be sent shortly.';

    for (const email of ['super@example.com', 'missing@example.com']) {
      const response = await app.request(
        'http://localhost/api/auth/password-reset/request',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
        testBindings,
      );
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        success: true,
        data: { message: expectedMessage },
      });
    }

    expect(state.passwordResetEmails).toHaveLength(1);
    expect(state.passwordResetEmails[0]?.recipient).toBe('super@example.com');
    expect(state.passwordResetTokens.size).toBe(1);
  });

  it('uses a password-reset token once, updates the password, and revokes all sessions', async () => {
    const rawToken = 'a'.repeat(43);
    state.passwordResetTokens.set(await hashSessionToken(rawToken), 'super-admin-id');

    const first = await app.request(
      'http://localhost/api/auth/password-reset/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawToken, password: 'NewSecurePassword123!' }),
      },
      testBindings,
    );
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual({ success: true, data: { reset: true } });
    expect(state.updatedPasswords).toEqual([
      { adminId: 'super-admin-id', passwordHash: 'password-hash' },
    ]);
    expect(state.revokedAllSessionAdminIds).toEqual(['super-admin-id']);

    const replay = await app.request(
      'http://localhost/api/auth/password-reset/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: rawToken, password: 'AnotherSecurePassword123!' }),
      },
      testBindings,
    );
    expect(replay.status).toBe(400);
  });
});

describe('admin-management API routes', () => {
  it('allows a super admin to list, create, and update safe admin records', async () => {
    state.admins.set('super@example.com', adminFixture());
    const headers = await authenticatedHeaders();

    const listResponse = await app.request(
      'http://localhost/api/admin/admins',
      { headers },
      testBindings,
    );
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
      'http://localhost/api/admin/admins/550e8400-e29b-41d4-a716-446655440505',
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
      data: { admin: { id: '550e8400-e29b-41d4-a716-446655440505', role: 'CMS_ADMIN' } },
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
      'http://localhost/api/admin/admins/550e8400-e29b-41d4-a716-446655440506',
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
