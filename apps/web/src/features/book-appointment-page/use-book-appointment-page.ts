import { useQuery } from '@tanstack/react-query';
import { publicBookingChrome } from '@/features/public-content/public-page-chrome';
import { getPublicBranches, getPublicContact, getPublicDoctors, getPublicServices } from '@/services/public-content';
import { mapBookingOptions } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';

export function useBookAppointmentPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [services, doctors, branches, contact] = await Promise.all([
        getPublicServices(language),
        getPublicDoctors(language),
        getPublicBranches(language),
        getPublicContact(),
      ]);
      return mapBookingOptions(publicBookingChrome(), services.services, doctors.doctors, branches.branches, contact);
    },
    queryKey: queryKeys.public.bookingOptions(language),
  });
}
