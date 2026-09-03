import { useQuery } from '@tanstack/react-query';
import { fetchAdminServicesContent } from '@/services/admin-services';

export function useAdminServicesPageQuery() { return useQuery({ queryFn: fetchAdminServicesContent, queryKey: ['admin-services-page'] }); }
