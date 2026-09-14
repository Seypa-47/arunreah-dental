import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  sessions: new Map<string, SessionRecord>(),
  revokedSessionIds: [] as string[],
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/session.repository', () => ({
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
  revokeAdminSession: async (_database: unknown, sessionId: string) => {
    state.revokedSessionIds.push(sessionId);
  },
}));

const { app } = await import('../src/app');
const { createSessionToken, getSessionCookieOptions, hashSessionToken, sessionMaxAgeSeconds } =
  await import('../src/services/session.service');

const bindings = {
  APP_ENV: 'production',
  CORS_ALLOWED_ORIGINS: 'https://admin.example.com',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

async function sessionHeaders() {
  const token = 'production-session-token';
  state.sessions.set(await hashSessionToken(token), {
    sessionId: 'session-id',
    adminId: 'admin-id',
    displayName: 'Super Admin',
    email: 'super@example.com',
    role: 'SUPER_ADMIN',
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

beforeEach(() => {
  state.sessions.clear();
  state.revokedSessionIds.length = 0;
});

describe('production security middleware', () => {
  it('uses unpredictable, secure production session cookie settings', () => {
    expect(createSessionToken()).not.toBe(createSessionToken());
    expect(getSessionCookieOptions(bindings)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: sessionMaxAgeSeconds,
    });
  });

  it('sets API security headers and private cache controls for session-bearing responses', async () => {
    const health = await app.request('https://api.example.com/api/health', undefined, bindings);
    expect(health.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(health.headers.get('Referrer-Policy')).toBe('no-referrer');

    const me = await app.request(
      'https://api.example.com/api/auth/me',
      { headers: await sessionHeaders() },
      bindings,
    );
    expect(me.status).toBe(200);
    expect(me.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('requires an exact configured Origin for production cookie-authenticated writes', async () => {
    const noOrigin = await app.request(
      'https://api.example.com/api/auth/logout',
      { method: 'POST', headers: await sessionHeaders() },
      bindings,
    );
    expect(noOrigin.status).toBe(403);

    const untrustedOrigin = await app.request(
      'https://api.example.com/api/auth/logout',
      {
        method: 'POST',
        headers: { ...(await sessionHeaders()), Origin: 'https://attacker.example' },
      },
      bindings,
    );
    expect(untrustedOrigin.status).toBe(403);

    const trustedOrigin = await app.request(
      'https://api.example.com/api/auth/logout',
      {
        method: 'POST',
        headers: { ...(await sessionHeaders()), Origin: 'https://admin.example.com' },
      },
      bindings,
    );
    expect(trustedOrigin.status).toBe(200);
    expect(state.revokedSessionIds).toEqual(['session-id']);
  });

  it('uses credentialed CORS only for configured origins', async () => {
    const allowed = await app.request(
      'https://api.example.com/api/admin/dashboard',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://admin.example.com',
          'Access-Control-Request-Method': 'GET',
        },
      },
      bindings,
    );
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe('https://admin.example.com');
    expect(allowed.headers.get('Access-Control-Allow-Credentials')).toBe('true');

    const rejected = await app.request(
      'https://api.example.com/api/admin/dashboard',
      {
        method: 'OPTIONS',
        headers: { Origin: 'https://attacker.example', 'Access-Control-Request-Method': 'GET' },
      },
      bindings,
    );
    expect(rejected.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
    expect(rejected.headers.get('Access-Control-Allow-Origin')).not.toBe(
      'https://attacker.example',
    );
  });
});
