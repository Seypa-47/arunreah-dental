import { Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { Button } from '@/components/ui/button';
import { AdminWorkspace } from '@/components/layout/admin-workspace';
import { canAccessAdminPath } from '@/routes/admin-route-access';
import { useAdminSession } from './session-provider';

function SessionLoading() {
  return (
    <main aria-busy="true" className="admin-state-page">
      <AdminFeedback title="Checking your secure session…" tone="loading" />
    </main>
  );
}

function SessionUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="admin-state-page">
      <AdminFeedback title="Admin session is unavailable" tone="error" actions={<Button onClick={onRetry}>Retry</Button>}>
        <p>Please check your connection and try again.</p>
      </AdminFeedback>
    </main>
  );
}

export function RequireAdminRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const { admin, authError, isLoading, refresh } = useAdminSession();

  if (isLoading) return <SessionLoading />;
  if (authError) return <SessionUnavailable onRetry={() => void refresh()} />;
  if (!admin) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}` }}
        to="/admin/login"
      />
    );
  }
  if (!canAccessAdminPath(admin.role, location.pathname)) {
    return <Navigate replace to="/admin/dashboard" />;
  }

  return <AdminWorkspace>{children}</AdminWorkspace>;
}

export function RedirectAuthenticatedAdmin({ children }: PropsWithChildren) {
  const { admin, isLoading } = useAdminSession();
  if (isLoading) return <SessionLoading />;
  if (admin) return <Navigate replace to="/admin/dashboard" />;
  return <>{children}</>;
}
