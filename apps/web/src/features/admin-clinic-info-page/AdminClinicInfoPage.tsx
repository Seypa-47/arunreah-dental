import { useState, useEffect, useMemo, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminBranchListQuery, CreateBranchInput } from '@arunreah/shared';
import { useNavigate } from 'react-router-dom';
import { AdminIcon, AdminSidebar } from '@/components/layout/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useAdminClinicInfoPageQuery,
  useUpdateBranchMutation,
  useUpdateClinicInfoMutation,
  useUpdateContactSettingsMutation,
} from './use-admin-clinic-info-page';
import type {
  ClinicBranch,
  ClinicGeneralInfo,
  ContactSettings,
} from '@/services/admin-clinic-info';
import { toClinicBranch } from '@/services/admin-clinic-info';
import { cmsApi } from '@/services/cms';
import { ApiClientError } from '@/lib/api';
import { invalidateCmsDomain } from '@/services/cms-cache';
import { queryKeys } from '@/lib/query-keys';
import { getPublicMediaUrl, uploadMedia } from '@/services/media';

function ToggleSwitch({
  checked,
  id,
  label,
  onChange,
}: {
  checked: boolean;
  id?: string;
  label?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-label={label ?? 'Toggle switch'}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2187a8] focus:ring-offset-2 ${
        checked ? 'bg-[#2187a8]' : 'bg-[#dce5ef]'
      }`}
      id={id}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

type NewBranchForm = Pick<CreateBranchInput, 'addressEn' | 'addressKm' | 'nameEn' | 'nameKm' | 'phone' | 'slug'>;
type BranchListState = Pick<AdminBranchListQuery, 'limit' | 'order' | 'page' | 'search' | 'sort' | 'status'>;

const emptyNewBranchForm: NewBranchForm = {
  addressEn: '',
  addressKm: '',
  nameEn: '',
  nameKm: '',
  phone: '',
  slug: '',
};

function CreateBranchModal({
  isPending,
  onClose,
  onSubmit,
  open,
}: {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: NewBranchForm) => void;
  open: boolean;
}) {
  const [form, setForm] = useState<NewBranchForm>(emptyNewBranchForm);

  useEffect(() => {
    if (!open) setForm(emptyNewBranchForm);
  }, [open]);

  if (!open) return null;

  const update = (field: keyof NewBranchForm, value: string) => setForm((previous) => ({ ...previous, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog">
      <form className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onSubmit={submit}>
        <div className="flex items-center justify-between border-b border-[#edf2f7] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#182238]">Create Branch</h2>
            <p className="mt-1 text-sm text-[#71839e]">English and Khmer identity and address are both required.</p>
          </div>
          <button aria-label="Close create branch dialog" className="text-xl text-[#71839e]" disabled={isPending} onClick={onClose} type="button">×</button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {([
            ['slug', 'Slug'],
            ['nameEn', 'Branch name (English)'],
            ['nameKm', 'Branch name (Khmer)'],
            ['phone', 'Primary phone'],
          ] as const).map(([field, label]) => (
            <label className="block" key={field}>
              <span className="text-[13px] font-bold text-[#182238]">{label}</span>
              <input className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] px-3 text-sm outline-none focus:border-[#2187a8]" onChange={(event) => update(field, event.target.value)} required type="text" value={form[field]} />
            </label>
          ))}
          <label className="block sm:col-span-2">
            <span className="text-[13px] font-bold text-[#182238]">Address (English)</span>
            <textarea className="mt-1.5 min-h-20 w-full rounded-xl border border-[#dce5ef] p-3 text-sm outline-none focus:border-[#2187a8]" onChange={(event) => update('addressEn', event.target.value)} required value={form.addressEn} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[13px] font-bold text-[#182238]">Address (Khmer)</span>
            <textarea className="mt-1.5 min-h-20 w-full rounded-xl border border-[#dce5ef] p-3 text-sm outline-none focus:border-[#2187a8]" onChange={(event) => update('addressKm', event.target.value)} required value={form.addressKm} />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button disabled={isPending} onClick={onClose} type="button" variant="secondary">Cancel</Button>
          <Button className="bg-[#2187a8] text-white" disabled={isPending} type="submit">{isPending ? 'Creating…' : 'Create draft branch'}</Button>
        </div>
      </form>
    </div>
  );
}

export function AdminClinicInfoPage({
  initialTab = 'clinic',
}: {
  initialTab?: 'clinic' | 'branches' | 'contact';
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'clinic' | 'branches' | 'contact'>(initialTab);
  const { data, isLoading } = useAdminClinicInfoPageQuery();
  const [branchListState, setBranchListState] = useState<BranchListState>({
    limit: 20,
    order: 'asc',
    page: 1,
    sort: 'displayOrder',
  });
  const branchListQuery = useQuery({
    enabled: activeTab === 'branches',
    queryFn: () => cmsApi.branches.list(branchListState),
    queryKey: queryKeys.admin.branches(branchListState),
  });

  const updateInfoMutation = useUpdateClinicInfoMutation();
  const updateBranchMutation = useUpdateBranchMutation();
  const updateContactMutation = useUpdateContactSettingsMutation();
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const createBranchMutation = useMutation({
    mutationFn: (input: NewBranchForm) => cmsApi.branches.create({
      ...input,
      status: 'DRAFT',
      featured: false,
      displayOrder: 0,
      acceptsAppointments: false,
      showOnBranchesPage: false,
      showOnHomepage: false,
      includeInHomepageHero: false,
    }),
    onSuccess: (response) => {
      const branch = toClinicBranch(response.branch);
      setBranches((previous) => [branch, ...previous]);
      setSelectedBranchId(branch.id);
      setIsCreateBranchOpen(false);
      void invalidateCmsDomain(queryClient, 'branches');
      showToast('New branch created as a draft. Complete its details and save.');
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError && error.status === 409
        ? 'That branch slug is already in use. Choose a different URL slug.'
        : 'Unable to create a new branch. Please check the required bilingual fields and try again.';
      showToast(message);
    },
  });
  const deleteBranchMutation = useMutation({
    mutationFn: (id: string) => cmsApi.branches.delete(id),
    onSuccess: (_result, id) => {
      setBranches((previous) => previous.filter((branch) => branch.id !== id));
      setSelectedBranchId('');
      void invalidateCmsDomain(queryClient, 'branches');
      showToast('Branch deleted successfully.');
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiClientError && error.status === 409
        ? 'This branch is referenced by appointment history. Deactivate or unpublish it instead.'
        : 'Unable to delete this branch. Please try again.';
      showToast(message);
    },
  });

  // Tab 1 state: Clinic Information
  const [generalInfo, setGeneralInfo] = useState<ClinicGeneralInfo>({
    clinicNameEn: '',
    clinicNameKm: '',
    taglineEn: '',
    taglineKm: '',
    shortAboutEn: '',
    shortAboutKm: '',
    logoKey: '',
    yearsExperience: '',
    successfulCases: '',
    patientSatisfaction: '',
  });

  // Tab 2 state: Branches
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('toul-tompoung');

  // Tab 3 state: Contact Settings
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    primaryPhone: '',
    secondaryPhone: '',
    primaryEmail: '',
    businessHoursEn: '',
    businessHoursKm: '',
    mainGoogleMapsUrl: '',
    facebookUrl: '',
    telegramUrl: '',
    instagramUrl: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync initial query data
  useEffect(() => {
    if (data) {
      setGeneralInfo(data.generalInfo);
      setContactSettings(data.contactSettings);
      if (activeTab !== 'branches') {
        setBranches(data.branches);
        setSelectedBranchId((current) => current || data.branches[0]?.id || '');
      }
    }
  }, [activeTab, data]);

  useEffect(() => {
    if (!branchListQuery.data) return;
    const mappedBranches = branchListQuery.data.items.map(toClinicBranch);
    setBranches(mappedBranches);
    setSelectedBranchId((current) => current && mappedBranches.some((branch) => branch.id === current)
      ? current
      : mappedBranches[0]?.id || '');
  }, [branchListQuery.data]);

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || branches[0] || null;
  }, [branches, selectedBranchId]);

  const updateBranch = (id: string, patch: Partial<ClinicBranch>) => {
    setBranches((previous) => previous.map((branch) => branch.id === id ? { ...branch, ...patch } : branch));
  };

  const filteredBranches = branches;

  const branchStatusLabel = (status: ClinicBranch['status']) => status.charAt(0) + status.slice(1).toLowerCase();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveAll = () => {
    if (activeTab === 'clinic') {
      updateInfoMutation.mutate(generalInfo, {
        onSuccess: () => showToast('Clinic Information saved successfully!'),
        onError: (error: unknown) => {
          const message = error instanceof ApiClientError && error.status === 403
            ? 'You do not have permission to update clinic information.'
            : 'Unable to save clinic information. Please review the required English and Khmer fields.';
          showToast(message);
        },
      });
    } else if (activeTab === 'branches' && selectedBranch) {
      updateBranchMutation.mutate(selectedBranch, {
        onSuccess: () => showToast('Branch details saved successfully!'),
        onError: (error: unknown) => {
          const message = error instanceof ApiClientError && error.status === 409
            ? 'That branch slug is already in use. Choose a different URL slug.'
            : 'Unable to save branch details. Please review the fields and try again.';
          showToast(message);
        },
      });
    } else if (activeTab === 'contact') {
      updateContactMutation.mutate(contactSettings, {
        onSuccess: () => showToast('Contact settings saved successfully!'),
        onError: (error: unknown) => {
          const message = error instanceof ApiClientError && error.status === 403
            ? 'You do not have permission to update contact settings.'
            : 'Unable to save contact settings. Please review the phone, email, and URL values.';
          showToast(message);
        },
      });
    }
  };

  const handleTabChange = (tab: 'clinic' | 'branches' | 'contact') => {
    setActiveTab(tab);
    if (tab === 'clinic') navigate('/admin/clinic-info');
    else if (tab === 'branches') navigate('/admin/clinic-info/branches');
    else if (tab === 'contact') navigate('/admin/clinic-info/contact');
  };

  // Upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const branchPhotoInputRef = useRef<HTMLInputElement>(null);

  const imageUpload = useMutation({
    mutationFn: ({ category, file }: { category: 'branches' | 'clinic'; file: File }) => uploadMedia(category, file),
    onError: () => showToast('Image upload failed. Use a JPEG, PNG, or WEBP image under 5 MB.'),
  });
  const uploadImage = (file: File, callback: (key: string) => void, category: 'branches' | 'clinic') => {
    imageUpload.mutate({ category, file }, { onSuccess: (media) => callback(media.key) });
  };

  const activeSidebarLabel =
    activeTab === 'clinic'
      ? 'Clinic Settings'
      : activeTab === 'branches'
      ? 'Branches / Locations'
      : 'Contact Settings';

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen bg-[#f6f8fb]">
        <div className="min-w-0 flex-1 p-8">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-[#e2e8f0]" />
          <div className="mt-8 grid gap-7 lg:grid-cols-2">
            <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
            <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      {/* Left Sidebar with Dropdown */}
      <AdminSidebar
        activeLabel={activeSidebarLabel}
        brand={data.brand}
        navigation={data.navigation}
      />

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1440px] w-full">
        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-[14px] font-semibold text-[#15803d] shadow-lg">
            <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                fillRule="evenodd"
              />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.6px] text-[#182238] sm:text-[32px]">
                {activeTab === 'clinic'
                  ? 'Clinic Info Settings'
                  : activeTab === 'branches'
                  ? 'Branches / Locations'
                  : 'Contact Settings'}
              </h1>
              <p className="mt-1 text-[15px] text-[#71839e]">
                {activeTab === 'clinic'
                  ? 'Manage your clinic information, contact details, and branch locations.'
                  : activeTab === 'branches'
                  ? 'Manage branch details, homepage carousel content, and website location information.'
                  : 'Manage website contact details, communication channels, and inquiry form settings.'}
              </p>
            </div>

            {/* Date Badge */}
            <div className="inline-flex h-[44px] items-center gap-2.5 rounded-xl border border-[#dce5ef] bg-white px-4 text-[13.5px] font-medium text-[#71839e] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <AdminIcon className="size-4 text-[#71839e]" name="calendar" />
              <span>{data.header.dateLabel}</span>
            </div>
          </header>

          {/* Tab Navigation */}
          <nav
            aria-label="Clinic Settings Tabs"
            className="mt-6 flex gap-8 border-b border-[#e2e8f0] text-[14.5px] font-semibold"
          >
            <button
              className={`pb-3 transition-colors ${
                activeTab === 'clinic'
                  ? 'border-b-2 border-[#2187a8] font-bold text-[#2187a8]'
                  : 'text-[#71839e] hover:text-[#182238]'
              }`}
              onClick={() => handleTabChange('clinic')}
              type="button"
            >
              Clinic Information
            </button>
            <button
              className={`pb-3 transition-colors ${
                activeTab === 'branches'
                  ? 'border-b-2 border-[#2187a8] font-bold text-[#2187a8]'
                  : 'text-[#71839e] hover:text-[#182238]'
              }`}
              onClick={() => handleTabChange('branches')}
              type="button"
            >
              Branches / Locations
            </button>
            <button
              className={`pb-3 transition-colors ${
                activeTab === 'contact'
                  ? 'border-b-2 border-[#2187a8] font-bold text-[#2187a8]'
                  : 'text-[#71839e] hover:text-[#182238]'
              }`}
              onClick={() => handleTabChange('contact')}
              type="button"
            >
              Contact Settings
            </button>
          </nav>
        </div>

        {/* TAB 1: CLINIC INFORMATION */}
        {activeTab === 'clinic' && (
          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
            {/* Left Column: Clinic Information & Business Hours */}
            <div className="space-y-7">
              {/* Card 1: Clinic Information */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Clinic Information</h2>

                <div className="mt-5 space-y-5">
                  {/* Name & Slogan */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Clinic Name (English) <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, clinicNameEn: e.target.value }))
                        }
                        type="text"
                        value={generalInfo.clinicNameEn}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Clinic Name (Khmer) <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, clinicNameKm: e.target.value }))
                        }
                        type="text"
                        value={generalInfo.clinicNameKm}
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Short About (English)
                      </label>
                      <span className="text-[11px] text-[#8a9bb2]">
                        {generalInfo.shortAboutEn.length}/5000
                      </span>
                    </div>
                    <textarea
                      className="mt-1.5 h-24 w-full resize-none rounded-xl border border-[#dce5ef] bg-white p-3.5 text-[13.5px] leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                      maxLength={5000}
                      onChange={(e) =>
                        setGeneralInfo((prev) => ({ ...prev, shortAboutEn: e.target.value }))
                      }
                      value={generalInfo.shortAboutEn}
                    />
                  </div>

                  {/* Khmer and bilingual tagline fields supported by the clinic settings contract. */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">Short About (Khmer)</label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, shortAboutKm: e.target.value }))
                        }
                        type="text"
                        value={generalInfo.shortAboutKm}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">Tagline (English)</label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, taglineEn: e.target.value }))
                        }
                        type="text"
                        value={generalInfo.taglineEn}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">Tagline (Khmer)</label>
                    <input
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, taglineKm: e.target.value }))}
                      type="text"
                      value={generalInfo.taglineKm}
                    />
                  </div>

                  <div>
                    {/* Logo Dropzone */}
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Logo <span className="text-[#ef4444]">*</span>
                      </label>
                      <div
                        className="group mt-1.5 flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b8d6e7] bg-[#f8fbfe] p-4 text-center transition hover:border-[#2187a8]"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <input
                          accept="image/*"
                          className="sr-only"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files?.[0])
                              uploadImage(e.target.files[0], (key) =>
                                setGeneralInfo((p) => ({ ...p, logoKey: key })), 'clinic');
                          }}
                          ref={logoInputRef}
                          type="file"
                        />
                        <svg className="size-6 text-[#2187a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                        <p className="mt-2 text-[12.5px] text-[#71839e]">
                          <span className="font-bold text-[#182238]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-[11px] text-[#9badc5]">PNG, JPG or WEBP (Max. 2MB)</p>
                      </div>
                      {generalInfo.logoKey && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e1e8f0] p-2">
                          {getPublicMediaUrl(generalInfo.logoKey) && <img alt="Current clinic logo" className="size-10 rounded-lg object-contain" src={getPublicMediaUrl(generalInfo.logoKey)!} />}
                          <span className="min-w-0 truncate text-xs text-[#71839e]">{generalInfo.logoKey}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 2: Business Hours */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Clinic Statistics</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">Years of Experience</label>
                    <div className="relative mt-1.5">
                      <input className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]" min="0" onChange={(e) => setGeneralInfo((prev) => ({ ...prev, yearsExperience: e.target.value }))} type="number" value={generalInfo.yearsExperience} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">Cases and Satisfaction</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13.5px] text-[#182238] outline-none focus:border-[#2187a8]"
                          onChange={(e) =>
                            setGeneralInfo((prev) => ({ ...prev, successfulCases: e.target.value }))
                          }
                          min="0" type="number" value={generalInfo.successfulCases}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[#8a9bb2]">
                          🕒
                        </span>
                      </div>
                      <span className="text-[#8a9bb2]">-</span>
                      <div className="relative flex-1">
                        <input
                          className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13.5px] text-[#182238] outline-none focus:border-[#2187a8]"
                          onChange={(e) =>
                            setGeneralInfo((prev) => ({ ...prev, patientSatisfaction: e.target.value }))
                          }
                          max="100" min="0" type="number" value={generalInfo.patientSatisfaction}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[#8a9bb2]">
                          🕒
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Our Branches Summary List */}
            <div>
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4f8] pb-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#182238]">Our Branches</h2>
                    <p className="text-[13px] text-[#71839e]">
                      Manage all clinic branch locations.
                    </p>
                  </div>
                  <Button
                    className="h-10 rounded-xl bg-[#2187a8] px-4 text-[13.5px] font-bold text-white shadow-xs hover:bg-[#1a718c]"
                    icon={<span className="text-base font-bold">+</span>}
                    onClick={() => {
                      setIsCreateBranchOpen(true);
                      handleTabChange('branches');
                    }}
                  >
                    Add New Branch
                  </Button>
                </div>

                {/* Branches Table */}
                <div className="mt-4 divide-y divide-[#f0f4f8]">
                  {branches.map((b) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-4 py-4 text-[13.5px]"
                      key={b.id}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf7fb] text-[#2187a8]">
                          <AdminIcon className="size-4" name="shield" />
                        </div>
                        <div>
                          <span className="block font-bold text-[#182238]">{b.name}</span>
                          <span className="mt-0.5 block max-w-xs text-[12px] leading-relaxed text-[#71839e]">
                            {b.address}
                          </span>
                        </div>
                      </div>

                      <div className="text-[12.5px] text-[#71839e]">
                        <span className="block font-medium text-[#182238]">{b.phone1}</span>
                        <span className="block text-[#8a9bb2]">{b.phone2}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-[11px] font-bold text-[#16a34a] ring-1 ring-[#bbf7d0]">
                          Active
                        </span>
                        <button
                          className="grid size-8 place-items-center rounded-lg text-[#71839e] hover:bg-[#f4f8fb] hover:text-[#2187a8]"
                          onClick={() => {
                            setSelectedBranchId(b.id);
                            handleTabChange('branches');
                          }}
                          title="Edit branch"
                          type="button"
                        >
                          ✎
                        </button>
                        <button
                          className="grid size-8 place-items-center rounded-lg text-[#71839e] hover:bg-[#f4f8fb]"
                          title="More options"
                          type="button"
                        >
                          ⁝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between border-t border-[#f0f4f8] pt-4 text-[13px] text-[#71839e]">
                  <span>Showing 1 to {branches.length} of {branches.length} branches</span>
                  <div className="flex items-center gap-1.5">
                    <button className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#8a9bb2]" type="button">
                      ‹
                    </button>
                    <span className="grid size-8 place-items-center rounded-lg border border-[#2187a8] bg-[#edf7fb] font-bold text-[#2187a8]">
                      1
                    </span>
                    <button className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#8a9bb2]" type="button">
                      ›
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: BRANCHES / LOCATIONS */}
        {activeTab === 'branches' && (
          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.45fr)]">
            {/* Left: Branch Directory */}
            <div>
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4f8] pb-5">
                  <h2 className="text-[18px] font-bold text-[#182238]">Branch Directory</h2>
                  <Button
                    className="h-10 rounded-xl bg-[#2187a8] px-4 text-[13.5px] font-bold text-white shadow-xs hover:bg-[#1a718c]"
                    icon={<span className="text-base font-bold">+</span>}
                    disabled={createBranchMutation.isPending}
                    onClick={() => setIsCreateBranchOpen(true)}
                  >
                    Add New Branch
                  </Button>
                </div>

                {/* Filters */}
                <div className="mt-4 flex gap-3">
                  <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-3 text-[13.5px] text-[#9badc5] focus-within:border-[#2187a8]">
                    <AdminIcon className="size-3.5 text-[#9badc5]" name="search" />
                    <input
                      className="w-full bg-transparent text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                      onChange={(e) => setBranchListState((previous) => ({
                        ...previous,
                        page: 1,
                        search: e.target.value || undefined,
                      }))}
                      placeholder="Search branches..."
                      type="search"
                      value={branchListState.search ?? ''}
                    />
                  </label>
                  <select
                    className="h-10 rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] text-[#71839e] outline-none"
                    onChange={(e) => setBranchListState((previous) => ({
                      ...previous,
                      page: 1,
                      status: e.target.value === 'ALL' ? undefined : e.target.value as AdminBranchListQuery['status'],
                    }))}
                    value={branchListState.status ?? 'ALL'}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <select
                    aria-label="Sort branches"
                    className="h-10 rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] text-[#71839e] outline-none"
                    onChange={(e) => setBranchListState((previous) => ({
                      ...previous,
                      page: 1,
                      sort: e.target.value as AdminBranchListQuery['sort'],
                    }))}
                    value={branchListState.sort}
                  >
                    <option value="displayOrder">Display order</option>
                    <option value="name">Name</option>
                    <option value="createdAt">Created date</option>
                    <option value="updatedAt">Updated date</option>
                  </select>
                  <button
                    aria-label={`Sort ${branchListState.order === 'asc' ? 'descending' : 'ascending'}`}
                    className="h-10 rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] font-bold text-[#71839e] hover:bg-[#f8fafc]"
                    onClick={() => setBranchListState((previous) => ({
                      ...previous,
                      order: previous.order === 'asc' ? 'desc' : 'asc',
                      page: 1,
                    }))}
                    type="button"
                  >
                    {branchListState.order === 'asc' ? '↑' : '↓'}
                  </button>
                </div>

                {/* Branch Cards List */}
                <div className="mt-5 space-y-3.5">
                  {filteredBranches.map((b) => {
                    const isSelected = b.id === selectedBranch?.id;
                    return (
                      <div
                        className={`group relative flex cursor-pointer gap-3.5 rounded-2xl border p-4 transition ${
                          isSelected
                            ? 'border-[#2187a8] bg-[#f0f7fa] shadow-xs ring-1 ring-[#2187a8]'
                            : 'border-[#e2e8f0] bg-white hover:border-[#b8d6e7]'
                        }`}
                        key={b.id}
                        onClick={() => setSelectedBranchId(b.id)}
                      >
                        {/* Drag dots */}
                        <div className="flex items-center text-[#cbd5e1]">
                          <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="7" cy="6" r="1.5" />
                            <circle cx="13" cy="6" r="1.5" />
                            <circle cx="7" cy="10" r="1.5" />
                            <circle cx="13" cy="10" r="1.5" />
                            <circle cx="7" cy="14" r="1.5" />
                            <circle cx="13" cy="14" r="1.5" />
                          </svg>
                        </div>

                        {/* Photo */}
                        <img
                          alt={b.name}
                          className="size-20 shrink-0 rounded-xl object-cover shadow-xs"
                          src={getPublicMediaUrl(b.photo) ?? '/assets/landing/branch-card-clinic.png'}
                        />

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-[15px] font-bold text-[#182238]">{b.name}</h3>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                b.badge === 'Main Branch'
                                  ? 'bg-[#fffbeb] text-[#d97706]'
                                  : 'bg-[#eff6ff] text-[#2563eb]'
                              }`}
                            >
                              {b.badge}
                            </span>
                            <span
                              className={`ml-auto inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                b.status === 'PUBLISHED'
                                  ? 'bg-[#f0fdf4] text-[#16a34a]'
                                  : b.status === 'ARCHIVED'
                                  ? 'bg-[#f1f5f9] text-[#64748b]'
                                  : 'bg-[#fffbeb] text-[#b45309]'
                              }`}
                            >
                              {branchStatusLabel(b.status)}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#71839e]">
                            📍 {b.address}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11.5px] text-[#8a9bb2]">
                            <span>📞 {b.phone1} {b.phone2 ? `• ${b.phone2}` : ''}</span>
                            <span>🕒 {b.openingDays} • {b.openingTime} - {b.closingTime}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {branchListQuery.isLoading && (
                    <p className="rounded-xl border border-dashed border-[#dce5ef] p-5 text-center text-sm text-[#71839e]">Loading branches…</p>
                  )}
                  {branchListQuery.isError && (
                    <div className="rounded-xl border border-[#fecaca] bg-[#fff7f7] p-4 text-sm text-[#b91c1c]">
                      Unable to load branches. <button className="font-bold underline" onClick={() => void branchListQuery.refetch()} type="button">Try again</button>
                    </div>
                  )}
                  {!branchListQuery.isLoading && !branchListQuery.isError && filteredBranches.length === 0 && (
                    <p className="rounded-xl border border-dashed border-[#dce5ef] p-5 text-center text-sm text-[#71839e]">No branches match these filters.</p>
                  )}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between border-t border-[#f0f4f8] pt-4 text-[13px] text-[#71839e]">
                  <span>
                    Showing {filteredBranches.length > 0 ? ((branchListQuery.data?.meta.page ?? 1) - 1) * (branchListQuery.data?.meta.limit ?? 20) + 1 : 0}
                    {' '}to {((branchListQuery.data?.meta.page ?? 1) - 1) * (branchListQuery.data?.meta.limit ?? 20) + filteredBranches.length}
                    {' '}of {branchListQuery.data?.meta.total ?? 0} branches
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label="Previous page"
                      className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#8a9bb2] disabled:opacity-40"
                      disabled={(branchListQuery.data?.meta.page ?? 1) <= 1}
                      onClick={() => setBranchListState((previous) => ({ ...previous, page: Math.max(1, (branchListQuery.data?.meta.page ?? 1) - 1) }))}
                      type="button"
                    >‹</button>
                    <span className="rounded-lg border border-[#2187a8] bg-[#edf7fb] px-2 py-1 font-bold text-[#2187a8]">
                      Page {branchListQuery.data?.meta.page ?? 1} of {Math.max(1, branchListQuery.data?.meta.totalPages ?? 0)}
                    </span>
                    <button
                      aria-label="Next page"
                      className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#8a9bb2] disabled:opacity-40"
                      disabled={(branchListQuery.data?.meta.page ?? 1) >= Math.max(1, branchListQuery.data?.meta.totalPages ?? 0)}
                      onClick={() => setBranchListState((previous) => ({ ...previous, page: Math.min(Math.max(1, branchListQuery.data?.meta.totalPages ?? 0), (branchListQuery.data?.meta.page ?? 1) + 1) }))}
                      type="button"
                    >›</button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Edit Branch */}
            {selectedBranch && (
              <div>
                <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                  {/* Card Header with Status Toggle */}
                  <div className="flex items-center justify-between border-b border-[#f0f4f8] pb-4">
                    <h2 className="text-[18px] font-bold text-[#182238]">Edit Branch</h2>
                    <div className="flex items-center gap-4 text-[13px] font-bold text-[#182238]">
                      <Button
                        className="border border-[#fecaca] bg-white px-3 text-xs text-[#b91c1c] hover:bg-[#fff1f2]"
                        disabled={deleteBranchMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`Delete ${selectedBranch.name}? This cannot be undone.`)) {
                            deleteBranchMutation.mutate(selectedBranch.id);
                          }
                        }}
                        type="button"
                        variant="secondary"
                      >
                        {deleteBranchMutation.isPending ? 'Deleting…' : 'Delete'}
                      </Button>
                      <div className="flex items-center gap-2">
                      <span>Status</span>
                      <ToggleSwitch
                        checked={selectedBranch.status === 'PUBLISHED'}
                        onChange={(checked) =>
                          setBranches((prev) =>
                            prev.map((b) =>
                              b.id === selectedBranch.id
                                ? { ...b, status: checked ? 'PUBLISHED' : 'DRAFT' }
                                : b,
                            ),
                          )
                        }
                      />
                      <span className={selectedBranch.status === 'PUBLISHED' ? 'text-[#16a34a]' : 'text-[#b45309]'}>{branchStatusLabel(selectedBranch.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-7">
                    {/* Section 1: Basic Information */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                        <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">1</span>
                        Basic Information
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">Branch Label / Badge</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id
                                    ? { ...b, badge: e.target.value }
                                    : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.badge}
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">Badge (Khmer)</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) => updateBranch(selectedBranch.id, { badgeKm: e.target.value })}
                            type="text"
                            value={selectedBranch.badgeKm}
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">
                            Branch Name <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, name: e.target.value } : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.name}
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">
                            Branch Name (Khmer) <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) => updateBranch(selectedBranch.id, { nameKm: e.target.value })}
                            required
                            type="text"
                            value={selectedBranch.nameKm}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-[12.5px] font-bold text-[#182238]">
                          URL slug
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] font-normal outline-none focus:border-[#2187a8]"
                            onChange={(e) => updateBranch(selectedBranch.id, { slug: e.target.value.toLowerCase() })}
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            type="text"
                            value={selectedBranch.slug}
                          />
                        </label>
                        <label className="block text-[12.5px] font-bold text-[#182238]">
                          Display order
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] font-normal outline-none focus:border-[#2187a8]"
                            min="0"
                            onChange={(e) => updateBranch(selectedBranch.id, { displayOrder: Number(e.target.value) || 0 })}
                            type="number"
                            value={selectedBranch.displayOrder}
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-[12.5px] font-bold text-[#182238]">
                          Address <span className="text-[#ef4444]">*</span>
                        </label>
                        <textarea
                          className="mt-1 h-16 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] outline-none focus:border-[#2187a8]"
                          onChange={(e) =>
                            setBranches((prev) =>
                              prev.map((b) =>
                                b.id === selectedBranch.id ? { ...b, address: e.target.value } : b,
                              ),
                            )
                          }
                          value={selectedBranch.address}
                        />
                      </div>
                      <div>
                        <label className="block text-[12.5px] font-bold text-[#182238]">
                          Address (Khmer) <span className="text-[#ef4444]">*</span>
                        </label>
                        <textarea
                          className="mt-1 h-16 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] outline-none focus:border-[#2187a8]"
                          onChange={(e) => updateBranch(selectedBranch.id, { addressKm: e.target.value })}
                          required
                          value={selectedBranch.addressKm}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">City / Province</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, city: e.target.value } : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.city}
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">Google Maps Link</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, googleMapsLink: e.target.value } : b,
                                ),
                              )
                            }
                            type="url"
                            value={selectedBranch.googleMapsLink}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Contact & Hours */}
                    <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                      <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                        <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">2</span>
                        Contact & Hours
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">
                            Phone Number 1 <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, phone1: e.target.value } : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.phone1}
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">Phone Number 2</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, phone2: e.target.value } : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.phone2}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-[12px] font-bold text-[#182238]">Opening Days</label>
                          <select
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-2.5 text-[13px] outline-none"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, openingDays: e.target.value } : b,
                                ),
                              )
                            }
                            value={selectedBranch.openingDays}
                          >
                            <option value="Mon - Sun">Mon - Sun</option>
                            <option value="Mon - Sat">Mon - Sat</option>
                            <option value="Mon - Fri">Mon - Fri</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#182238]">Opening Time</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13px] outline-none"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, openingTime: e.target.value } : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.openingTime}
                          />
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-[#182238]">Closing Time</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13px] outline-none"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, closingTime: e.target.value } : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.closingTime}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-[12px] font-bold text-[#182238]">
                          Opening Days (Khmer)
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13px] font-normal outline-none"
                            onChange={(e) => updateBranch(selectedBranch.id, { openingDaysKm: e.target.value })}
                            type="text"
                            value={selectedBranch.openingDaysKm}
                          />
                        </label>
                        <label className="block text-[12px] font-bold text-[#182238]">
                          Opening hours (English)
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13px] font-normal outline-none"
                            onChange={(e) => updateBranch(selectedBranch.id, { openingHours: e.target.value })}
                            type="text"
                            value={selectedBranch.openingHours}
                          />
                        </label>
                        <label className="block text-[12px] font-bold text-[#182238] sm:col-span-2">
                          Opening hours (Khmer)
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13px] font-normal outline-none"
                            onChange={(e) => updateBranch(selectedBranch.id, { openingHoursKm: e.target.value })}
                            type="text"
                            value={selectedBranch.openingHoursKm}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Section 3: Website Display Options */}
                    <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                      <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                        <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">3</span>
                        Website Display Options
                      </h3>

                      <div className="grid gap-3.5 sm:grid-cols-2 text-[13px]">
                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={selectedBranch.showOnBranchesPage}
                            onChange={(checked) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, showOnBranchesPage: checked } : b,
                                ),
                              )
                            }
                          />
                          <span className="text-[#182238]">Show on Branches Page</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={selectedBranch.featured}
                            onChange={(checked) => updateBranch(selectedBranch.id, { featured: checked })}
                          />
                          <span className="text-[#182238]">Featured branch</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={selectedBranch.enableBookButton}
                            onChange={(checked) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, enableBookButton: checked } : b,
                                ),
                              )
                            }
                          />
                          <span className="text-[#182238]">Enable &ldquo;Book at this Branch&rdquo; button</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={selectedBranch.showOnHomepageSection}
                            onChange={(checked) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, showOnHomepageSection: checked } : b,
                                ),
                              )
                            }
                          />
                          <span className="text-[#182238]">Show on Homepage Branch Section</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={selectedBranch.includeInHeroCarousel}
                            onChange={(checked) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, includeInHeroCarousel: checked } : b,
                                ),
                              )
                            }
                          />
                          <span className="text-[#182238]">Include in Homepage Hero Carousel</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Homepage Hero Carousel Content */}
                    <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                      <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                        <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">4</span>
                        Homepage Hero Carousel Content
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">
                            Hero Headline <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, heroHeadline: e.target.value } : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.heroHeadline}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block text-[12.5px] font-bold text-[#182238]">
                            Hero CTA label (English)
                            <input
                              className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] font-normal outline-none focus:border-[#2187a8]"
                              onChange={(e) => updateBranch(selectedBranch.id, { heroCtaLabel: e.target.value })}
                              type="text"
                              value={selectedBranch.heroCtaLabel}
                            />
                          </label>
                          <label className="block text-[12.5px] font-bold text-[#182238]">
                            Hero CTA label (Khmer)
                            <input
                              className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] font-normal outline-none focus:border-[#2187a8]"
                              onChange={(e) => updateBranch(selectedBranch.id, { heroCtaLabelKm: e.target.value })}
                              type="text"
                              value={selectedBranch.heroCtaLabelKm}
                            />
                          </label>
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">Hero Headline (Khmer)</label>
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                            onChange={(e) => updateBranch(selectedBranch.id, { heroHeadlineKm: e.target.value })}
                            type="text"
                            value={selectedBranch.heroHeadlineKm}
                          />
                        </div>

                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">
                            Short Hero Text / Subtitle <span className="text-[#ef4444]">*</span>
                          </label>
                          <textarea
                            className="mt-1 h-14 w-full resize-none rounded-xl border border-[#dce5ef] p-2.5 text-[13px] outline-none focus:border-[#2187a8]"
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, heroSubtitle: e.target.value } : b,
                                ),
                              )
                            }
                            value={selectedBranch.heroSubtitle}
                          />
                        </div>
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">Short Hero Text / Subtitle (Khmer)</label>
                          <textarea
                            className="mt-1 h-14 w-full resize-none rounded-xl border border-[#dce5ef] p-2.5 text-[13px] outline-none focus:border-[#2187a8]"
                            onChange={(e) => updateBranch(selectedBranch.id, { heroSubtitleKm: e.target.value })}
                            value={selectedBranch.heroSubtitleKm}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-[12.5px] font-bold text-[#182238]">
                              Short Location Label <span className="text-[#ef4444]">*</span>
                            </label>
                            <input
                              className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                              onChange={(e) =>
                                setBranches((prev) =>
                                  prev.map((b) =>
                                    b.id === selectedBranch.id ? { ...b, locationLabel: e.target.value } : b,
                                  ),
                                )
                              }
                              type="text"
                              value={selectedBranch.locationLabel}
                            />
                          </div>
                          <div>
                            <label className="block text-[12.5px] font-bold text-[#182238]">Short Location Label (Khmer)</label>
                            <input
                              className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                              onChange={(e) => updateBranch(selectedBranch.id, { locationLabelKm: e.target.value })}
                              type="text"
                              value={selectedBranch.locationLabelKm}
                            />
                          </div>

                          <div>
                            <label className="block text-[12.5px] font-bold text-[#182238]">Hero Image</label>
                            <div className="mt-1 flex items-center gap-3">
                              <img
                                alt="Hero"
                                className="size-12 rounded-xl object-cover"
                                src={getPublicMediaUrl(selectedBranch.heroImage) ?? '/assets/landing/hero-clinic.png'}
                              />
                              <input
                                accept="image/*"
                                className="sr-only"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  if (e.target.files?.[0])
                                    uploadImage(e.target.files[0], (url) =>
                                      setBranches((prev) =>
                                        prev.map((b) =>
                                          b.id === selectedBranch.id ? { ...b, heroImage: url } : b,
                                        ),
                                      ), 'branches');
                                }}
                                ref={heroImageInputRef}
                                type="file"
                              />
                              <Button
                                className="h-9 border border-[#dce5ef] bg-white px-3 text-xs text-[#2187a8]"
                                onClick={() => heroImageInputRef.current?.click()}
                                variant="secondary"
                              >
                                Click to upload
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Branch Page Content */}
                    <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                      <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                        <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">5</span>
                        Branch Page Content
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[12.5px] font-bold text-[#182238]">Branch Photo</label>
                          <div className="mt-1 flex items-center gap-3">
                            <img
                              alt="Branch Photo"
                              className="size-12 rounded-xl object-cover"
                              src={getPublicMediaUrl(selectedBranch.photo) ?? '/assets/landing/branch-card-clinic.png'}
                            />
                            <input
                              accept="image/*"
                              className="sr-only"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                if (e.target.files?.[0])
                                  uploadImage(e.target.files[0], (url) =>
                                    setBranches((prev) =>
                                      prev.map((b) =>
                                        b.id === selectedBranch.id ? { ...b, photo: url } : b,
                                      ),
                                    ), 'branches');
                              }}
                              ref={branchPhotoInputRef}
                              type="file"
                            />
                            <Button
                              className="h-9 border border-[#dce5ef] bg-white px-3 text-xs text-[#2187a8]"
                              onClick={() => branchPhotoInputRef.current?.click()}
                              variant="secondary"
                            >
                              Click to upload
                            </Button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-[12.5px] font-bold text-[#182238]">
                              Short Branch Summary / Notes <span className="text-[#ef4444]">*</span>
                            </label>
                            <span className="text-[11px] text-[#8a9bb2]">
                              {selectedBranch.summary.length}/250
                            </span>
                          </div>
                          <textarea
                            className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-2.5 text-[12.5px] leading-relaxed outline-none focus:border-[#2187a8]"
                            maxLength={250}
                            onChange={(e) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, summary: e.target.value } : b,
                                ),
                              )
                            }
                            value={selectedBranch.summary}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-[12.5px] font-bold text-[#182238]">Short Branch Summary / Notes (Khmer)</label>
                            <span className="text-[11px] text-[#8a9bb2]">{selectedBranch.summaryKm.length}/2000</span>
                          </div>
                          <textarea
                            className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-2.5 text-[12.5px] leading-relaxed outline-none focus:border-[#2187a8]"
                            maxLength={2000}
                            onChange={(e) => updateBranch(selectedBranch.id, { summaryKm: e.target.value })}
                            value={selectedBranch.summaryKm}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTACT SETTINGS */}
        {activeTab === 'contact' && (
          <div className="mt-8 grid gap-7 xl:grid-cols-2">
            {/* Left Card: Website Contact Details */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">Website Contact Details</h2>

              <div className="mt-6 space-y-6">
                {/* 1 Primary Contact */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">1</span>
                    Primary Contact
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Main Phone Number</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, primaryPhone: e.target.value }))}
                        type="text"
                      value={contactSettings.primaryPhone}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Secondary Phone Number</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, secondaryPhone: e.target.value }))}
                        type="text"
                        value={contactSettings.secondaryPhone}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Main Email Address</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, primaryEmail: e.target.value }))}
                        type="email"
                      value={contactSettings.primaryEmail}
                      />
                    </div>
                  </div>
                </div>

                {/* 2 Social Channels */}
                <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">2</span>
                    Social Channels
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Facebook Page URL</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, facebookUrl: e.target.value }))}
                        type="url"
                        value={contactSettings.facebookUrl}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Telegram Link</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, telegramUrl: e.target.value }))}
                        type="url"
                      value={contactSettings.telegramUrl}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Instagram URL (optional)</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, instagramUrl: e.target.value }))}
                        type="url"
                        value={contactSettings.instagramUrl}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Main Google Maps URL</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, mainGoogleMapsUrl: e.target.value }))}
                        type="url"
                      value={contactSettings.mainGoogleMapsUrl}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">Business Hours &amp; Location</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-[12.5px] font-bold text-[#182238]">Business Hours (English)</label>
                  <textarea className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]" maxLength={1000} onChange={(e) => setContactSettings((p) => ({ ...p, businessHoursEn: e.target.value }))} value={contactSettings.businessHoursEn} />
                </div>
                <div>
                  <label className="block text-[12.5px] font-bold text-[#182238]">Business Hours (Khmer)</label>
                  <textarea className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]" maxLength={1000} onChange={(e) => setContactSettings((p) => ({ ...p, businessHoursKm: e.target.value }))} value={contactSettings.businessHoursKm} />
                </div>
                <div>
                  <label className="block text-[12.5px] font-bold text-[#182238]">Main Google Maps URL</label>
                  <input className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]" onChange={(e) => setContactSettings((p) => ({ ...p, mainGoogleMapsUrl: e.target.value }))} type="url" value={contactSettings.mainGoogleMapsUrl} />
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#e2e8f0] bg-[#f6f8fb] py-5">
          <Button
            className="h-11 rounded-xl border border-[#dce5ef] bg-white px-6 text-[14px] font-semibold text-[#71839e] shadow-xs hover:bg-[#f8fafc]"
            onClick={() => navigate('/admin/dashboard')}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            className="flex h-11 items-center gap-2 rounded-xl bg-[#2187a8] px-6 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(33,135,168,0.25)] hover:bg-[#1a718c]"
            onClick={handleSaveAll}
            type="button"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414l-5.293 5.293-2.293-2.293z" />
            </svg>
            <span>Save Changes</span>
          </Button>
        </div>
        </div>
      </main>
      <CreateBranchModal
        isPending={createBranchMutation.isPending}
        onClose={() => setIsCreateBranchOpen(false)}
        onSubmit={(input) => createBranchMutation.mutate(input)}
        open={isCreateBranchOpen}
      />
    </div>
  );
}
