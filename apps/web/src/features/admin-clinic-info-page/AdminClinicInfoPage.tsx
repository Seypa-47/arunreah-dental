import { useState, useMemo, useRef, type ChangeEvent } from 'react';
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

export function AdminClinicInfoPage({
  initialTab = 'clinic',
}: {
  initialTab?: 'clinic' | 'branches' | 'contact';
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'clinic' | 'branches' | 'contact'>(initialTab);
  const { data, isLoading } = useAdminClinicInfoPageQuery();

  const updateInfoMutation = useUpdateClinicInfoMutation();
  const updateBranchMutation = useUpdateBranchMutation();
  const updateContactMutation = useUpdateContactSettingsMutation();

  // Tab 1 state: Clinic Information
  const [generalInfo, setGeneralInfo] = useState<ClinicGeneralInfo>({
    clinicName: 'Arunreah Dental Clinic',
    days: 'Mon - Sun',
    email: 'info@arunreahdental.com',
    endTime: '07:00 PM',
    faviconUrl: '/assets/landing/footer-logo-cropped.png',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
    shortDescription:
      'Providing medical luxury dental care with a focus on precision, comfort, and professional excellence.',
    startTime: '08:00 AM',
    tagline: 'Healthy smiles for a better life.',
    website: 'https://arunreahdental.com',
  });

  // Tab 2 state: Branches
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('toul-tompoung');
  const [branchSearch, setBranchSearch] = useState('');
  const [branchStatusFilter, setBranchStatusFilter] = useState('All');

  // Tab 3 state: Contact Settings
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    backupChannel: 'Telegram',
    contactFormErrorText: 'Something went wrong. Please try again later.',
    contactFormSectionTitle: 'Send Us a Message',
    contactFormSubmitLabel: 'Send Message',
    contactFormSuccessText: 'Thank you! Your message has been sent successfully.',
    contactPageShortDesc:
      "We'd love to hear from you. Reach out to us for appointments, inquiries, or any questions about our dental care services.",
    emailCardTitle: 'Email',
    enableContactForm: true,
    enableEmailNotifications: true,
    enableTelegramNotifications: true,
    eyebrow: 'GET IN TOUCH',
    facebookUrl: 'https://facebook.com/arunreahdental',
    googleMapsEmbed: 'https://maps.app.goo.gl/abc123xyz',
    heading: 'Contact Arunreah Dental Clinic',
    instagramUrl: 'https://instagram.com/arunreah.dental',
    mainEmail: 'info@arunreahdental.com',
    mainPhone: '069 978 997',
    openingHoursCardTitle: 'Opening Hours',
    phoneCardTitle: 'Phone',
    recipientEmail: 'info@arunreahdental.com',
    secondaryPhone: '061 978 997',
    showBranchQuickLinks: true,
    showMapOnContactPage: true,
    socialCardTitle: 'Social',
    supportEmail: 'support@arunreahdental.com',
    supportNote:
      'Our team is available Monday to Sunday, 8:00 AM - 7:00 PM. We usually respond within business hours.',
    telegramLink: 'https://t.me/arunreahdental',
    websiteDomain: 'https://arunreahdental.com',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync initial query data
  useMemo(() => {
    if (data) {
      setGeneralInfo(data.generalInfo);
      setBranches(data.branches);
      setContactSettings(data.contactSettings);
      if (data.branches[0] && !selectedBranchId) {
        setSelectedBranchId(data.branches[0].id);
      }
    }
  }, [data, selectedBranchId]);

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || branches[0] || null;
  }, [branches, selectedBranchId]);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        !branchSearch.trim() ||
        `${b.name} ${b.address} ${b.city} ${b.phone1}`
          .toLowerCase()
          .includes(branchSearch.toLowerCase());
      const matchesStatus =
        branchStatusFilter === 'All' || b.status === branchStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [branches, branchSearch, branchStatusFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveAll = () => {
    if (activeTab === 'clinic') {
      updateInfoMutation.mutate(generalInfo, {
        onSuccess: () => showToast('Clinic Information saved successfully!'),
      });
    } else if (activeTab === 'branches' && selectedBranch) {
      updateBranchMutation.mutate(selectedBranch, {
        onSuccess: () => showToast('Branch details saved successfully!'),
      });
    } else if (activeTab === 'contact') {
      updateContactMutation.mutate(contactSettings, {
        onSuccess: () => showToast('Contact settings saved successfully!'),
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
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const branchPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) callback(e.target.result as string);
    };
    reader.readAsDataURL(file);
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
                        Clinic Name <span className="text-[#ef4444]">*</span>
                      </label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, clinicName: e.target.value }))
                        }
                        type="text"
                        value={generalInfo.clinicName}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Tagline / Slogan
                      </label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, tagline: e.target.value }))
                        }
                        type="text"
                        value={generalInfo.tagline}
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[13px] font-bold text-[#182238]">
                        Short Description <span className="text-[#ef4444]">*</span>
                      </label>
                      <span className="text-[11px] text-[#8a9bb2]">
                        {generalInfo.shortDescription.length}/160
                      </span>
                    </div>
                    <textarea
                      className="mt-1.5 h-24 w-full resize-none rounded-xl border border-[#dce5ef] bg-white p-3.5 text-[13.5px] leading-relaxed text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                      maxLength={160}
                      onChange={(e) =>
                        setGeneralInfo((prev) => ({ ...prev, shortDescription: e.target.value }))
                      }
                      value={generalInfo.shortDescription}
                    />
                  </div>

                  {/* Email & Website */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">Email</label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, email: e.target.value }))
                        }
                        type="email"
                        value={generalInfo.email}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">Website</label>
                      <input
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3.5 text-[14px] text-[#182238] outline-none focus:border-[#2187a8] focus:ring-2 focus:ring-[#d9f0f7]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, website: e.target.value }))
                        }
                        type="url"
                        value={generalInfo.website}
                      />
                    </div>
                  </div>

                  {/* Logo & Favicon Upload Dropzones */}
                  <div className="grid gap-4 sm:grid-cols-2">
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
                              handleImageSelect(e.target.files[0], (url) =>
                                setGeneralInfo((p) => ({ ...p, logoUrl: url })),
                              );
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
                    </div>

                    {/* Favicon Dropzone */}
                    <div>
                      <label className="block text-[13px] font-bold text-[#182238]">Favicon</label>
                      <div
                        className="group mt-1.5 flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b8d6e7] bg-[#f8fbfe] p-4 text-center transition hover:border-[#2187a8]"
                        onClick={() => faviconInputRef.current?.click()}
                      >
                        <input
                          accept="image/*"
                          className="sr-only"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files?.[0])
                              handleImageSelect(e.target.files[0], (url) =>
                                setGeneralInfo((p) => ({ ...p, faviconUrl: url })),
                              );
                          }}
                          ref={faviconInputRef}
                          type="file"
                        />
                        <svg className="size-6 text-[#2187a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                        <p className="mt-2 text-[12.5px] text-[#71839e]">
                          <span className="font-bold text-[#182238]">Click to upload</span>
                        </p>
                        <p className="text-[11px] text-[#9badc5]">PNG, JPG or WEBP (Max. 1MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 2: Business Hours */}
              <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
                <h2 className="text-[18px] font-bold text-[#182238]">Business Hours</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">Days</label>
                    <div className="relative mt-1.5">
                      <select
                        className="h-11 w-full appearance-none rounded-xl border border-[#dce5ef] bg-white px-3.5 pr-8 text-[14px] text-[#182238] outline-none focus:border-[#2187a8]"
                        onChange={(e) =>
                          setGeneralInfo((prev) => ({ ...prev, days: e.target.value }))
                        }
                        value={generalInfo.days}
                      >
                        <option value="Mon - Sun">Mon - Sun</option>
                        <option value="Mon - Fri">Mon - Fri</option>
                        <option value="Mon - Sat">Mon - Sat</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#8a9bb2]">
                        ⌄
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#182238]">Time</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          className="h-11 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13.5px] text-[#182238] outline-none focus:border-[#2187a8]"
                          onChange={(e) =>
                            setGeneralInfo((prev) => ({ ...prev, startTime: e.target.value }))
                          }
                          type="text"
                          value={generalInfo.startTime}
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
                            setGeneralInfo((prev) => ({ ...prev, endTime: e.target.value }))
                          }
                          type="text"
                          value={generalInfo.endTime}
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
                    onClick={() => handleTabChange('branches')}
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
                    onClick={() => {
                      const newId = `branch-${Date.now()}`;
                      const newBranch: ClinicBranch = {
                        address: 'Address details...',
                        badge: 'City Branch',
                        city: 'Phnom Penh',
                        closingTime: '07:00 PM',
                        enableBookButton: true,
                        enableCallButton: true,
                        enableDirectionsButton: true,
                        googleMapsLink: 'https://maps.google.com',
                        heroHeadline: 'New Branch',
                        heroImage: '/assets/landing/hero-clinic.png',
                        heroSubtitle: 'New branch subtitle',
                        id: newId,
                        includeInHeroCarousel: true,
                        locationLabel: 'NEW BRANCH',
                        name: 'New Branch Location',
                        openingDays: 'Mon - Sun',
                        openingTime: '08:00 AM',
                        phone1: '+855 23 000 000',
                        phone2: '',
                        photo: '/assets/landing/branches-clinic.png',
                        showOnBranchesPage: true,
                        showOnHomepageSection: true,
                        status: 'Active',
                        summary: 'Branch summary description.',
                      };
                      setBranches((prev) => [newBranch, ...prev]);
                      setSelectedBranchId(newId);
                    }}
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
                      onChange={(e) => setBranchSearch(e.target.value)}
                      placeholder="Search branches..."
                      type="search"
                      value={branchSearch}
                    />
                  </label>
                  <select
                    className="h-10 rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] text-[#71839e] outline-none"
                    onChange={(e) => setBranchStatusFilter(e.target.value)}
                    value={branchStatusFilter}
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                          src={b.photo}
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
                            <span className="ml-auto inline-flex items-center rounded-md bg-[#f0fdf4] px-2 py-0.5 text-[11px] font-bold text-[#16a34a]">
                              Active
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
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between border-t border-[#f0f4f8] pt-4 text-[13px] text-[#71839e]">
                  <span>Showing 1 to {filteredBranches.length} of {filteredBranches.length} branches</span>
                  <div className="flex items-center gap-1.5">
                    <button className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#8a9bb2]" type="button">‹</button>
                    <span className="grid size-8 place-items-center rounded-lg border border-[#2187a8] bg-[#edf7fb] font-bold text-[#2187a8]">1</span>
                    <button className="grid size-8 place-items-center rounded-lg border border-[#dce5ef] bg-white text-[#8a9bb2]" type="button">›</button>
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
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#182238]">
                      <span>Status</span>
                      <ToggleSwitch
                        checked={selectedBranch.status === 'Active'}
                        onChange={(checked) =>
                          setBranches((prev) =>
                            prev.map((b) =>
                              b.id === selectedBranch.id
                                ? { ...b, status: checked ? 'Active' : 'Inactive' }
                                : b,
                            ),
                          )
                        }
                      />
                      <span className="text-[#16a34a]">{selectedBranch.status}</span>
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
                                    ? { ...b, badge: e.target.value as 'Main Branch' | 'City Branch' }
                                    : b,
                                ),
                              )
                            }
                            type="text"
                            value={selectedBranch.badge}
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
                            checked={selectedBranch.enableCallButton}
                            onChange={(checked) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, enableCallButton: checked } : b,
                                ),
                              )
                            }
                          />
                          <span className="text-[#182238]">Enable &ldquo;Call Now&rdquo; button</span>
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
                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={selectedBranch.enableDirectionsButton}
                            onChange={(checked) =>
                              setBranches((prev) =>
                                prev.map((b) =>
                                  b.id === selectedBranch.id ? { ...b, enableDirectionsButton: checked } : b,
                                ),
                              )
                            }
                          />
                          <span className="text-[#182238]">Enable &ldquo;Get Directions&rdquo; button</span>
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
                            <label className="block text-[12.5px] font-bold text-[#182238]">Hero Image</label>
                            <div className="mt-1 flex items-center gap-3">
                              <img
                                alt="Hero"
                                className="size-12 rounded-xl object-cover"
                                src={selectedBranch.heroImage}
                              />
                              <input
                                accept="image/*"
                                className="sr-only"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  if (e.target.files?.[0])
                                    handleImageSelect(e.target.files[0], (url) =>
                                      setBranches((prev) =>
                                        prev.map((b) =>
                                          b.id === selectedBranch.id ? { ...b, heroImage: url } : b,
                                        ),
                                      ),
                                    );
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
                              src={selectedBranch.photo}
                            />
                            <input
                              accept="image/*"
                              className="sr-only"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                if (e.target.files?.[0])
                                  handleImageSelect(e.target.files[0], (url) =>
                                    setBranches((prev) =>
                                      prev.map((b) =>
                                        b.id === selectedBranch.id ? { ...b, photo: url } : b,
                                      ),
                                    ),
                                  );
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
                        onChange={(e) => setContactSettings((p) => ({ ...p, mainPhone: e.target.value }))}
                        type="text"
                        value={contactSettings.mainPhone}
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
                        onChange={(e) => setContactSettings((p) => ({ ...p, mainEmail: e.target.value }))}
                        type="email"
                        value={contactSettings.mainEmail}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Support / Inquiry Email</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, supportEmail: e.target.value }))}
                        type="email"
                        value={contactSettings.supportEmail}
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
                        onChange={(e) => setContactSettings((p) => ({ ...p, telegramLink: e.target.value }))}
                        type="url"
                        value={contactSettings.telegramLink}
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
                      <label className="block text-[12.5px] font-bold text-[#182238]">Website URL / Domain</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, websiteDomain: e.target.value }))}
                        type="url"
                        value={contactSettings.websiteDomain}
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Inquiry Form Routing */}
                <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">3</span>
                    Inquiry Form Routing
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Recipient Email for Contact Form</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, recipientEmail: e.target.value }))}
                        type="email"
                        value={contactSettings.recipientEmail}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Backup Notification Channel</label>
                      <select
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] bg-white px-3 text-[13px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, backupChannel: e.target.value }))}
                        value={contactSettings.backupChannel}
                      >
                        <option value="Telegram">Telegram</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="SMS">SMS</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-[13px]">
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        checked={contactSettings.enableContactForm}
                        onChange={(checked) => setContactSettings((p) => ({ ...p, enableContactForm: checked }))}
                      />
                      <span className="text-[#182238]">Enable Contact Form on Website</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        checked={contactSettings.enableEmailNotifications}
                        onChange={(checked) => setContactSettings((p) => ({ ...p, enableEmailNotifications: checked }))}
                      />
                      <span className="text-[#182238]">Enable Email Notifications</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        checked={contactSettings.enableTelegramNotifications}
                        onChange={(checked) => setContactSettings((p) => ({ ...p, enableTelegramNotifications: checked }))}
                      />
                      <span className="text-[#182238]">Enable Telegram Notifications</span>
                    </div>
                  </div>
                </div>

                {/* 4 Office Hours Summary */}
                <div className="space-y-3 border-t border-[#f0f4f8] pt-5">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">4</span>
                    Office Hours Summary
                  </h3>
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Contact Page Support Note</label>
                    <textarea
                      className="mt-1 h-20 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]"
                      onChange={(e) => setContactSettings((p) => ({ ...p, supportNote: e.target.value }))}
                      value={contactSettings.supportNote}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Right Card: Contact Page Content */}
            <Card className="rounded-[26px] border-[#e1e8f0] bg-white p-6 sm:p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02)]">
              <h2 className="text-[18px] font-bold text-[#182238]">Contact Page Content</h2>

              <div className="mt-6 space-y-6">
                {/* 1 Section Heading */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">1</span>
                    Section Heading
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Eyebrow Label</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, eyebrow: e.target.value }))}
                        type="text"
                        value={contactSettings.eyebrow}
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#182238]">Main Heading</label>
                      <input
                        className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, heading: e.target.value }))}
                        type="text"
                        value={contactSettings.heading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Short Description</label>
                    <textarea
                      className="mt-1 h-16 w-full resize-none rounded-xl border border-[#dce5ef] p-3 text-[13px] leading-relaxed outline-none focus:border-[#2187a8]"
                      onChange={(e) => setContactSettings((p) => ({ ...p, contactPageShortDesc: e.target.value }))}
                      value={contactSettings.contactPageShortDesc}
                    />
                  </div>
                </div>

                {/* 2 Contact Info Block Labels */}
                <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">2</span>
                    Contact Info Block Labels
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#182238]">Phone Card Title</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-2.5 text-[12.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, phoneCardTitle: e.target.value }))}
                        type="text"
                        value={contactSettings.phoneCardTitle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#182238]">Email Card Title</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-2.5 text-[12.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, emailCardTitle: e.target.value }))}
                        type="text"
                        value={contactSettings.emailCardTitle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#182238]">Social Card Title</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-2.5 text-[12.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, socialCardTitle: e.target.value }))}
                        type="text"
                        value={contactSettings.socialCardTitle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#182238]">Opening Hours Title</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-2.5 text-[12.5px] outline-none focus:border-[#2187a8]"
                        onChange={(e) => setContactSettings((p) => ({ ...p, openingHoursCardTitle: e.target.value }))}
                        type="text"
                        value={contactSettings.openingHoursCardTitle}
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Map & Location Settings */}
                <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">3</span>
                    Map & Location Settings
                  </h3>
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#182238]">Main Google Maps Embed / Link</label>
                    <input
                      className="mt-1 h-10 w-full rounded-xl border border-[#dce5ef] px-3 text-[13.5px] outline-none focus:border-[#2187a8]"
                      onChange={(e) => setContactSettings((p) => ({ ...p, googleMapsEmbed: e.target.value }))}
                      type="url"
                      value={contactSettings.googleMapsEmbed}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-1 text-[13px]">
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        checked={contactSettings.showMapOnContactPage}
                        onChange={(checked) => setContactSettings((p) => ({ ...p, showMapOnContactPage: checked }))}
                      />
                      <span className="text-[#182238]">Show map on Contact Page</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        checked={contactSettings.showBranchQuickLinks}
                        onChange={(checked) => setContactSettings((p) => ({ ...p, showBranchQuickLinks: checked }))}
                      />
                      <span className="text-[#182238]">Show branch quick links</span>
                    </div>
                  </div>
                </div>

                {/* 4 Contact Form Labels */}
                <div className="space-y-4 border-t border-[#f0f4f8] pt-5">
                  <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#2187a8]">
                    <span className="grid size-5 place-items-center rounded-full bg-[#edf7fb] text-xs">4</span>
                    Contact Form Labels
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-bold text-[#182238]">Form Section Title</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-3 text-[13px] outline-none"
                        onChange={(e) => setContactSettings((p) => ({ ...p, contactFormSectionTitle: e.target.value }))}
                        type="text"
                        value={contactSettings.contactFormSectionTitle}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#182238]">Submit Button Label</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-3 text-[13px] outline-none"
                        onChange={(e) => setContactSettings((p) => ({ ...p, contactFormSubmitLabel: e.target.value }))}
                        type="text"
                        value={contactSettings.contactFormSubmitLabel}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#182238]">Success Message Text</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-3 text-[13px] outline-none"
                        onChange={(e) => setContactSettings((p) => ({ ...p, contactFormSuccessText: e.target.value }))}
                        type="text"
                        value={contactSettings.contactFormSuccessText}
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#182238]">Error Message Text</label>
                      <input
                        className="mt-1 h-9 w-full rounded-lg border border-[#dce5ef] px-3 text-[13px] outline-none"
                        onChange={(e) => setContactSettings((p) => ({ ...p, contactFormErrorText: e.target.value }))}
                        type="text"
                        value={contactSettings.contactFormErrorText}
                      />
                    </div>
                  </div>
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
      </main>
    </div>
  );
}
