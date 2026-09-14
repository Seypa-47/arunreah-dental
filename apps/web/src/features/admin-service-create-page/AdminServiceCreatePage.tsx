import {
  AdminBilingualFields,
  AdminField,
  AdminFormActions,
  AdminFormSection,
  focusFirstInvalid,
} from '@/components/admin/admin-form';
import { MediaUploader } from '@/components/admin/media-uploader';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { Button } from '@/components/ui/button';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type FieldName = 'name' | 'nameKm';

export function AdminServiceCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState('');
  const [nameKm, setNameKm] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryKm, setSummaryKm] = useState('');
  const [imageKey, setImageKey] = useState<string>();
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const create = useMutation({
    mutationFn: () =>
      cmsApi.services.create({
        slug: slugify(slug || name),
        status,
        featured: false,
        displayOrder: 0,
        nameEn: name,
        nameKm,
        summaryEn: summary || null,
        summaryKm: summaryKm || null,
        imageKey: imageKey ?? null,
        category: category || null,
        detailPresentation: 'STANDARD',
        benefits: [],
        detailSections: [],
        relatedServiceIds: [],
      }),
    onSuccess: async (result) => {
      await invalidateCmsDomain(queryClient, 'services');
      navigate(`/admin/services/${result.service.id}/edit`);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<FieldName, string>> = {};
    if (!name.trim()) nextErrors.name = 'Enter the English service name.';
    if (!nameKm.trim()) nextErrors.nameKm = 'Enter the Khmer service name.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstInvalid(formRef);
      return;
    }
    create.mutate();
  };

  const inputState = (field: FieldName) => ({
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    'aria-invalid': Boolean(errors[field]),
  });

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="max-w-3xl">
          <AdminPageHeading />
          <p className="admin-description">
            Start with the public listing details. You can add the full service page content after creating the draft.
          </p>
        </header>

        <form className="admin-stack mt-7" noValidate onSubmit={submit} ref={formRef}>
          <AdminFormSection description="Use a short, recognizable name in both website languages." title="Basic information">
            <AdminBilingualFields>
              <AdminField error={errors.name} htmlFor="name" label="Service name · English" required>
                <input
                  id="name"
                  onChange={(event) => {
                    setName(event.target.value);
                    setErrors((current) => ({ ...current, name: undefined }));
                  }}
                  value={name}
                  {...inputState('name')}
                />
              </AdminField>
              <AdminField error={errors.nameKm} htmlFor="nameKm" label="ឈ្មោះសេវា · ខ្មែរ" required>
                <input
                  id="nameKm"
                  lang="km"
                  onChange={(event) => {
                    setNameKm(event.target.value);
                    setErrors((current) => ({ ...current, nameKm: undefined }));
                  }}
                  value={nameKm}
                  {...inputState('nameKm')}
                />
              </AdminField>
            </AdminBilingualFields>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <AdminField help="Leave blank to create it from the English name." htmlFor="slug" label="URL slug" optional>
                <input id="slug" onChange={(event) => setSlug(event.target.value)} placeholder="dental-implants" value={slug} />
              </AdminField>
              <AdminField htmlFor="category" label="Category" optional>
                <input id="category" onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Restorative dentistry" value={category} />
              </AdminField>
            </div>
          </AdminFormSection>

          <AdminFormSection description="These short descriptions appear where the service is introduced in a list or card." title="Listing content">
            <AdminBilingualFields>
              <AdminField htmlFor="summary" label="Short description · English" optional>
                <textarea id="summary" maxLength={1000} onChange={(event) => setSummary(event.target.value)} value={summary} />
              </AdminField>
              <AdminField htmlFor="summaryKm" label="ពិពណ៌នាខ្លី · ខ្មែរ" optional>
                <textarea id="summaryKm" lang="km" maxLength={1000} onChange={(event) => setSummaryKm(event.target.value)} value={summaryKm} />
              </AdminField>
            </AdminBilingualFields>
          </AdminFormSection>

          <AdminFormSection description="A card image is optional at this stage and can be changed later." title="Image and publishing">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <MediaUploader category="services" help="Choose a clear representative image for the service. JPEG, PNG, or WEBP up to 5 MB." label="Service image" onClear={() => setImageKey('')} onUploaded={setImageKey} value={imageKey} />
              <AdminField htmlFor="status" label="Initial status">
                <select id="status" onChange={(event) => setStatus(event.target.value as 'DRAFT' | 'PUBLISHED')} value={status}>
                  <option value="DRAFT">Save as draft</option>
                  <option value="PUBLISHED">Publish now</option>
                </select>
              </AdminField>
            </div>
          </AdminFormSection>

          <AdminFormActions
            status={
              create.isPending
                ? 'Creating service…'
                : create.isError
                  ? 'Could not create the service. The URL slug may already be in use.'
                  : undefined
            }
          >
            <Button disabled={create.isPending} onClick={() => navigate('/admin/services')} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={create.isPending} type="submit">{create.isPending ? 'Creating…' : 'Create service'}</Button>
          </AdminFormActions>
        </form>
      </div>
    </main>
  );
}
