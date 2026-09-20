import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminServicesPage, ServiceDetails } from './AdminServicesPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AdminServicesContent } from '@/services/admin-services';

const mockServicesContent: AdminServicesContent = {
  brand: { logoAlt: 'Arunreah Dental Clinic', logoUrl: '/logo.png' },
  controls: {
    addLabel: 'Add New Service',
    allCategories: 'All Categories',
    allStatuses: 'All Statuses',
    dateLabel: 'October 24, 2024',
    filterLabel: 'Filters',
    searchPlaceholder: 'Search services...',
  },
  empty: { description: 'Try a different search', title: 'No services found' },
  footer: {
    copyright: '© 2026 Arunreah Dental Clinic',
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  header: {
    subtitle: 'Add, edit and manage all services displayed on the website.',
    title: 'Service Management',
  },
  navigation: [],
  meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
  services: [
    {
      category: 'Restorative',
      createdAt: 'Oct 10, 2024',
      description: 'Permanent and natural-looking solution for replacing missing teeth.',
      descriptionKm: '',
      displayOnHomepage: true,
      featured: true,
      id: 'dental-implants',
      imageAlt: 'Dental implant',
      imageUrl: '/service-implant.png',
      name: 'Dental Implants',
      nameKm: 'ការដាំបង្គោលធ្មេញ',
      order: 1,
      status: 'published',
      updatedAt: 'Oct 20, 2024',
    },
    {
      category: 'Cosmetic',
      createdAt: 'Oct 8, 2024',
      description: 'Professional laser teeth whitening service.',
      descriptionKm: '',
      displayOnHomepage: true,
      featured: false,
      id: 'teeth-whitening',
      imageAlt: 'Teeth whitening',
      imageUrl: '/service-veneer.png',
      name: 'Teeth Whitening',
      nameKm: 'ការធ្វើឱ្យធ្មេញស',
      order: 2,
      status: 'draft',
      updatedAt: 'Oct 18, 2024',
    },
  ],
  table: {
    actions: 'Actions',
    category: 'Category',
    service: 'Service',
    status: 'Status',
    updated: 'Updated',
  },
};

vi.mock('./use-admin-services-page', () => ({
  useAdminServicesPageQuery: () => ({
    data: mockServicesContent,
    isPending: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
  }),
}));

describe('AdminServicesPage', () => {
  const queryClient = new QueryClient();

  const renderPage = () =>
    renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/services']}>
          <AdminServicesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('renders both Edit and Delete buttons for each service in the table', () => {
    const html = renderPage();

    // Verify Edit buttons exist
    expect(html).toContain('aria-label="Edit Dental Implants"');
    expect(html).toContain('aria-label="Edit Teeth Whitening"');

    // Verify Delete buttons exist alongside Edit
    expect(html).toContain('aria-label="Delete Dental Implants"');
    expect(html).toContain('aria-label="Delete Teeth Whitening"');

    // Verify Delete button has danger styling class
    expect(html).toContain('text-[#b42318]');
    expect(html).toContain('hover:bg-[#fef3f2]');
  });

  it('renders ServiceDetails component with Delete Service action button', () => {
    const html = renderToStaticMarkup(
      <ServiceDetails
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        service={mockServicesContent.services[0]!}
      />,
    );

    expect(html).toContain('Delete Service');
    expect(html).toContain('Edit Service');
  });
});
