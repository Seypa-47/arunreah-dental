import { Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { canAccessAdminPath } from '@/routes/admin-route-access';
import { useAdminSession } from './session-provider';

function SessionLoading() {
  return (
    <main aria-busy="true" className="grid min-h-screen place-items-center bg-[#f7f9fc] px-5">
      <p className="text-sm font-medium text-[#71839e]">Checking your secure session…</p>
    </main>
  );
}

function SessionUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-5">
      <section className="max-w-md rounded-2xl border border-[#dce5ef] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#182238]">Admin session is unavailable</h1>
        <p className="mt-3 text-sm text-[#71839e]">Please check your connection and try again.</p>
        <button
          className="mt-6 rounded-lg bg-[#2187a8] px-4 py-2 text-sm font-semibold text-white"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </section>
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

  return <>{children}</>;
}

export function RedirectAuthenticatedAdmin({ children }: PropsWithChildren) {
  const { admin, isLoading } = useAdminSession();
  if (isLoading) return <SessionLoading />;
  if (admin) return <Navigate replace to="/admin/dashboard" />;
  return <>{children}</>;
}
