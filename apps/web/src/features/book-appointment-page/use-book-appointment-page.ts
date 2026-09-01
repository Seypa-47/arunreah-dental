import { useQuery } from '@tanstack/react-query';
import { fetchBookAppointmentPage } from '@/services/landing-page';

export function useBookAppointmentPageQuery() {
  return useQuery({
    queryFn: fetchBookAppointmentPage,
    queryKey: ['book-appointment-page'],
  });
}
