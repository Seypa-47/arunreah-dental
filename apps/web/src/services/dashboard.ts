import type { DashboardResponse } from '@arunreah/shared';
import { getApiClient, type ApiClient } from '@/lib/api';

export type AdminDashboard = DashboardResponse;

export async function getAdminDashboard(client: Pick<ApiClient, 'get'> = getApiClient()): Promise<AdminDashboard> {
  return client.get<AdminDashboard>('/api/admin/dashboard', { authenticated: true });
}
