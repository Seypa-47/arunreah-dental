import { useMutation, useQuery } from '@tanstack/react-query';
import { useAdminSession } from '@/features/admin-auth/session-provider';
import { fetchAdminLoginContent } from '@/services/admin-auth';

export function useAdminLoginPageQuery() {
  return useQuery({
    queryFn: fetchAdminLoginContent,
    queryKey: ['admin-login-page'],
  });
}

export function useAdminLoginMutation() {
  const { login } = useAdminSession();

  return useMutation({
    mutationFn: login,
  });
}
