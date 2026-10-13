import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/api';
import type { ApiClient, ApiRequestOptions } from '@/lib/api';
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  requestAdminPasswordReset,
  resetAdminPassword,
} from './auth';

const admin = {
  email: 'owner@example.test',
  id: 'admin-1',
  name: 'Clinic Owner',
  role: 'SUPER_ADMIN' as const,
};

function createAuthClient(overrides: Partial<Pick<ApiClient, 'get' | 'post'>> = {}) {
  return {
    get: async <T>() => ({ admin } as T),
    post: async <T>() => ({ admin } as T),
    ...overrides,
  } satisfies Pick<ApiClient, 'get' | 'post'>;
}

describe('admin auth API service', () => {
  it('logs in with the backend email/password contract and an authenticated cookie request', async () => {
    let request: { path: string; options: unknown } | undefined;
    const client = createAuthClient({
      post: async <T>(
        path: string,
        options?: Omit<ApiRequestOptions, 'method'>,
      ) => {
        request = { options, path };
        return { admin } as T;
      },
    });

    await expect(loginAdmin({ email: admin.email, password: 'secure-password' }, client)).resolves.toEqual(admin);
    expect(request).toEqual({
      options: {
        authenticated: true,
        json: { email: admin.email, password: 'secure-password' },
      },
      path: '/api/auth/login',
    });
  });

  it('treats an unauthenticated /me response as a signed-out session', async () => {
    const client = createAuthClient({
      get: async () => Promise.reject(new ApiClientError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401 })),
    });

    await expect(getCurrentAdmin(client)).resolves.toBeNull();
  });

  it('rethrows non-authentication session errors and tolerates an already-expired logout session', async () => {
    const unavailableClient = createAuthClient({
      get: async () => Promise.reject(new ApiClientError({ code: 'NETWORK_ERROR', message: 'Unavailable', status: 0 })),
    });
    const expiredSessionClient = createAuthClient({
      post: async () => Promise.reject(new ApiClientError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401 })),
    });

    await expect(getCurrentAdmin(unavailableClient)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    await expect(logoutAdmin(expiredSessionClient)).resolves.toBeUndefined();
  });

  it('uses the public password-reset request and confirmation contracts', async () => {
    const requests: Array<{ path: string; options: unknown }> = [];
    const client = createAuthClient({
      post: async <T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) => {
        requests.push({ path, options });
        return (path.endsWith('/request')
          ? { message: 'Check your email.' }
          : { reset: true }) as T;
      },
    });

    await expect(
      requestAdminPasswordReset(
        { email: admin.email, turnstileToken: 'turnstile-token' },
        client,
      ),
    ).resolves.toBe('Check your email.');
    await expect(
      resetAdminPassword({ token: 'a'.repeat(43), password: 'NewSecurePassword123!' }, client),
    ).resolves.toBeUndefined();

    expect(requests).toEqual([
      {
        path: '/api/auth/password-reset/request',
        options: { json: { email: admin.email, turnstileToken: 'turnstile-token' } },
      },
      {
        path: '/api/auth/password-reset/confirm',
        options: { json: { token: 'a'.repeat(43), password: 'NewSecurePassword123!' } },
      },
    ]);
  });
});
