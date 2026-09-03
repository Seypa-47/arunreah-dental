import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminClinicInfoContent,
  saveBranch,
  saveClinicInfo,
  saveContactSettings,
  type ClinicBranch,
  type ClinicGeneralInfo,
  type ContactSettings,
} from '@/services/admin-clinic-info';

export function useAdminClinicInfoPageQuery() {
  return useQuery({
    queryFn: fetchAdminClinicInfoContent,
    queryKey: ['admin-clinic-info-page'],
  });
}

export function useUpdateClinicInfoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: ClinicGeneralInfo) => saveClinicInfo(info),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-clinic-info-page'] });
    },
  });
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branch: ClinicBranch) => saveBranch(branch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-clinic-info-page'] });
    },
  });
}

export function useUpdateContactSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: ContactSettings) => saveContactSettings(settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-clinic-info-page'] });
    },
  });
}

