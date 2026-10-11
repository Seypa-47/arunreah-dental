import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAdminCalendarAppointment, fetchAdminCalendarContent } from '@/services/admin-calendar';

export function useAdminCalendarPageQuery(year?: number, month?: number) {
  return useQuery({
    queryFn: () => fetchAdminCalendarContent(year !== undefined && month !== undefined ? { month, year } : undefined),
    queryKey: ['admin-calendar-page', year, month],
  });
}

export function useCreateAdminCalendarAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminCalendarAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-calendar-page'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });
}
