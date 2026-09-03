import type { AppointmentStatus, UpdateAppointmentStatusInput } from '@arunreah/shared';
import { getApiClient, type ApiClient } from '@/lib/api';

export type AppointmentListFilters = {
  branchId?: string;
  doctorId?: string;
  fromDate?: string;
  limit?: number;
  order?: 'asc' | 'desc';
  page?: number;
  search?: string;
  serviceId?: string;
  sort?: 'createdAt' | 'preferredDate' | 'updatedAt' | 'status';
  status?: AppointmentStatus;
  toDate?: string;
};

export type AppointmentListItem = {
  id: string;
  reference: string;
  patient: { email: string; name: string; phone: string };
  service: { id: string; nameSnapshot: string };
  doctor: { id: string; nameSnapshot: string | null } | null;
  branch: { id: string; nameSnapshot: string };
  preferredDate: string;
  preferredTime: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type AppointmentListResponse = {
  appointments: AppointmentListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type AppointmentDetail = AppointmentListItem & {
  notes: string | null;
  statusUpdatedAt: string | null;
  updatedAt: string;
};

function buildQuery(filters: AppointmentListFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function normalizeAppointmentFilters(filters: AppointmentListFilters): Required<Pick<AppointmentListFilters, 'limit' | 'order' | 'page' | 'sort'>> & AppointmentListFilters {
  const search = filters.search?.trim() || undefined;
  return {
    ...filters,
    limit: filters.limit ?? 20,
    order: filters.order ?? 'desc',
    page: filters.page ?? 1,
    search,
    sort: filters.sort ?? 'createdAt',
  };
}

export async function getAdminAppointments(
  filters: AppointmentListFilters,
  client: Pick<ApiClient, 'get'> = getApiClient(),
): Promise<AppointmentListResponse> {
  return client.get<AppointmentListResponse>(`/api/admin/appointments${buildQuery(normalizeAppointmentFilters(filters))}`, {
    authenticated: true,
  });
}

export async function getAdminAppointment(
  id: string,
  client: Pick<ApiClient, 'get'> = getApiClient(),
): Promise<AppointmentDetail> {
  const response = await client.get<{ appointment: AppointmentDetail }>(`/api/admin/appointments/${encodeURIComponent(id)}`, {
    authenticated: true,
  });
  return response.appointment;
}

export async function updateAdminAppointmentStatus(
  id: string,
  input: UpdateAppointmentStatusInput,
  client: Pick<ApiClient, 'patch'> = getApiClient(),
): Promise<void> {
  await client.patch<{ appointment: { id: string } }>(`/api/admin/appointments/${encodeURIComponent(id)}/status`, {
    authenticated: true,
    json: input,
  });
}
