import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getAdminAppointments, normalizeAppointmentFilters, type AppointmentListFilters } from '@/services/appointments';

export function useAdminAllAppointmentsPageQuery(filters: AppointmentListFilters) {
  const normalizedFilters = normalizeAppointmentFilters(filters);
  return useQuery({
    queryFn: () => getAdminAppointments(normalizedFilters),
    queryKey: queryKeys.admin.appointments(normalizedFilters),
    retry: false,
  });
}
