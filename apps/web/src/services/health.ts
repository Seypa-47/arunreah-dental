import { getApiClient, type ApiClient } from '@/lib/api';

export type ApiHealth = {
  service: string;
  status: 'ok';
};

type HealthApiClient = Pick<ApiClient, 'get'>;

export function getApiHealth(client: HealthApiClient = getApiClient(), signal?: AbortSignal) {
  return client.get<ApiHealth>('/api/health', { signal });
}
