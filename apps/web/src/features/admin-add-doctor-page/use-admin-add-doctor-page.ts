import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminAddDoctorContent,
  saveNewDoctor,
  type NewDoctorFormState,
} from '@/services/admin-add-doctor';

export function useAdminAddDoctorPageQuery() {
  return useQuery({
    queryFn: fetchAdminAddDoctorContent,
    queryKey: ['admin-add-doctor-page'],
  });
}

export function useCreateDoctorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newDoctor: NewDoctorFormState) => saveNewDoctor(newDoctor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-doctors-page'] });
    },
  });
}

