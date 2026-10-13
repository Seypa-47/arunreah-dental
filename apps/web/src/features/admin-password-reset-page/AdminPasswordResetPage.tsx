import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { env } from '@/config/env';
import { TurnstileWidget } from '@/features/book-appointment-page/turnstile-widget';
import { requestAdminPasswordReset, resetAdminPassword } from '@/services/auth';

const genericMessage =
  'If an active administrator account matches that email, a reset link will be sent shortly.';

function ResetLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f9fc] px-5 py-10 text-[#1f2a40]">
      <img
        alt="Arunreah Dental Clinic"
        className="mb-8 h-auto w-[200px] max-w-full mix-blend-multiply"
        src="/assets/landing/footer-logo-cropped.png"
      />
      <Card className="w-full max-w-[520px] rounded-[34px] border-[#dce5ef] bg-white px-6 py-8 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:px-[44px] sm:py-[42px]">
        {children}
      </Card>
    </main>
  );
}

function Field({
  autoComplete,
  label,
  onChange,
  type = 'text',
  value,
}: {
  autoComplete: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-medium text-[#71839e]">{label}</span>
      <input
        autoComplete={autoComplete}
        className="h-[58px] w-full rounded-xl border border-[#d9e3ee] bg-white px-4 text-[16px] outline-none transition focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20"
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
    </label>
  );
}

function RequestResetForm() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const mutation = useMutation({ mutationFn: (input: Parameters<typeof requestAdminPasswordReset>[0]) => requestAdminPasswordReset(input) });
  const onToken = useCallback((value: string | null) => setToken(value), []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (env.turnstileSiteKey && !token) return;
    mutation.mutate(
      { email, turnstileToken: token ?? undefined },
      { onSettled: () => setResetSignal((value) => value + 1) },
    );
  };

  if (mutation.isSuccess) {
    return (
      <ResetLayout>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-4 leading-7 text-[#64748b]">{mutation.data || genericMessage}</p>
        <Link className="mt-7 inline-block font-semibold text-[#2187a8]" to="/admin/login">
          Return to sign in
        </Link>
      </ResetLayout>
    );
  }

  return (
    <ResetLayout>
      <form onSubmit={submit}>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 leading-6 text-[#71839e]">
          Enter your CMS email address and we will send a secure, expiring reset link.
        </p>
        <div className="mt-7">
          <Field autoComplete="email" label="Email address" onChange={setEmail} type="email" value={email} />
        </div>
        <div className="mt-5">
          <TurnstileWidget
            action="admin_password_reset"
            onToken={onToken}
            resetSignal={resetSignal}
          />
        </div>
        {mutation.isError ? (
          <p className="mt-5 rounded-xl border border-[#ffd5d5] bg-[#fff0f0] px-4 py-3 text-sm text-[#b42318]" role="alert">
            Unable to request a reset link. Please wait a moment and try again.
          </p>
        ) : null}
        <Button className="mt-6 h-[58px] w-full rounded-xl bg-[#2187a8] text-[17px] hover:bg-[#176f8c]" disabled={mutation.isPending || Boolean(env.turnstileSiteKey && !token)} type="submit">
          {mutation.isPending ? 'Sending…' : 'Send reset link'}
        </Button>
        <Link className="mt-6 block text-center font-semibold text-[#2187a8]" to="/admin/login">
          Return to sign in
        </Link>
      </form>
    </ResetLayout>
  );
}

function ConfirmResetForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token] = useState(() => searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: (input: Parameters<typeof resetAdminPassword>[0]) => resetAdminPassword(input) });

  useEffect(() => {
    if (searchParams.has('token')) navigate('/admin/reset-password', { replace: true });
  }, [navigate, searchParams]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 12) {
      setLocalError('Use at least 12 characters.');
      return;
    }
    if (password !== confirmation) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLocalError(null);
    mutation.mutate({ token, password });
  };

  if (mutation.isSuccess) {
    return (
      <ResetLayout>
        <h1 className="text-2xl font-bold">Password updated</h1>
        <p className="mt-4 leading-7 text-[#64748b]">
          Your password was changed and all previous CMS sessions were signed out.
        </p>
        <Link className="mt-7 inline-block font-semibold text-[#2187a8]" to="/admin/login">
          Sign in with your new password
        </Link>
      </ResetLayout>
    );
  }

  return (
    <ResetLayout>
      <form onSubmit={submit}>
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="mt-2 leading-6 text-[#71839e]">Use at least 12 characters.</p>
        <div className="mt-7 space-y-5">
          <Field autoComplete="new-password" label="New password" onChange={setPassword} type="password" value={password} />
          <Field autoComplete="new-password" label="Confirm new password" onChange={setConfirmation} type="password" value={confirmation} />
        </div>
        {localError || mutation.isError || !token ? (
          <p className="mt-5 rounded-xl border border-[#ffd5d5] bg-[#fff0f0] px-4 py-3 text-sm text-[#b42318]" role="alert">
            {!token
              ? 'This reset link is invalid or incomplete.'
              : localError ?? 'This reset link is invalid or has expired.'}
          </p>
        ) : null}
        <Button className="mt-6 h-[58px] w-full rounded-xl bg-[#2187a8] text-[17px] hover:bg-[#176f8c]" disabled={!token || mutation.isPending} type="submit">
          {mutation.isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </ResetLayout>
  );
}

export function AdminForgotPasswordPage() {
  return <RequestResetForm />;
}

export function AdminResetPasswordPage() {
  return <ConfirmResetForm />;
}
