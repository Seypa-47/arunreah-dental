import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminLoginContent } from '@/services/admin-auth';
import { useAdminLoginMutation, useAdminLoginPageQuery } from './use-admin-login-page';

function UserIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 2.15c-4.35 0-7.9 2.2-7.9 4.9 0 .8.65 1.45 1.45 1.45h13.9c.8 0 1.45-.65 1.45-1.45 0-2.7-3.55-4.9-7.9-4.9Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 10h-1V7a5 5 0 0 0-10 0v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM9.3 7a2.7 2.7 0 0 1 5.4 0v3H9.3V7Z" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5Zm1.1 13.35h-2.2v-2.2h2.2v2.2Zm0-4.4h-2.2V7.9h2.2v3.8Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.5 4.5 5.7v5.15c0 4.92 3.16 8.72 7.5 10.65 4.34-1.93 7.5-5.73 7.5-10.65V5.7L12 2.5Zm0 4.05 4 1.7v2.6c0 3.23-1.86 5.78-4 6.96-2.14-1.18-4-3.73-4-6.96v-2.6l4-1.7Z" />
    </svg>
  );
}

function SecurityLockIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 10V7a5 5 0 0 0-10 0v3H5v11h14V10h-2ZM9.5 7a2.5 2.5 0 0 1 5 0v3h-5V7Z" />
    </svg>
  );
}

function AdminLoginForm({ content }: { content: AdminLoginContent }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useAdminLoginMutation();
  const hasError = loginMutation.isError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ password, username });
  };

  return (
    <Card className="w-full max-w-[520px] rounded-[34px] border-[#dce5ef] bg-white px-6 py-8 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:px-[44px] sm:py-[42px]">
      <form noValidate onSubmit={handleSubmit}>
        <h1 className="text-[24px] font-bold leading-tight text-[#182238] sm:text-[25px]">{content.form.title}</h1>
        <p className="mt-2 text-[16px] leading-6 text-[#71839e]">{content.form.subtitle}</p>

        <div className="mt-7 space-y-5">
          <label className="block" htmlFor="admin-username">
            <span className="mb-2 block text-[15px] font-medium text-[#71839e]">{content.fields.username.label}</span>
            <span className="flex h-[58px] items-center gap-3 rounded-xl border border-[#d9e3ee] px-4 text-[#97a8be] transition focus-within:border-[#2388a9] focus-within:ring-2 focus-within:ring-[#2388a9]/20">
              <UserIcon />
              <input
                autoComplete="username"
                className="min-w-0 flex-1 bg-transparent text-[16px] text-[#1f2a40] outline-none placeholder:text-[#a9b7c9]"
                id="admin-username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder={content.fields.username.placeholder}
                required
                value={username}
              />
            </span>
          </label>

          <label className="block" htmlFor="admin-password">
            <span className="mb-2 flex items-center justify-between gap-4 text-[15px] font-medium text-[#71839e]">
              {content.fields.password.label}
              <a className="text-[#218caf] hover:text-[#096d91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#218caf]" href={content.form.forgotPasswordUrl}>
                {content.form.forgotPasswordLabel}
              </a>
            </span>
            <span className="flex h-[58px] items-center gap-3 rounded-xl border border-[#d9e3ee] px-4 text-[#97a8be] transition focus-within:border-[#2388a9] focus-within:ring-2 focus-within:ring-[#2388a9]/20">
              <LockIcon />
              <input
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent text-[16px] text-[#1f2a40] outline-none placeholder:text-[#a9b7c9]"
                id="admin-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={content.fields.password.placeholder}
                required
                type={passwordVisible ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                className="rounded p-1 transition hover:text-[#2388a9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2388a9]"
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                <EyeIcon hidden={!passwordVisible} />
              </button>
            </span>
          </label>
        </div>

        {hasError ? (
          <p aria-live="polite" className="mt-6 flex items-center gap-3 rounded-xl border border-[#ffd5d5] bg-[#fff0f0] px-4 py-3 text-[15px] font-medium text-[#f03c3c]" role="alert">
            <AlertIcon />
            {content.form.errorMessage}
          </p>
        ) : null}

        <Button className="mt-6 h-[58px] w-full rounded-xl bg-[#2187a8] text-[17px] shadow-[0_12px_18px_rgba(33,135,168,0.22)] hover:bg-[#176f8c]" disabled={loginMutation.isPending} type="submit">
          {content.form.submitLabel}
        </Button>

        <div className="mt-9 flex items-center gap-4 text-[#9badc5]">
          <span aria-hidden="true" className="h-px flex-1 bg-[#dbe4ed]" />
          <span className="whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.6px]">{content.security.verifiedLabel}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-[#dbe4ed]" />
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] text-[#71839e]">
          <span className="inline-flex items-center gap-2"><ShieldIcon />{content.security.sslLabel}</span>
          <span className="inline-flex items-center gap-2"><SecurityLockIcon />{content.security.encryptionLabel}</span>
        </div>
      </form>
    </Card>
  );
}

function AdminLoginSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading admin login" className="grid min-h-screen place-items-center bg-[#f7f9fc] px-5 py-12">
      <div className="w-full max-w-[520px] animate-pulse rounded-[34px] bg-white px-6 py-10 sm:px-[44px]">
        <div className="h-9 w-52 rounded bg-[#e7edf3]" />
        <div className="mt-4 h-6 w-72 rounded bg-[#eef2f6]" />
        <div className="mt-8 h-[58px] rounded-xl bg-[#eef2f6]" />
        <div className="mt-5 h-[58px] rounded-xl bg-[#eef2f6]" />
        <div className="mt-6 h-[58px] rounded-xl bg-[#e7edf3]" />
      </div>
    </main>
  );
}

function AdminLoginUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-5 py-12">
      <Card className="w-full max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-[#182238]">Admin sign-in is unavailable</h1>
        <p className="mt-3 text-[#71839e]">Please refresh the page and try again.</p>
        <Button className="mt-6" onClick={onRetry}>Retry</Button>
      </Card>
    </main>
  );
}

export function AdminLoginPage() {
  const { data, isError, isLoading, refetch } = useAdminLoginPageQuery();

  if (isLoading) {
    return <AdminLoginSkeleton />;
  }

  if (isError || !data) {
    return <AdminLoginUnavailable onRetry={() => void refetch()} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#f7f9fc] px-5 py-8 text-[#1f2a40] sm:px-8 sm:py-12">
      <section className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="mb-8 text-center sm:mb-9">
          <img
            alt={data.brand.logoAlt}
            className="mx-auto h-auto w-[200px] max-w-full mix-blend-multiply"
            src={data.brand.logoUrl}
          />
        </div>
        <AdminLoginForm content={data} />
      </section>
      <p className="mt-8 text-center text-[13px] text-[#9badc5] sm:mt-9">{data.footer}</p>
    </main>
  );
}
