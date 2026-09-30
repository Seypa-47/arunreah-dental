import { AdminListEmpty, AdminListPagination, AdminPublicationStatus } from '@/components/admin/admin-list';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { useState, useEffect, useMemo, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminBranchListQuery, CreateBranchInput } from '@arunreah/shared';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AdminIcon } from '@/components/layout/admin-sidebar';
import { AdminToggle } from '@/components/admin/admin-toggle';
import { imageFrames } from '@/components/admin/image-frames';
import { MediaUploader } from '@/components/admin/media-uploader';
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
import {
  BRANCH_DAY_PRESETS,
  formatPublicBranchSchedules,
  getPresetForDaysEn,
  parseBranchScheduleRows,
  serializeBranchScheduleRows,
} from '@/features/public-content/public-branch';

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
      <form className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6" onSubmit={submit}>
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
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button disabled={isPending} onClick={onClose} type="button" variant="secondary">Cancel</Button>
          <Button className="bg-[#2187a8] text-white" disabled={isPending} type="submit">{isPending ? 'Creating…' : 'Create draft branch'}</Button>
        </div>
      </form>
    </div>
  );
}

export function resolveClinicInfoTab(
  pathname: string,
  fallback: 'clinic' | 'branches' | 'contact' = 'clinic',
): 'clinic' | 'branches' | 'contact' {
  if (pathname === '/admin/clinic-info/branches' || pathname.startsWith('/admin/clinic-info/branches/')) {
    return 'branches';
  }
  if (pathname === '/admin/clinic-info/contact' || pathname.startsWith('/admin/clinic-info/contact/')) {
    return 'contact';
  }
  if (pathname === '/admin/clinic-info' || pathname.startsWith('/admin/clinic-info/')) {
    return 'clinic';
  }
  return fallback;
}

export function selectedBranchIdFromSearch(search: string): string | undefined {
  return new URLSearchParams(search).get('branch') || undefined;
}

export function AdminClinicInfoPage({
  initialTab = 'clinic',
}: {
  initialTab?: 'clinic' | 'branches' | 'contact';
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const resolvedTab = resolveClinicInfoTab(location.pathname, initialTab);
  const requestedBranchId = useMemo(() => selectedBranchIdFromSearch(location.search), [location.search]);
  const [activeTab, setActiveTab] = useState<'clinic' | 'branches' | 'contact'>(resolvedTab);

  useEffect(() => {
    const nextTab = resolveClinicInfoTab(location.pathname, initialTab);
    setActiveTab(nextTab);
  }, [location.pathname, initialTab]);
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
      showToast(message, 'error');
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
      showToast(message, 'error');
    },
  });

  // Tab 1 state: Clinic Information
  const [generalInfo, setGeneralInfo] = useState<ClinicGeneralInfo>(() => data?.generalInfo ?? {
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
  const [branches, setBranches] = useState<ClinicBranch[]>(() => data?.branches ?? []);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => data?.branches[0]?.id || 'toul-tompoung');

  // Tab 3 state: Contact Settings
  const [contactSettings, setContactSettings] = useState<ContactSettings>(() => data?.contactSettings ?? {
    primaryPhone: '',
    secondaryPhone: '',
    primaryEmail: '',
    addressEn: '',
    addressKm: '',
    businessHoursEn: '',
    businessHoursKm: '',
    mainGoogleMapsUrl: '',
    facebookUrl: '',
    telegramUrl: '',
    instagramUrl: '',
  });

  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  // Sync initial query data
  useEffect(() => {
    if (data) {
      setGeneralInfo(data.generalInfo);
      setContactSettings(data.contactSettings);
      setBranches(data.branches);
      setSelectedBranchId((current) =>
        current && data.branches.some((branch) => branch.id === current)
          ? current
          : data.branches[0]?.id || '',
      );
    }
  }, [data]);

  useEffect(() => {
    if (!branchListQuery.data) return;
    const mappedBranches = branchListQuery.data.items.map(toClinicBranch);
    setBranches(mappedBranches);
    setSelectedBranchId((current) => current && mappedBranches.some((branch) => branch.id === current)
      ? current
      : mappedBranches[0]?.id || '');
  }, [branchListQuery.data]);

  useEffect(() => {
    if (requestedBranchId && branches.some((branch) => branch.id === requestedBranchId)) {
      setSelectedBranchId(requestedBranchId);
    }
  }, [branches, requestedBranchId]);

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || branches[0] || null;
  }, [branches, selectedBranchId]);

  const isPrimaryBranchSelected = !selectedBranch || selectedBranch.id === branches[0]?.id;

  const updateBranch = (id: string, patch: Partial<ClinicBranch>) => {
    setBranches((previous) => previous.map((branch) => branch.id === id ? { ...branch, ...patch } : branch));
  };

  const filteredBranches = branches;

  const branchStatusLabel = (status: ClinicBranch['status']) => status.charAt(0) + status.slice(1).toLowerCase();

  const showToast = (message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const isSaving =
    updateInfoMutation.isPending ||
    updateBranchMutation.isPending ||
    updateContactMutation.isPending;

  const isGeneralDirty = useMemo(
    () => Boolean(data && JSON.stringify(generalInfo) !== JSON.stringify(data.generalInfo)),
    [data, generalInfo],
  );
  const isContactDirty = useMemo(
    () => Boolean(data && JSON.stringify(contactSettings) !== JSON.stringify(data.contactSettings)),
    [contactSettings, data],
  );
  const dirtyBranches = useMemo(() => {
    if (!data) return [];
    return branches.filter((branch) => {
      const original = data.branches.find((b) => b.id === branch.id);
      return Boolean(original && JSON.stringify(branch) !== JSON.stringify(original));
    });
  }, [branches, data]);

  const handleSaveAll = () => {
    const effectivePrimaryPhone =
      contactSettings.primaryPhone.trim() ||
      branches[0]?.phone1?.trim() ||
      selectedBranch?.phone1?.trim() ||
      '';
    const nextContactSettings: ContactSettings = {
      ...contactSettings,
      primaryPhone: effectivePrimaryPhone,
    };

    if (activeTab === 'clinic') {
      if (!generalInfo.clinicNameEn.trim() || !generalInfo.clinicNameKm.trim()) {
        showToast('Clinic name in English and Khmer are required.', 'error');
        return;
      }
      if (isContactDirty && nextContactSettings.primaryPhone) {
        updateContactMutation.mutate(nextContactSettings);
      }
      dirtyBranches.forEach((branch) => {
        updateBranchMutation.mutate(branch);
      });
      updateInfoMutation.mutate(generalInfo, {
        onSuccess: () => showToast('Clinic Information saved successfully!', 'success'),
        onError: (error: unknown) => {
          const message = error instanceof ApiClientError && error.status === 403
            ? 'You do not have permission to update clinic information.'
            : 'Unable to save clinic information. Please review the required English and Khmer fields.';
          showToast(message, 'error');
        },
      });
    } else if (activeTab === 'branches' && selectedBranch) {
      if (isGeneralDirty && generalInfo.clinicNameEn.trim() && generalInfo.clinicNameKm.trim()) {
        updateInfoMutation.mutate(generalInfo);
      }
      if (isContactDirty && nextContactSettings.primaryPhone) {
        updateContactMutation.mutate(nextContactSettings);
      }
      const branchesToSave = dirtyBranches.length > 0 ? dirtyBranches : [selectedBranch];
      branchesToSave.forEach((branch, index) => {
        const isLast = index === branchesToSave.length - 1;
        updateBranchMutation.mutate(
          branch,
          isLast
            ? {
                onSuccess: () => showToast('Branch details saved successfully!', 'success'),
                onError: (error: unknown) => {
                  const message = error instanceof ApiClientError && error.status === 409
                    ? 'That branch slug is already in use. Choose a different URL slug.'
                    : 'Unable to save branch details. Please review the fields and try again.';
                  showToast(message, 'error');
                },
              }
            : undefined,
        );
      });
    } else if (activeTab === 'contact') {
      if (selectedBranch && !selectedBranch.phone1.trim() && !nextContactSettings.primaryPhone) {
        showToast('Primary phone number is required.', 'error');
        return;
      }
      if (!selectedBranch && !nextContactSettings.primaryPhone) {
        showToast('Primary phone number is required.', 'error');
        return;
      }
      if (isGeneralDirty && generalInfo.clinicNameEn.trim() && generalInfo.clinicNameKm.trim()) {
        updateInfoMutation.mutate(generalInfo);
      }
      dirtyBranches.forEach((branch) => {
        updateBranchMutation.mutate(branch);
      });
      updateContactMutation.mutate(nextContactSettings, {
        onSuccess: () => showToast('Contact settings saved successfully!', 'success'),
        onError: (error: unknown) => {
          const message = error instanceof ApiClientError && error.status === 403
            ? 'You do not have permission to update contact settings.'
            : error instanceof ApiClientError && error.message
              ? error.message
              : 'Unable to save contact settings. Please review the phone, email, and URL values.';
          showToast(message, 'error');
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

  const imageUpload = useMutation({
    mutationFn: ({ category, file }: { category: 'branches' | 'clinic'; file: File }) => uploadMedia(category, file),
    onError: () => showToast('Image upload failed. Use a JPEG, PNG, or WEBP image under 5 MB.', 'error'),
  });
  const uploadImage = (file: File, callback: (key: string) => void, category: 'branches' | 'clinic') => {
    imageUpload.mutate({ category, file }, { onSuccess: (media) => callback(media.key) });
  };

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


      {/* Main Content Area */}
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1440px] w-full">
        {/* Toast notification */}
        {toast && (
          <div
            role="status"
            className={`fixed top-4 left-4 right-4 z-50 flex max-w-md items-center gap-2.5 rounded-2xl border p-4 text-[14px] font-semibold shadow-lg transition-all sm:top-6 sm:left-auto sm:right-6 ${
              toast.tone === 'error'
                ? 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]'
                : 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]'
            }`}
          >
            {toast.tone === 'error' ? (
              <svg className="size-5 shrink-0 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="size-5 shrink-0 text-[#15803d]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  fillRule="evenodd"
                />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <AdminPageHeading />
            </div>

            {/* Date Badge */}

          </header>

          {/* Tab Navigation */}
          <nav
            aria-label="Clinic Settings Tabs"
            className="mt-6 flex gap-5 overflow-x-auto whitespace-nowrap border-b border-[#e2e8f0] text-[14.5px] font-semibold sm:gap-8"
          >
            <button
              aria-current={activeTab === 'clinic' ? 'page' : undefined}
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
              aria-current={activeTab === 'branches' ? 'page' : undefined}
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
              aria-current={activeTab === 'contact' ? 'page' : undefined}
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
                        className="group relative mt-1.5 flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b8d6e7] bg-[#f8fbfe] p-4 text-center transition hover:border-[#2187a8]"
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

              {/* Card 2: Clinical Experience */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)] sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#182238]">Years of Experience</h2>
                    <p className="mt-1 text-[13px] text-[#71839e]">
                      The clinic&apos;s established track record and heritage featured as the core trust metric.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef7fb] px-3 py-1 text-[11.5px] font-extrabold text-[#087b9f]">
                    Primary Trust Anchor
                  </span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">
                      Clinical Experience (Years)
                    </label>
                    <div className="relative mt-2">
                      <input
                        className="h-14 w-full rounded-2xl border-2 border-[#dce5ef] bg-[#fcfdfe] pl-5 pr-20 text-[26px] font-black tracking-tight text-[#075d83] outline-none transition focus:border-[#2187a8] focus:bg-white"
                        max="150"
                        min="0"
                        onChange={(e) => setGeneralInfo((prev) => ({ ...prev, yearsExperience: e.target.value }))}
                        placeholder="26"
                        type="number"
                        value={generalInfo.yearsExperience}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[13px] font-extrabold uppercase tracking-wider text-[#087b9f]">
                        Years
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] text-[#71839e]">
                      Displayed prominently on the public About page as the core clinic trust spotlight.
                    </p>
                  </div>

                  <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#cbe4ee] bg-gradient-to-br from-[#f0f8fb] via-[#e6f4f8] to-[#d6eff7] p-5 text-center shadow-sm">
                    <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-white shadow-xs ring-1 ring-[#3695b9]/20">
                      <svg
                        aria-hidden="true"
                        className="size-5 text-[#087b9f]"
                        fill="none"
                        viewBox="0 0 28 28"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="14" cy="11" r="7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                        <path d="M14 7.8l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3 1-2.2z" fill="currentColor" />
                        <path d="M10.2 16.5L8.5 24l5.5-2.8 5.5 2.8-1.7-7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
                      </svg>
                    </div>
                    <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[#087b9f]">
                      Public Web Preview
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span className="text-[38px] font-black leading-none tracking-tight text-[#075d83]">
                        {generalInfo.yearsExperience || '26'}
                      </span>
                      <span className="text-[22px] font-extrabold leading-none text-[#3695b9]">+</span>
                    </div>
                    <p className="mt-1 text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#073f60]">
                      Years of experience
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#506e80]">
                      Dedicated dental care &amp; expertise
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Our Branches Summary List & Primary Contact & Location */}
            <div className="space-y-7">
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
                      <button
                        className="flex items-start gap-3 text-left transition hover:opacity-85"
                        onClick={() => {
                          setSelectedBranchId(b.id);
                          handleTabChange('branches');
                        }}
                        type="button"
                      >
                        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf7fb] text-[#2187a8]">
                          <AdminIcon className="size-4" name="shield" />
                        </div>
                        <div>
                          <span className="block font-bold text-[#182238] hover:text-[#2187a8]">{b.name}</span>
                          <span className="mt-0.5 block max-w-xs text-[12px] leading-relaxed text-[#71839e]">
                            {b.address}
                          </span>
                        </div>
                      </button>

                      <div className="text-[12.5px] text-[#71839e]">
                        <span className="block font-medium text-[#182238]">{b.phone1}</span>
                        <span className="block text-[#8a9bb2]">{b.phone2}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <AdminPublicationStatus status={b.status} />
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
                          className="grid size-8 place-items-center rounded-lg text-[#71839e] hover:bg-[#f4f8fb] hover:text-[#2187a8]"
                          onClick={() => {
                            setSelectedBranchId(b.id);
                            handleTabChange('branches');
                          }}
                          title="Open branch settings"
                          type="button"
                        >
                          ⁝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f4f8] pt-4 text-[13px] text-[#71839e]">
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

              {/* Card 3: Primary Contact & Location (Directly editable on Clinic Settings tab) */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4f8] pb-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#182238]">Primary Contact &amp; Location</h2>
                    <p className="text-[13px] text-[#71839e]">
                      Updates the Contact page, Booking help card, and clinic footer.
                    </p>
                  </div>
                  <Button
                    className="h-9 rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[12.5px] font-bold text-[#2187a8] hover:bg-[#f0f8fb]"
                    onClick={() => handleTabChange('contact')}
                    type="button"
                    variant="secondary"
                  >
                    Social &amp; Map Links →
                  </Button>
                </div>

                {branches.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#e2ebf3] bg-[#f8fbfe] p-2">
                    {branches.map((branch) => {
                      const isSelected = branch.id === selectedBranch?.id;
                      return (
                        <button
                          aria-pressed={isSelected}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-[12.5px] font-bold transition ${
                            isSelected
                              ? 'bg-[#2187a8] text-white shadow-xs'
                              : 'bg-white text-[#526879] hover:bg-[#edf7fb] hover:text-[#2187a8]'
                          }`}
                          key={branch.id}
                          onClick={() => setSelectedBranchId(branch.id)}
                          type="button"
                        >
                          <span>{branch.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">
                        Primary Phone <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedBranch) {
                            updateBranch(selectedBranch.id, { phone1: value });
                          }
                          if (isPrimaryBranchSelected) {
                            setContactSettings((p) => ({ ...p, primaryPhone: value }));
                          }
                        }}
                        type="text"
                        value={
                          selectedBranch
                            ? selectedBranch.phone1 || (isPrimaryBranchSelected ? contactSettings.primaryPhone : '')
                            : contactSettings.primaryPhone
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">
                        Secondary Phone
                      </label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedBranch) {
                            updateBranch(selectedBranch.id, { phone2: value });
                          }
                          if (isPrimaryBranchSelected) {
                            setContactSettings((p) => ({ ...p, secondaryPhone: value }));
                          }
                        }}
                        type="text"
                        value={
                          selectedBranch
                            ? selectedBranch.phone2 || (isPrimaryBranchSelected ? contactSettings.secondaryPhone : '')
                            : contactSettings.secondaryPhone
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">
                        Email Address
                      </label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, primaryEmail: e.target.value }))}
                        type="email"
                        value={contactSettings.primaryEmail}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">
                        Opening Hours (English)
                      </label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedBranch) {
                            updateBranch(selectedBranch.id, { openingHours: value });
                          }
                          if (isPrimaryBranchSelected) {
                            setContactSettings((p) => ({ ...p, businessHoursEn: value }));
                          }
                        }}
                        type="text"
                        value={
                          selectedBranch
                            ? selectedBranch.openingHours ||
                              serializeBranchScheduleRows(parseBranchScheduleRows(selectedBranch)).openingHours ||
                              (isPrimaryBranchSelected ? contactSettings.businessHoursEn : '')
                            : contactSettings.businessHoursEn
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">
                        Location / Address (English)
                      </label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedBranch) {
                            updateBranch(selectedBranch.id, { address: value });
                          }
                          if (isPrimaryBranchSelected) {
                            setContactSettings((p) => ({ ...p, addressEn: value }));
                          }
                        }}
                        type="text"
                        value={
                          selectedBranch
                            ? selectedBranch.address || (isPrimaryBranchSelected ? contactSettings.addressEn : '')
                            : contactSettings.addressEn
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">
                        Location / Address (Khmer)
                      </label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedBranch) {
                            updateBranch(selectedBranch.id, { addressKm: value });
                          }
                          if (isPrimaryBranchSelected) {
                            setContactSettings((p) => ({ ...p, addressKm: value }));
                          }
                        }}
                        type="text"
                        value={
                          selectedBranch
                            ? selectedBranch.addressKm || (isPrimaryBranchSelected ? contactSettings.addressKm : '')
                            : contactSettings.addressKm
                        }
                      />
                    </div>
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
                <div className="admin-list-toolbar mt-4">
                  <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#dce5ef] bg-white px-3 text-[13.5px] text-[#9badc5] transition focus-within:border-[#2187a8] focus-within:ring-2 focus-within:ring-[#2187a8]/20">
                    <AdminIcon className="size-3.5 text-[#9badc5]" name="search" />
                    <input
                      className="w-full bg-transparent text-[#182238] outline-none placeholder:text-[#a9b7c9]"
                      onChange={(e) => setBranchListState((previous) => ({
                        ...previous,
                        page: 1,
                        search: e.target.value || undefined,
                      }))}
                      aria-label="Search branches" placeholder="Search branches..."
                      type="search"
                      value={branchListState.search ?? ''}
                    />
                  </label>
                  <select
                    aria-label="Filter branches by status"
                    className="cursor-pointer h-10 rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] text-[#71839e] outline-none transition focus:border-[#2187a8] focus:ring-2 focus:ring-[#2187a8]/20"
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
                      <button
                        aria-pressed={isSelected}
                        className={`group relative flex w-full gap-3.5 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2187a8] focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'border-[#2187a8] bg-[#f0f7fa] shadow-xs ring-1 ring-[#2187a8]'
                            : 'border-[#e2e8f0] bg-white hover:border-[#b8d6e7]'
                        }`}
                        key={b.id}
                        onClick={() => setSelectedBranchId(b.id)}
                        type="button"
                      >
                        {/* Photo */}
                        <img
                          alt={b.name}
                          className="size-20 shrink-0 rounded-xl object-cover shadow-xs"
                          src={getPublicMediaUrl(b.photo) ?? '/assets/landing/branch-card-clinic.png'}
                        />

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#182238]">{b.name}</span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                b.badge === 'Main Branch'
                                  ? 'bg-[#fffbeb] text-[#d97706]'
                                  : 'bg-[#eff6ff] text-[#2563eb]'
                              }`}
                            >
                              {b.badge}
                            </span>
                            <AdminPublicationStatus status={b.status} />
                          </div>

                          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#71839e]">
                            📍 {b.address}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11.5px] text-[#8a9bb2]">
                            <span>📞 {b.phone1} {b.phone2 ? `• ${b.phone2}` : ''}</span>
                            <span>
                              🕒{' '}
                              {formatPublicBranchSchedules(b)
                                .map((item) => (item.days && item.time ? `${item.days} • ${item.time}` : item.days || item.time))
                                .join(' | ')}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {branchListQuery.isLoading && (
                    <p role="status" className="admin-helper">Loading branches…</p>
                  )}
                  {branchListQuery.isError && (
                    <div role="alert" className="rounded-xl border border-[#fecaca] bg-[#fff7f7] p-4 text-sm text-[#b91c1c]">
                      Unable to load branches. <button className="font-bold underline" onClick={() => void branchListQuery.refetch()} type="button">Try again</button>
                    </div>
                  )}
                  {!branchListQuery.isLoading && !branchListQuery.isError && filteredBranches.length === 0 && (
                    <AdminListEmpty noun="branches" filtered={Boolean(branchListState.search || branchListState.status || (branchListState.page ?? 1) > 1)} onClear={() => setBranchListState((previous) => ({ ...previous, search: undefined, status: undefined, page: 1 }))} />
                  )}
                </div>

                {branchListQuery.data ? <AdminListPagination noun="branches" page={branchListQuery.data.meta.page} totalPages={branchListQuery.data.meta.totalPages} total={branchListQuery.data.meta.total} limit={branchListQuery.data.meta.limit} count={filteredBranches.length} busy={branchListQuery.isFetching} onPageChange={(page) => setBranchListState((previous) => ({ ...previous, page }))} /> : null}
              </Card>
            </div>

            {/* Right: Edit Branch */}
            {selectedBranch && (
              <div>
                <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                  {/* Card Header with Status Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f4f8] pb-4">
                    <h2 className="text-[18px] font-bold text-[#182238]">Edit Branch</h2>
                    <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold text-[#182238] sm:gap-4">
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
                      <AdminToggle
                        checked={selectedBranch.status === 'PUBLISHED'}
                        label="Publication status"
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
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                          <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">2</span>
                          Contact &amp; Hours
                        </h3>
                        <button
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#b8d6e7] bg-[#f4fafe] px-3 text-[12px] font-bold text-[#087b9f] transition hover:bg-[#e3f3fa]"
                          onClick={() => {
                            const currentRows = parseBranchScheduleRows(selectedBranch);
                            const firstDays = currentRows[0]?.daysEn ?? '';
                            const nextDaysEn =
                              firstDays === 'Mon - Fri'
                                ? 'Sat - Sun'
                                : firstDays === 'Mon - Sat'
                                  ? 'Sun'
                                  : 'Sun';
                            const nextPreset = getPresetForDaysEn(nextDaysEn);
                            const nextRows = [
                              ...currentRows,
                              {
                                daysEn: nextDaysEn,
                                daysKm: nextPreset?.km ?? 'អាទិត្យ',
                                openTime: '08:00',
                                closeTime: '17:00',
                              },
                            ];
                            updateBranch(selectedBranch.id, serializeBranchScheduleRows(nextRows));
                          }}
                          type="button"
                        >
                          <span aria-hidden="true" className="text-sm font-black leading-none">+</span>
                          Add Open Day &amp; Hours
                        </button>
                      </div>

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

                      {/* Multi-Schedule Rows */}
                      {(() => {
                        const scheduleRows = parseBranchScheduleRows(selectedBranch);
                        const applyScheduleRows = (nextRows: typeof scheduleRows) => {
                          updateBranch(selectedBranch.id, serializeBranchScheduleRows(nextRows));
                        };

                        return (
                          <div className="space-y-3">
                            {scheduleRows.map((row, rowIndex) => {
                              const hasPreset = BRANCH_DAY_PRESETS.some((preset) => preset.value === row.daysEn);
                              return (
                                <div
                                  className="rounded-2xl border border-[#e2ebf3] bg-[#fafcfe] p-3.5"
                                  key={`schedule-${rowIndex}`}
                                >
                                  {scheduleRows.length > 1 && (
                                    <div className="mb-2.5 flex items-center justify-between border-b border-[#edf2f7] pb-2">
                                      <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#2187a8]">
                                        Schedule {rowIndex + 1}
                                      </span>
                                      <button
                                        className="inline-flex items-center gap-1 rounded-md border border-[#fecaca] bg-white px-2 py-0.5 text-[11px] font-bold text-[#b91c1c] transition hover:bg-[#fff1f2]"
                                        onClick={() => {
                                          const nextRows = scheduleRows.filter((_, idx) => idx !== rowIndex);
                                          applyScheduleRows(nextRows);
                                        }}
                                        type="button"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}

                                  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                                    <div>
                                      <label className="block text-[12px] font-bold text-[#182238]">Opening Days</label>
                                      <select
                                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-2.5 text-[13px] outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextDaysEn = e.target.value;
                                          const preset = getPresetForDaysEn(nextDaysEn);
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex
                                              ? {
                                                  ...item,
                                                  daysEn: nextDaysEn,
                                                  daysKm: preset?.km ?? item.daysKm,
                                                }
                                              : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        value={row.daysEn}
                                      >
                                        {!hasPreset && row.daysEn ? (
                                          <option value={row.daysEn}>{row.daysEn}</option>
                                        ) : null}
                                        {BRANCH_DAY_PRESETS.map((preset) => (
                                          <option key={preset.value} value={preset.value}>
                                            {preset.labelEn}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[12px] font-bold text-[#182238]">
                                        Opening Days (Khmer)
                                      </label>
                                      <input
                                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] font-normal outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex ? { ...item, daysKm: e.target.value } : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        placeholder="ច័ន្ទ - សៅរ៍"
                                        type="text"
                                        value={row.daysKm}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[12px] font-bold text-[#182238]">Opening Time</label>
                                      <input
                                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex ? { ...item, openTime: e.target.value } : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        placeholder="08:00"
                                        type="text"
                                        value={row.openTime}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[12px] font-bold text-[#182238]">Closing Time</label>
                                      <input
                                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex ? { ...item, closeTime: e.target.value } : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        placeholder="18:00"
                                        type="text"
                                        value={row.closeTime}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-[12px] font-bold text-[#182238]">
                          Opening hours (English)
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13px] font-normal outline-none focus:border-[#2187a8]"
                            onChange={(e) => updateBranch(selectedBranch.id, { openingHours: e.target.value })}
                            type="text"
                            value={selectedBranch.openingHours}
                          />
                        </label>
                        <label className="block text-[12px] font-bold text-[#182238]">
                          Opening hours (Khmer)
                          <input
                            className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13px] font-normal outline-none focus:border-[#2187a8]"
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
                        <div>
                          <div className="flex items-center gap-3">
                            <AdminToggle
                              checked={selectedBranch.showOnBranchesPage}
                              label="Show on Branches Page"
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
                          <p className="mt-1 pl-[52px] text-[11.5px] leading-4 text-[#71839e]">Controls whether this branch appears on the public /branches page.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <AdminToggle
                            checked={selectedBranch.featured}
                            label="Featured branch"
                            onChange={(checked) => updateBranch(selectedBranch.id, { featured: checked })}
                          />
                          <span className="text-[#182238]">Featured branch</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <AdminToggle
                            checked={selectedBranch.enableBookButton}
                            label="Enable Book at this Branch button"
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
                        <div>
                          <div className="flex items-center gap-3">
                            <AdminToggle
                              checked={selectedBranch.showOnHomepageSection}
                              label="Show on Homepage Branch Section"
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
                          <p className="mt-1 pl-[52px] text-[11.5px] leading-4 text-[#71839e]">Controls whether this branch appears in the "Branches" card grid on the homepage. Separate from the hero carousel below.</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <AdminToggle
                              checked={selectedBranch.includeInHeroCarousel}
                              label="Include in Homepage Hero Carousel"
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
                          <p className="mt-1 pl-[52px] text-[11.5px] leading-4 text-[#71839e]">Controls whether this branch appears in the large rotating hero banner at the top of the homepage.</p>
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

                          <div className="sm:col-span-2">
                            <MediaUploader
                              category="branches"
                              framing={{
                                frames: imageFrames.branchHero,
                                onChange: (heroImagePresentation) => updateBranch(selectedBranch.id, { heroImagePresentation }),
                                value: selectedBranch.heroImagePresentation,
                              }}
                              help="Shown in the homepage hero carousel. Use a wide, high quality landscape photo."
                              key={`hero-${selectedBranch.id}`}
                              label="Hero image"
                              onClear={() => updateBranch(selectedBranch.id, { heroImage: '' })}
                              onUploaded={(heroImage) => updateBranch(selectedBranch.id, { heroImage })}
                              value={selectedBranch.heroImage || undefined}
                            />
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
                        <div className="sm:col-span-2">
                          <MediaUploader
                            category="branches"
                            framing={{
                              frames: imageFrames.branchPhoto,
                              onChange: (photoImagePresentation) => updateBranch(selectedBranch.id, { photoImagePresentation }),
                              value: selectedBranch.photoImagePresentation,
                            }}
                            help="Shown on the branches page, the homepage branch card and the contact page."
                            key={`photo-${selectedBranch.id}`}
                            label="Branch photo"
                            onClear={() => updateBranch(selectedBranch.id, { photo: '' })}
                            onUploaded={(photo) => updateBranch(selectedBranch.id, { photo })}
                            value={selectedBranch.photo || undefined}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-[12.5px] font-bold text-[#182238]">
                              Short Branch Summary / Notes <span className="text-[#ef4444]">*</span>
                            </label>
                            <span className="text-[11px] text-[#8a9bb2]">
                              {(selectedBranch.summary ?? '').length}/250
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
                            value={selectedBranch.summary ?? ''}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-[12.5px] font-bold text-[#182238]">Short Branch Summary / Notes (Khmer)</label>
                            <span className="text-[11px] text-[#8a9bb2]">{(selectedBranch.summaryKm ?? '').length}/2000</span>
                          </div>
                          <textarea
                            className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-2.5 text-[12.5px] leading-relaxed outline-none focus:border-[#2187a8]"
                            maxLength={2000}
                            onChange={(e) => updateBranch(selectedBranch.id, { summaryKm: e.target.value })}
                            value={selectedBranch.summaryKm ?? ''}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Inside Our Clinic Gallery (About Page) */}
                    <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                          <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">6</span>
                          Inside Our Clinic Gallery (About Page)
                        </h3>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-[11px] font-bold text-[#16a34a] ring-1 ring-[#bbf7d0]">
                          Active on About page
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-[#71839e]">
                        The photo gallery under &ldquo;A look inside our clinic&rdquo; on the public About page displays this location's clinic tour. Each branch has its own dedicated 4-photo showcase in the CMS.
                      </p>

                      <div className="rounded-2xl border border-[#dce8ee] bg-[#f8fbfe] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1687aa]">
                              Connected Showcase
                            </span>
                            <h4 className="mt-0.5 text-[14px] font-bold text-[#182238]">
                              {selectedBranch.slug === 'psa-chas'
                                ? 'What To Expect During Your First Visit - Psa Chas Branch'
                                : 'What To Expect During Your First Visit - Toul Tompoung Branch'}
                            </h4>
                            <p className="text-[12px] text-[#71839e]">
                              Category: Clinic Experience • 4 photos
                            </p>
                          </div>
                          <Link
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#096b89] bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-[#096b89] shadow-xs transition hover:bg-[#edf7fb]"
                            to={
                              selectedBranch.slug === 'psa-chas'
                                ? '/admin/showcase/50000000-0000-4000-8000-000000000004/edit'
                                : '/admin/showcase/50000000-0000-4000-8000-000000000003/edit'
                            }
                          >
                            <span>Edit in Showcases</span>
                            <span aria-hidden="true">↗</span>
                          </Link>
                        </div>

                        {/* Thumbnail Previews */}
                        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                          {(selectedBranch.slug === 'psa-chas'
                            ? [
                                { label: 'Exterior', url: '/assets/landing/psa-chas-exterior.jpg' },
                                { label: 'Reception', url: '/assets/landing/psa-chas-reception.jpg' },
                                { label: 'Waiting Lounge', url: '/assets/landing/psa-chas-waiting-area.jpg' },
                                { label: 'Lounge / Consult', url: '/assets/landing/psa-chas-consultation-lounge.jpg' },
                              ]
                            : [
                                { label: 'Exterior', url: '/assets/landing/branches-clinic.png' },
                                { label: 'Reception', url: '/assets/landing/hero-clinic.png' },
                                { label: 'Waiting Area', url: '/assets/landing/showcase-room.png' },
                                { label: 'Treatment Room', url: '/assets/landing/branch-card-clinic.png' },
                              ]
                          ).map((thumb) => (
                            <div className="overflow-hidden rounded-xl border border-[#dce8ee] bg-white text-center shadow-xs" key={thumb.label}>
                              <img alt={thumb.label} className="h-16 w-full object-cover" src={thumb.url} />
                              <span className="block truncate px-1 py-1 text-[10.5px] font-semibold text-[#5a7184]">{thumb.label}</span>
                            </div>
                          ))}
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
          <div className="mt-8 space-y-7">
            {/* Branch Switcher for Contact Settings */}
            {branches.length > 0 && (
              <Card className="rounded-[24px] border-[#e1e8f0] bg-white p-5 sm:p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#edf7fb] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#087b9f]">
                        Branch Contact Switcher
                      </span>
                      <span className="text-[12px] font-semibold text-[#71839e]">
                        {branches.length} {branches.length === 1 ? 'Branch' : 'Branches'}
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-[17px] font-bold text-[#182238]">
                      Select Branch to Edit Contact &amp; Hours
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-[#71839e]">
                      Switch between branches to manage each location&apos;s phone numbers, address, opening hours, and map link displayed on the Contact Us page.
                    </p>
                  </div>

                  <div
                    aria-label="Select branch for contact settings"
                    className="grid gap-2.5 sm:grid-cols-2 lg:min-w-[440px]"
                    role="tablist"
                  >
                    {branches.map((branch) => {
                      const isSelected = branch.id === selectedBranch?.id;
                      return (
                        <button
                          aria-selected={isSelected}
                          className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                            isSelected
                              ? 'border-[#2187a8] bg-[#f0f7fa] shadow-xs ring-1 ring-[#2187a8]'
                              : 'border-[#dce5ef] bg-white hover:border-[#b8d6e7] hover:bg-[#f8fbfe]'
                          }`}
                          key={branch.id}
                          onClick={() => setSelectedBranchId(branch.id)}
                          role="tab"
                          type="button"
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="text-[13.5px] font-extrabold text-[#182238]">
                              {branch.name}
                            </span>
                            {branch.badge ? (
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold ${
                                  branch.badge === 'Main Branch'
                                    ? 'bg-[#fffbeb] text-[#d97706]'
                                    : 'bg-[#eff6ff] text-[#2563eb]'
                                }`}
                              >
                                {branch.badge}
                              </span>
                            ) : null}
                          </div>
                          <span className="mt-1 text-[11.5px] font-semibold text-[#2187a8]">
                            📞 {branch.phone1 || 'No phone set'}{branch.phone2 ? ` • ${branch.phone2}` : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            <div className="grid gap-7 xl:grid-cols-2">
              {/* Left Card: Website Contact Details */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[18px] font-bold text-[#182238]">Website Contact Details</h2>
                  {selectedBranch && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7fb] px-3 py-1 text-[12px] font-bold text-[#087b9f]">
                      <span className="size-1.5 rounded-full bg-[#2187a8]" />
                      {selectedBranch.name}
                    </span>
                  )}
                </div>

                <div className="mt-6 space-y-6">
                  {/* 1 Primary Contact */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                      <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">1</span>
                      Primary Contact {selectedBranch ? `(${selectedBranch.name})` : ''}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[12.5px] font-bold text-[#182238]">Main Phone Number</label>
                        <input
                          className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (selectedBranch) {
                              updateBranch(selectedBranch.id, { phone1: value });
                            }
                            if (isPrimaryBranchSelected) {
                              setContactSettings((p) => ({ ...p, primaryPhone: value }));
                            }
                          }}
                          type="text"
                          value={
                            selectedBranch
                              ? selectedBranch.phone1 || (isPrimaryBranchSelected ? contactSettings.primaryPhone : '')
                              : contactSettings.primaryPhone
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-[12.5px] font-bold text-[#182238]">Secondary Phone Number</label>
                        <input
                          className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (selectedBranch) {
                              updateBranch(selectedBranch.id, { phone2: value });
                            }
                            if (isPrimaryBranchSelected) {
                              setContactSettings((p) => ({ ...p, secondaryPhone: value }));
                            }
                          }}
                          type="text"
                          value={
                            selectedBranch
                              ? selectedBranch.phone2 || (isPrimaryBranchSelected ? contactSettings.secondaryPhone : '')
                              : contactSettings.secondaryPhone
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
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
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[18px] font-bold text-[#182238]">Business Hours &amp; Location</h2>
                  {selectedBranch && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7fb] px-3 py-1 text-[12px] font-bold text-[#087b9f]">
                      <span className="size-1.5 rounded-full bg-[#2187a8]" />
                      {selectedBranch.name}
                    </span>
                  )}
                </div>
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Address (English)</label>
                    <textarea
                      className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]"
                      maxLength={1000}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (selectedBranch) {
                          updateBranch(selectedBranch.id, { address: value });
                        }
                        if (isPrimaryBranchSelected) {
                          setContactSettings((p) => ({ ...p, addressEn: value }));
                        }
                      }}
                      value={
                        selectedBranch
                          ? selectedBranch.address || (isPrimaryBranchSelected ? contactSettings.addressEn : '')
                          : contactSettings.addressEn
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Address (Khmer)</label>
                    <textarea
                      className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]"
                      maxLength={1000}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (selectedBranch) {
                          updateBranch(selectedBranch.id, { addressKm: value });
                        }
                        if (isPrimaryBranchSelected) {
                          setContactSettings((p) => ({ ...p, addressKm: value }));
                        }
                      }}
                      value={
                        selectedBranch
                          ? selectedBranch.addressKm || (isPrimaryBranchSelected ? contactSettings.addressKm : '')
                          : contactSettings.addressKm
                      }
                    />
                  </div>

                  {selectedBranch && (
                    <div className="space-y-3 border-t border-[#f0f4f8] pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[12.5px] font-bold text-[#182238]">
                          Branch Open Days &amp; Hours Schedule
                        </span>
                        <button
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#b8d6e7] bg-[#f4fafe] px-3 text-[12px] font-bold text-[#087b9f] transition hover:bg-[#e3f3fa]"
                          onClick={() => {
                            const currentRows = parseBranchScheduleRows(selectedBranch);
                            const firstDays = currentRows[0]?.daysEn ?? '';
                            const nextDaysEn =
                              firstDays === 'Mon - Fri'
                                ? 'Sat - Sun'
                                : firstDays === 'Mon - Sat'
                                  ? 'Sun'
                                  : 'Sun';
                            const nextPreset = getPresetForDaysEn(nextDaysEn);
                            const nextRows = [
                              ...currentRows,
                              {
                                daysEn: nextDaysEn,
                                daysKm: nextPreset?.km ?? 'អាទិត្យ',
                                openTime: '08:00',
                                closeTime: '17:00',
                              },
                            ];
                            const serialized = serializeBranchScheduleRows(nextRows);
                            updateBranch(selectedBranch.id, serialized);
                            if (isPrimaryBranchSelected) {
                              setContactSettings((p) => ({
                                ...p,
                                businessHoursEn: serialized.openingHours,
                                businessHoursKm: serialized.openingHoursKm,
                              }));
                            }
                          }}
                          type="button"
                        >
                          <span aria-hidden="true" className="text-sm font-black leading-none">+</span>
                          Add Open Day &amp; Hours
                        </button>
                      </div>

                      {(() => {
                        const scheduleRows = parseBranchScheduleRows(selectedBranch);
                        const applyScheduleRows = (nextRows: typeof scheduleRows) => {
                          const serialized = serializeBranchScheduleRows(nextRows);
                          updateBranch(selectedBranch.id, serialized);
                          if (isPrimaryBranchSelected) {
                            setContactSettings((p) => ({
                              ...p,
                              businessHoursEn: serialized.openingHours,
                              businessHoursKm: serialized.openingHoursKm,
                            }));
                          }
                        };

                        return (
                          <div className="space-y-2.5">
                            {scheduleRows.map((row, rowIndex) => {
                              const hasPreset = BRANCH_DAY_PRESETS.some((preset) => preset.value === row.daysEn);
                              return (
                                <div
                                  className="rounded-2xl border border-[#e2ebf3] bg-[#fafcfe] p-3"
                                  key={`contact-schedule-${rowIndex}`}
                                >
                                  {scheduleRows.length > 1 && (
                                    <div className="mb-2 flex items-center justify-between border-b border-[#edf2f7] pb-1.5">
                                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2187a8]">
                                        Schedule {rowIndex + 1}
                                      </span>
                                      <button
                                        className="inline-flex items-center gap-1 rounded-md border border-[#fecaca] bg-white px-2 py-0.5 text-[11px] font-bold text-[#b91c1c] transition hover:bg-[#fff1f2]"
                                        onClick={() => {
                                          const nextRows = scheduleRows.filter((_, idx) => idx !== rowIndex);
                                          applyScheduleRows(nextRows);
                                        }}
                                        type="button"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                  <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-4">
                                    <div>
                                      <label className="block text-[11.5px] font-bold text-[#182238]">Opening Days</label>
                                      <select
                                        className="mt-1 h-9 w-full rounded-xl border border-[#dce5ef] bg-white px-2 text-[12.5px] outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextDaysEn = e.target.value;
                                          const preset = getPresetForDaysEn(nextDaysEn);
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex
                                              ? {
                                                  ...item,
                                                  daysEn: nextDaysEn,
                                                  daysKm: preset?.km ?? item.daysKm,
                                                }
                                              : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        value={row.daysEn}
                                      >
                                        {!hasPreset && row.daysEn ? (
                                          <option value={row.daysEn}>{row.daysEn}</option>
                                        ) : null}
                                        {BRANCH_DAY_PRESETS.map((preset) => (
                                          <option key={preset.value} value={preset.value}>
                                            {preset.labelEn}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[11.5px] font-bold text-[#182238]">Days (Khmer)</label>
                                      <input
                                        className="mt-1 h-9 w-full rounded-xl border border-[#dce5ef] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex ? { ...item, daysKm: e.target.value } : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        type="text"
                                        value={row.daysKm}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11.5px] font-bold text-[#182238]">Open Time</label>
                                      <input
                                        className="mt-1 h-9 w-full rounded-xl border border-[#dce5ef] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex ? { ...item, openTime: e.target.value } : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        type="text"
                                        value={row.openTime}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11.5px] font-bold text-[#182238]">Close Time</label>
                                      <input
                                        className="mt-1 h-9 w-full rounded-xl border border-[#dce5ef] bg-white px-2.5 text-[12.5px] outline-none focus:border-[#2187a8]"
                                        onChange={(e) => {
                                          const nextRows = scheduleRows.map((item, idx) =>
                                            idx === rowIndex ? { ...item, closeTime: e.target.value } : item,
                                          );
                                          applyScheduleRows(nextRows);
                                        }}
                                        type="text"
                                        value={row.closeTime}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Business Hours (English)</label>
                    <textarea
                      className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]"
                      maxLength={1000}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (selectedBranch) {
                          updateBranch(selectedBranch.id, { openingHours: value });
                        }
                        if (isPrimaryBranchSelected) {
                          setContactSettings((p) => ({ ...p, businessHoursEn: value }));
                        }
                      }}
                      value={
                        selectedBranch
                          ? selectedBranch.openingHours ||
                            serializeBranchScheduleRows(parseBranchScheduleRows(selectedBranch)).openingHours ||
                            (isPrimaryBranchSelected ? contactSettings.businessHoursEn : '')
                          : contactSettings.businessHoursEn
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Business Hours (Khmer)</label>
                    <textarea
                      className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]"
                      maxLength={1000}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (selectedBranch) {
                          updateBranch(selectedBranch.id, { openingHoursKm: value });
                        }
                        if (isPrimaryBranchSelected) {
                          setContactSettings((p) => ({ ...p, businessHoursKm: value }));
                        }
                      }}
                      value={
                        selectedBranch
                          ? selectedBranch.openingHoursKm ||
                            serializeBranchScheduleRows(parseBranchScheduleRows(selectedBranch)).openingHoursKm ||
                            (isPrimaryBranchSelected ? contactSettings.businessHoursKm : '')
                          : contactSettings.businessHoursKm
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Main Google Maps URL</label>
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (selectedBranch) {
                          updateBranch(selectedBranch.id, { googleMapsLink: value });
                        }
                        if (isPrimaryBranchSelected) {
                          setContactSettings((p) => ({ ...p, mainGoogleMapsUrl: value }));
                        }
                      }}
                      type="url"
                      value={
                        selectedBranch
                          ? selectedBranch.googleMapsLink ||
                            (isPrimaryBranchSelected ? contactSettings.mainGoogleMapsUrl : '')
                          : contactSettings.mainGoogleMapsUrl
                      }
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-[#e2e8f0] bg-[#f6f8fb] py-5">
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
            disabled={isSaving}
            onClick={handleSaveAll}
            type="button"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l6-6a1 1 0 00-1.414-1.414l-5.293 5.293-2.293-2.293z" />
            </svg>
            <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
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
