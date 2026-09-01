import { useQuery } from '@tanstack/react-query';
import { fetchAdminAllAppointmentsContent } from '@/services/admin-all-appointments';

export function useAdminAllAppointmentsPageQuery() { return useQuery({ queryFn: fetchAdminAllAppointmentsContent, queryKey: ['admin-all-appointments-page'] }); }
