import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from 'react';
import type { AdminLoginInput } from '@arunreah/shared';
import { queryKeys } from '@/lib/query-keys';
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  type AuthenticatedAdmin,
} from '@/services/auth';

type AdminSessionContextValue = {
  admin: AuthenticatedAdmin | null;
  authError: Error | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  login(input: AdminLoginInput): Promise<AuthenticatedAdmin>;
  logout(): Promise<void>;
  refresh(): Promise<AuthenticatedAdmin | null>;
};

const AdminSessionContext = createContext<AdminSessionContextValue | undefined>(undefined);

export function AdminSessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryFn: () => getCurrentAdmin(),
    queryKey: queryKeys.auth.me(),
    retry: false,
    staleTime: 60_000,
  });
  const loginMutation = useMutation({ mutationFn: (input: AdminLoginInput) => loginAdmin(input) });
  const logoutMutation = useMutation({ mutationFn: () => logoutAdmin() });

  const login = useCallback(
    async (input: AdminLoginInput) => {
      const admin = await loginMutation.mutateAsync(input);
      queryClient.setQueryData(queryKeys.auth.me(), admin);
      return admin;
    },
    [loginMutation, queryClient],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(queryKeys.auth.me(), null);
  }, [logoutMutation, queryClient]);

  const refresh = useCallback(async () => {
    const result = await sessionQuery.refetch();
    return result.data ?? null;
  }, [sessionQuery]);

  const admin = sessionQuery.data ?? null;
  const authError = sessionQuery.error instanceof Error ? sessionQuery.error : null;

  return (
    <AdminSessionContext.Provider
      value={{
        admin,
        authError,
        isAuthenticated: admin !== null,
        isLoading: sessionQuery.isLoading,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const value = useContext(AdminSessionContext);
  if (!value) throw new Error('useAdminSession must be used within AdminSessionProvider.');
  return value;
}
