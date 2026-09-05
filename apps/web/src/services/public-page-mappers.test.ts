import { describe, expect, it } from 'vitest';
import { mapBookingOptions, toLandingDoctor, toLandingService } from './public-page-mappers';
import { publicBookingChrome } from '@/features/public-content/public-page-chrome';

describe('public page mappers', () => {
  it('does not fabricate a CMS image when an API image key is absent', () => {
    expect(toLandingService({ id: 'service-id', slug: 'cleaning', name: 'Cleaning', shortDescription: null, listingThumbnailKey: null, category: null, featured: false }).imageUrl).toBe('');
    expect(toLandingDoctor({ id: 'doctor-id', slug: 'dara', name: 'Dr. Dara', title: null, specialty: null, shortBio: null, photoKey: null, featured: false }).imageUrl).toBe('');
  });

  it('uses public UUIDs for appointment choices and preserves No Preference', () => {
    const content = mapBookingOptions(
      publicBookingChrome(),
      [{ id: 'service-uuid', slug: 'cleaning', name: 'Cleaning', shortDescription: null, listingThumbnailKey: null, category: null, featured: false }],
      [{ id: 'doctor-uuid', slug: 'dara', name: 'Dr. Dara', title: null, specialty: null, shortBio: null, photoKey: null, featured: false }],
      [{ id: 'branch-uuid', slug: 'ttp', name: 'TTP', address: 'Street 1', branchImageKey: null, googleMapsUrl: null, acceptsAppointments: true }],
      { primaryPhone: '012 345 678', primaryEmail: 'clinic@example.com' },
    );

    expect(content.servicesList).toEqual([{ name: 'Cleaning', value: 'service-uuid' }]);
    expect(content.doctors).toEqual([{ name: 'No Preference', value: '' }, { name: 'Dr. Dara', value: 'doctor-uuid' }]);
    expect(content.branches[0]?.id).toBe('branch-uuid');
    expect(content.help.phone).toBe('012 345 678');
  });

  it('excludes branches that do not accept appointment requests', () => {
    const content = mapBookingOptions(publicBookingChrome(), [], [], [{ id: 'branch-uuid', slug: 'closed', name: 'Closed', address: 'Street 1', branchImageKey: null, googleMapsUrl: null, acceptsAppointments: false }]);
    expect(content.branches).toEqual([]);
  });
});
