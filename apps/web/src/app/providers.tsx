import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { AdminSessionProvider } from '@/features/admin-auth/session-provider';
import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <PublicLanguageProvider><AdminSessionProvider>{children}</AdminSessionProvider></PublicLanguageProvider>
    </QueryClientProvider>
  );
}
