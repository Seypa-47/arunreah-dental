import { useMutation, useQuery } from '@tanstack/react-query';
import { createAdminCalendarAppointment, fetchAdminCalendarContent } from '@/services/admin-calendar';

export function useAdminCalendarPageQuery() {
  return useQuery({ queryFn: fetchAdminCalendarContent, queryKey: ['admin-calendar-page'] });
}

export function useCreateAdminCalendarAppointmentMutation() {
  return useMutation({ mutationFn: createAdminCalendarAppointment });
}
