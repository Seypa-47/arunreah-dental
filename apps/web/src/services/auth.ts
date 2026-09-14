import type { AdminLoginInput, AdminRole } from '@arunreah/shared';
import { getApiClient, isApiClientError, type ApiClient } from '@/lib/api';

export type AuthenticatedAdmin = {
  email: string;
  id: string;
  name: string;
  role: AdminRole;
};

type AuthenticatedAdminResponse = { admin: AuthenticatedAdmin };
type AuthApiClient = Pick<ApiClient, 'get' | 'post'>;

export async function loginAdmin(
  input: AdminLoginInput,
  client: AuthApiClient = getApiClient(),
): Promise<AuthenticatedAdmin> {
  const response = await client.post<AuthenticatedAdminResponse>('/api/auth/login', {
    authenticated: true,
    json: input,
  });
  return response.admin;
}

export async function getCurrentAdmin(
  client: AuthApiClient = getApiClient(),
): Promise<AuthenticatedAdmin | null> {
  try {
    const response = await client.get<AuthenticatedAdminResponse>('/api/auth/me', {
      authenticated: true,
    });
    return response.admin;
  } catch (error) {
    if (isApiClientError(error) && error.status === 401) return null;
    throw error;
  }
}

export async function logoutAdmin(client: AuthApiClient = getApiClient()): Promise<void> {
  try {
    await client.post<{ loggedOut: boolean }>('/api/auth/logout', { authenticated: true });
  } catch (error) {
    if (isApiClientError(error) && error.status === 401) return;
    throw error;
  }
}
