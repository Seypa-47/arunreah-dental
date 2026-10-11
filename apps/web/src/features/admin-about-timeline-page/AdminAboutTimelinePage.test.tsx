import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { queryKeys } from '@/lib/query-keys';
import type { AdminAboutTimelineRecord } from '@/services/cms';
import { AdminAboutTimelinePage } from './AdminAboutTimelinePage';

const sampleMilestones: AdminAboutTimelineRecord[] = [
  {
    id: 'milestone-2000',
    year: 2000,
    titleEn: 'Arunreah Dental Clinic begins',
    titleKm: 'គ្លីនិកធ្មេញអរុណរះចាប់ផ្តើម',
    bodyEn: 'Started serving patients in Phnom Penh.',
    bodyKm: 'ចាប់ផ្តើមបម្រើអ្នកជំងឺនៅភ្នំពេញ។',
    status: 'PUBLISHED',
    displayOrder: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'milestone-2003',
    year: 2003,
    titleEn: "Broader general and children's dental care",
    titleKm: 'ពង្រីកការថែទាំធ្មេញទូទៅ និងកុមារ',
    bodyEn: 'Expanded family dentistry services.',
    bodyKm: 'ពង្រីកសេវាកម្មធ្មេញគ្រួសារ។',
    status: 'DRAFT',
    displayOrder: 20,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('AdminAboutTimelinePage', () => {
  it('renders milestones with direct Hide/Publish and Remove buttons on each milestone card', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    queryClient.setQueryData(queryKeys.admin.aboutTimeline(), {
      items: sampleMilestones,
    });

    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/about-timeline']}>
          <AdminAboutTimelinePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(html).toContain('2 total · 1 shown on About page');
    expect(html).toContain('Arunreah Dental Clinic begins');
    expect(html).toContain('Hide 2000 Arunreah Dental Clinic begins');
    expect(html).toContain('Remove 2000 Arunreah Dental Clinic begins');
    expect(html).toContain("Publish 2003 Broader general and children&#x27;s dental care");
    expect(html).toContain("Remove 2003 Broader general and children&#x27;s dental care");
  });
});
