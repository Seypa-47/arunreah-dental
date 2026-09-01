import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchAdminLoginContent, submitAdminLogin } from '@/services/admin-auth';

export function useAdminLoginPageQuery() {
  return useQuery({
    queryFn: fetchAdminLoginContent,
    queryKey: ['admin-login-page'],
  });
}

export function useAdminLoginMutation() {
  return useMutation({
    mutationFn: submitAdminLogin,
  });
}
