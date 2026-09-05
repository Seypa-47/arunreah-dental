import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminRole, CreateAdminInput, UpdateAdminInput } from '@arunreah/shared';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ApiClientError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { adminManagementApi, type ManagedAdmin } from '@/services/admin-management';

const brand = { logoAlt: 'Arunreah Dental Clinic', logoUrl: '/assets/landing/footer-logo-cropped.png' };
const roles: AdminRole[] = ['RECEPTIONIST', 'CMS_ADMIN', 'SUPER_ADMIN'];

function safeMessage(error: unknown) {
  if (!(error instanceof ApiClientError)) return 'Unable to complete this request. Please try again.';
  if (error.status === 403) return 'Only a super administrator can manage staff accounts.';
  if (error.status === 409) return error.message;
  return error.message;
}

function CreateAdminForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('RECEPTIONIST');
  const mutation = useMutation({
    mutationFn: (input: CreateAdminInput) => adminManagementApi.create(input),
    onSuccess: () => {
      setName(''); setEmail(''); setPassword(''); setRole('RECEPTIONIST'); onCreated();
    },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ name, email, password, role });
  };
  return <Card className="rounded-2xl border-[#dce5ef] p-5"><h2 className="text-lg font-bold text-[#182238]">Add staff account</h2><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
    <input className="rounded-lg border border-[#dce5ef] px-3 py-2" minLength={1} onChange={(event) => setName(event.target.value)} placeholder="Full name" required value={name} />
    <input className="rounded-lg border border-[#dce5ef] px-3 py-2" onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required type="email" value={email} />
    <input className="rounded-lg border border-[#dce5ef] px-3 py-2" minLength={12} onChange={(event) => setPassword(event.target.value)} placeholder="Initial password (12+ characters)" required type="password" value={password} />
    <select className="rounded-lg border border-[#dce5ef] px-3 py-2" onChange={(event) => setRole(event.target.value as AdminRole)} value={role}>{roles.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select>
    <div className="sm:col-span-2"><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Creating…' : 'Create account'}</Button>{mutation.isError ? <p className="mt-3 text-sm text-red-700" role="alert">{safeMessage(mutation.error)}</p> : null}</div>
  </form></Card>;
}

function AdminRow({ admin, onUpdated }: { admin: ManagedAdmin; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [role, setRole] = useState<AdminRole>(admin.role);
  const mutation = useMutation({
    mutationFn: (input: UpdateAdminInput) => adminManagementApi.update(admin.id, input),
    onSuccess: () => {
      setEditing(false);
      onUpdated();
    },
  });

  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: UpdateAdminInput = {
      ...(name !== admin.name ? { name } : {}),
      ...(email !== admin.email ? { email } : {}),
      ...(role !== admin.role ? { role } : {}),
    };

    if (Object.keys(input).length > 0) mutation.mutate(input);
    else setEditing(false);
  };

  const cancelEdit = () => {
    setName(admin.name);
    setEmail(admin.email);
    setRole(admin.role);
    setEditing(false);
    mutation.reset();
  };

  return <>
    <tr className="border-t border-[#e7edf3]">
      <td className="p-4 font-semibold text-[#182238]">{admin.name}</td>
      <td className="p-4 text-[#52647b]">{admin.email}</td>
      <td className="p-4 text-[#52647b]">{admin.role.replaceAll('_', ' ')}</td>
      <td className="p-4"><span className={`rounded-full px-2 py-1 text-xs font-bold ${admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{admin.isActive ? 'Active' : 'Inactive'}</span></td>
      <td className="p-4"><div className="flex flex-wrap gap-2"><Button disabled={mutation.isPending} onClick={() => mutation.mutate({ isActive: !admin.isActive })} type="button" variant="secondary">{admin.isActive ? 'Deactivate' : 'Activate'}</Button><Button disabled={mutation.isPending} onClick={() => setEditing((current) => !current)} type="button" variant="secondary">Edit</Button></div>{mutation.isError ? <p className="mt-2 text-xs text-red-700" role="alert">{safeMessage(mutation.error)}</p> : null}</td>
    </tr>
    {editing ? <tr className="border-t border-[#e7edf3] bg-[#f7f9fc]"><td className="p-4" colSpan={5}><form className="grid gap-3 md:grid-cols-4" onSubmit={submitEdit}>
      <input className="rounded-lg border border-[#dce5ef] px-3 py-2" onChange={(event) => setName(event.target.value)} required value={name} />
      <input className="rounded-lg border border-[#dce5ef] px-3 py-2" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      <select className="rounded-lg border border-[#dce5ef] px-3 py-2" onChange={(event) => setRole(event.target.value as AdminRole)} value={role}>{roles.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select>
      <div className="flex gap-2"><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Saving…' : 'Save changes'}</Button><Button disabled={mutation.isPending} onClick={cancelEdit} type="button" variant="secondary">Cancel</Button></div>
    </form><p className="mt-2 text-xs text-[#71839e]">Password changes are not available because the current backend does not expose a password-update endpoint.</p></td></tr> : null}
  </>;
}

export function AdminManagementPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.admin.admins(), queryFn: () => adminManagementApi.list() });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins() });
  return <div className="min-h-screen bg-[#f6f8fb] lg:flex"><AdminSidebar activeLabel="Admin Management" brand={brand} navigation={[]} /><main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10"><div className="mx-auto max-w-[1440px]"><header><h1 className="text-3xl font-bold text-[#182238]">Admin Management</h1><p className="mt-1 text-[#71839e]">Manage clinic staff access. Server-side protections prevent unsafe super-admin changes.</p></header><section className="mt-7"><CreateAdminForm onCreated={refresh} /></section><section className="mt-7"><Card className="overflow-x-auto rounded-2xl border-[#dce5ef]"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f7f9fc] text-[#52647b]"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{query.isLoading ? <tr><td className="p-8 text-center text-[#71839e]" colSpan={5}>Loading staff accounts…</td></tr> : query.isError ? <tr><td className="p-8 text-center" colSpan={5}><p className="text-red-700">{safeMessage(query.error)}</p><Button className="mt-3" onClick={() => void query.refetch()} type="button">Retry</Button></td></tr> : query.data?.length ? query.data.map((admin) => <AdminRow admin={admin} key={admin.id} onUpdated={refresh} />) : <tr><td className="p-8 text-center text-[#71839e]" colSpan={5}>No staff accounts found.</td></tr>}</tbody></table></Card></section></div></main></div>;
}
