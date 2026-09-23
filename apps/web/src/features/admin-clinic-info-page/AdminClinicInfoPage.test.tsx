import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminClinicInfoPage, resolveClinicInfoTab } from './AdminClinicInfoPage';

const mockClinicData = {
  generalInfo: {
    clinicNameEn: 'Arunreah Dental Clinic',
    clinicNameKm: 'គ្លីនិកធ្មេញ អរុណរះ',
    taglineEn: 'Trusted care',
    taglineKm: 'ការថែទាំដែលគួរឱ្យទុកចិត្ត',
    shortAboutEn: 'Modern dental clinic',
    shortAboutKm: 'គ្លីនិកធ្មេញទំនើប',
    logoKey: '',
    yearsExperience: '15',
    successfulCases: '10000',
    patientSatisfaction: '99',
  },
  branches: [
    {
      id: 'branch-1',
      slug: 'branch-1',
      nameEn: 'Toul Tompoung Branch',
      nameKm: 'សាខាទួលទំពូង',
      name: 'Toul Tompoung Branch',
      addressEn: 'Street 155',
      addressKm: 'ផ្លូវ ១៥៥',
      address: 'Street 155',
      phone1: '023 123 456',
      phone2: '',
      phone: '023 123 456',
      displayOrder: 1,
      status: 'PUBLISHED' as const,
      featured: true,
      acceptsAppointments: true,
      showOnBranchesPage: true,
      showOnHomepage: true,
      includeInHomepageHero: true,
      descriptionEn: '',
      descriptionKm: '',
      latitude: null,
      longitude: null,
      mapEmbedUrl: '',
      heroImageKey: '',
      photoKeys: [],
    },
  ],
  contactSettings: {
    primaryPhone: '023 123 456',
    secondaryPhone: '',
    primaryEmail: 'contact@arunreah.com',
    addressEn: 'Phnom Penh, Cambodia',
    addressKm: 'ភ្នំពេញ កម្ពុជា',
    businessHoursEn: 'Mon - Sun: 8:00 AM - 7:00 PM',
    businessHoursKm: 'ចន្ទ - អាទិត្យ៖ ៨:០០ ព្រឹក - ៧:០០ យប់',
    mainGoogleMapsUrl: '',
    facebookUrl: 'https://facebook.com/arunreah',
    telegramUrl: 'https://t.me/arunreah',
    instagramUrl: '',
  },
};

vi.mock('./use-admin-clinic-info-page', () => ({
  useAdminClinicInfoPageQuery: () => ({
    data: mockClinicData,
    isLoading: false,
    isError: false,
  }),
  useUpdateClinicInfoMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateBranchMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateContactSettingsMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
    useQuery: () => ({
      data: {
        items: mockClinicData.branches,
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      },
      isLoading: false,
    }),
    useMutation: () => ({ mutate: vi.fn(), isPending: false }),
  };
});

vi.mock('@/features/admin-auth/session-provider', () => ({
  useAdminSession: () => ({ admin: { role: 'CMS_ADMIN' }, isLoggingOut: false, logout: vi.fn() }),
}));

describe('resolveClinicInfoTab', () => {
  it('resolves branches route to branches tab', () => {
    expect(resolveClinicInfoTab('/admin/clinic-info/branches')).toBe('branches');
    expect(resolveClinicInfoTab('/admin/clinic-info/branches/')).toBe('branches');
  });

  it('resolves contact route to contact tab', () => {
    expect(resolveClinicInfoTab('/admin/clinic-info/contact')).toBe('contact');
    expect(resolveClinicInfoTab('/admin/clinic-info/contact/')).toBe('contact');
  });

  it('resolves clinic root route to clinic tab', () => {
    expect(resolveClinicInfoTab('/admin/clinic-info')).toBe('clinic');
    expect(resolveClinicInfoTab('/admin/clinic-info/')).toBe('clinic');
  });

  it('falls back to provided fallback when route is outside clinic-info', () => {
    expect(resolveClinicInfoTab('/admin/dashboard', 'branches')).toBe('branches');
    expect(resolveClinicInfoTab('/admin/dashboard')).toBe('clinic');
  });
});

describe('AdminClinicInfoPage tab synchronisation with router', () => {
  const renderAt = (pathname: string) =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={[pathname]}>
        <AdminClinicInfoPage />
      </MemoryRouter>,
    );

  it('renders Clinic Information tab content when at /admin/clinic-info', () => {
    const html = renderAt('/admin/clinic-info');
    // Tab active indicator
    expect(html).toMatch(/aria-current="page"[^>]*>Clinic Information<\/button>/);
    // Tab content
    expect(html).toContain('Clinic Name (English)');
    expect(html).toContain('Clinic Name (Khmer)');
    // Other tabs content should not be rendered
    expect(html).not.toContain('Branch Directory');
    expect(html).not.toContain('Website Contact Details');
  });

  it('renders Branches tab content when at /admin/clinic-info/branches', () => {
    const html = renderAt('/admin/clinic-info/branches');
    // Tab active indicator
    expect(html).toMatch(/aria-current="page"[^>]*>Branches \/ Locations<\/button>/);
    // Tab content
    expect(html).toContain('Branch Directory');
    expect(html).toContain('Add New Branch');
    // Other tabs content should not be rendered
    expect(html).not.toContain('Clinic identity');
    expect(html).not.toContain('Website Contact Details');
  });

  it('renders Contact Settings tab content when at /admin/clinic-info/contact', () => {
    const html = renderAt('/admin/clinic-info/contact');
    // Tab active indicator
    expect(html).toMatch(/aria-current="page"[^>]*>Contact Settings<\/button>/);
    // Tab content
    expect(html).toContain('Website Contact Details');
    expect(html).toContain('Main Phone Number');
    // Other tabs content should not be rendered
    expect(html).not.toContain('Clinic identity');
    expect(html).not.toContain('Branch Directory');
  });
});
