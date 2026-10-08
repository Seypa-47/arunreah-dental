import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminClinicInfoPage, resolveClinicInfoTab, selectedBranchIdFromSearch } from './AdminClinicInfoPage';

const mockClinicData = {
  generalInfo: {
    clinicNameEn: 'Arunreah Dental Clinic',
    clinicNameKm: 'គ្លីនិកធ្មេញ អរុណរះ',
    taglineEn: 'Trusted care',
    taglineKm: 'ការថែទាំដែលគួរឱ្យទុកចិត្ត',
    shortAboutEn: 'Modern dental clinic',
    shortAboutKm: 'គ្លីនិកធ្មេញទំនើប',
    footerDescriptionEn: 'Trusted care in Phnom Penh',
    footerDescriptionKm: 'ការថែទាំដែលទុកចិត្តបាននៅភ្នំពេញ',
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
    {
      id: 'branch-2',
      slug: 'psa-chas',
      nameEn: 'Psa Chas Branch',
      nameKm: 'សាខាផ្សារចាស់',
      name: 'Psa Chas Branch',
      addressEn: 'Street 13, Daun Penh',
      addressKm: 'ផ្លូវ ១៣ ដូនពេញ',
      address: 'Street 13, Daun Penh',
      phone1: '069 978 997',
      phone2: '061 978 997',
      phone: '069 978 997',
      displayOrder: 2,
      status: 'PUBLISHED' as const,
      featured: false,
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
          total: 2,
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

  it('resolves clinic root route and former contact route to clinic tab', () => {
    expect(resolveClinicInfoTab('/admin/clinic-info')).toBe('clinic');
    expect(resolveClinicInfoTab('/admin/clinic-info/')).toBe('clinic');
    expect(resolveClinicInfoTab('/admin/clinic-info/contact')).toBe('clinic');
    expect(resolveClinicInfoTab('/admin/clinic-info/contact/')).toBe('clinic');
  });

  it('falls back to provided fallback when route is outside clinic-info', () => {
    expect(resolveClinicInfoTab('/admin/dashboard', 'branches')).toBe('branches');
    expect(resolveClinicInfoTab('/admin/dashboard')).toBe('clinic');
  });
});

describe('selectedBranchIdFromSearch', () => {
  it('reads an optional branch id from a branch-editor deep link', () => {
    expect(selectedBranchIdFromSearch('?branch=branch-1')).toBe('branch-1');
    expect(selectedBranchIdFromSearch('?page=2')).toBeUndefined();
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
    expect(html).toContain('Clinic Contact &amp; Socials');
    expect(html).toContain('General Inquiries Email');
    expect(html).toContain('Clinic Hotline / Primary Phone');
    // Other tabs content should not be rendered
    expect(html).not.toContain('Branch Directory');
  });

  it('renders Branches tab content when at /admin/clinic-info/branches', () => {
    const html = renderAt('/admin/clinic-info/branches');
    // Tab active indicator
    expect(html).toMatch(/aria-current="page"[^>]*>Branches \/ Locations<\/button>/);
    // Tab content
    expect(html).toContain('Branch Directory');
    expect(html).toContain('Add New Branch');
    expect(html).toContain('Add Open Day &amp; Hours');
    // Other tabs content should not be rendered
    expect(html).not.toContain('Clinic Contact &amp; Socials');
  });

  it('renders Clinic Information tab content with merged contact settings when at /admin/clinic-info/contact', () => {
    const html = renderAt('/admin/clinic-info/contact');
    // Tab active indicator
    expect(html).toMatch(/aria-current="page"[^>]*>Clinic Information<\/button>/);
    // Merged contact fields are present on clinic info tab
    expect(html).toContain('Clinic Contact &amp; Socials');
    expect(html).toContain('General Inquiries Email');
    expect(html).toContain('Clinic Hotline / Primary Phone');
    expect(html).toContain('Facebook Page URL');
    // Other tabs content should not be rendered
    expect(html).not.toContain('Branch Directory');
  });
});
