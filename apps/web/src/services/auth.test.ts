import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/api';
import type { ApiClient, ApiRequestOptions } from '@/lib/api';
import { getCurrentAdmin, loginAdmin, logoutAdmin } from './auth';

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
});
