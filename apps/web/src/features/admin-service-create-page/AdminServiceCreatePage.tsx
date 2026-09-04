import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MediaUploader } from '@/components/admin/media-uploader';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** A deliberately small creation form; the existing service editor manages the remaining optional CMS fields. */
export function AdminServiceCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [nameKm, setNameKm] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryKm, setSummaryKm] = useState('');
  const [imageKey, setImageKey] = useState<string>();
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const create = useMutation({
    mutationFn: () => cmsApi.services.create({ slug: slugify(slug || name), status, featured: false, displayOrder: 0, nameEn: name, nameKm, summaryEn: summary || null, summaryKm: summaryKm || null, imageKey: imageKey ?? null, category: category || null, benefits: [], relatedServiceIds: [] }),
    onSuccess: async (result) => { await invalidateCmsDomain(queryClient, 'services'); navigate(`/admin/services/${result.service.id}/edit`); },
  });
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate(); };
  return <main className="min-h-screen bg-[#f6f8fb] p-6 sm:p-10"><form className="mx-auto max-w-2xl rounded-3xl border border-[#dce5ef] bg-white p-7 shadow-sm" onSubmit={submit}><h1 className="text-3xl font-bold text-[#182238]">Add New Service</h1><p className="mt-2 text-[#71839e]">Create the basic service record, then complete its bilingual content in the editor.</p>{create.isError ? <p className="mt-4 rounded-xl bg-[#fff1f2] p-3 text-sm text-[#b91c1c]" role="alert">Unable to create the service. The slug may already be in use.</p> : null}<label className="mt-6 block text-sm font-semibold">English name<input className="mt-2 h-11 w-full rounded-xl border p-3" onChange={(event) => setName(event.target.value)} required value={name} /></label><label className="mt-4 block text-sm font-semibold">Khmer name<input className="mt-2 h-11 w-full rounded-xl border p-3" onChange={(event) => setNameKm(event.target.value)} required value={nameKm} /></label><label className="mt-4 block text-sm font-semibold">Slug<input className="mt-2 h-11 w-full rounded-xl border p-3" onChange={(event) => setSlug(event.target.value)} value={slug} /></label><label className="mt-4 block text-sm font-semibold">Category<input className="mt-2 h-11 w-full rounded-xl border p-3" onChange={(event) => setCategory(event.target.value)} value={category} /></label><label className="mt-4 block text-sm font-semibold">English short description<textarea className="mt-2 min-h-24 w-full rounded-xl border p-3" onChange={(event) => setSummary(event.target.value)} value={summary} /></label><label className="mt-4 block text-sm font-semibold">Khmer short description<textarea className="mt-2 min-h-24 w-full rounded-xl border p-3" onChange={(event) => setSummaryKm(event.target.value)} value={summaryKm} /></label><div className="mt-4"><MediaUploader category="services" onUploaded={setImageKey} value={imageKey} /></div><label className="mt-4 block text-sm font-semibold">Status<select className="mt-2 h-11 w-full rounded-xl border p-3" onChange={(event) => setStatus(event.target.value as 'DRAFT' | 'PUBLISHED')} value={status}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label><div className="mt-7 flex justify-end gap-3"><Button onClick={() => navigate('/admin/services')} type="button" variant="secondary">Cancel</Button><Button disabled={create.isPending} type="submit">{create.isPending ? 'Creating…' : 'Create Service'}</Button></div></form></main>;
}
