import { describe, expect, it } from 'vitest';
import { mapBookingOptions, mapLandingBranchHero, toLandingDoctor, toLandingService } from './public-page-mappers';
import { publicBookingChrome } from '@/features/public-content/public-page-chrome';

describe('public page mappers', () => {
  it('uses canonical branch contact data for each homepage hero', () => {
    const hero = mapLandingBranchHero({
      acceptsAppointments: true,
      address: '#159c, Street 133',
      badge: null,
      branchImageKey: null,
      cityProvince: 'Phnom Penh',
      closingTime: '16:00',
      featured: false,
      googleMapsUrl: null,
      heroCtaLabel: null,
      heroHeadline: null,
      heroImageKey: null,
      heroSupportingText: null,
      id: 'branch-1',
      includeInHomepageHero: true,
      name: 'Toul Tompoung Branch',
      openingDays: 'Mon - Sat',
      openingHours: 'Monday - Sunday: 8:00 AM - 4:00 PM',
      openingTime: '08:00',
      phone: '061 978 997',
      secondaryPhone: '069 978 997',
      shortLocationLabel: null,
      shortSummary: null,
      showOnHomepage: true,
      slug: 'toul-tompoung',
    }, 'en');

    expect(hero.address).toBe('#159c, Street 133');
    expect(hero.phones).toEqual(['061 978 997', '069 978 997']);
    expect(hero.branchSlug).toBe('toul-tompoung');
  });

  it('does not fabricate a CMS image when an API image key is absent', () => {
    expect(toLandingService({ id: 'service-id', slug: 'cleaning', name: 'Cleaning', shortDescription: null, listingThumbnailKey: null, category: null, featured: false }).imageUrl).toBe('');
    expect(toLandingDoctor({ id: 'doctor-id', slug: 'dara', name: 'Dr. Dara', title: null, specialty: null, shortBio: null, photoKey: null, featured: false }).imageUrl).toBe('');
  });

  it('uses public UUIDs for appointment choices and preserves No Preference', () => {
    const content = mapBookingOptions(
      publicBookingChrome('en'),
      [{ id: 'service-uuid', slug: 'cleaning', name: 'Cleaning', shortDescription: null, listingThumbnailKey: null, category: null, featured: false }],
      [{ id: 'doctor-uuid', slug: 'dara', name: 'Dr. Dara', title: null, specialty: null, shortBio: null, photoKey: null, featured: false }],
      [{
        id: 'branch-uuid',
        slug: 'ttp',
        name: 'TTP',
        address: 'Street 1',
        branchImageKey: null,
        googleMapsUrl: null,
        acceptsAppointments: true,
        openingDays: 'Mon - Sat',
        openingTime: '08:00',
        closingTime: '18:00',
        openingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
      }],
      { primaryPhone: '012 345 678', primaryEmail: 'clinic@example.com' },
    );

    expect(content.servicesList).toEqual([{ name: 'Cleaning', slug: 'cleaning', value: 'service-uuid' }]);
    expect(content.doctors).toEqual([
      { branchIds: [], name: 'No Preference', value: '' },
      { branchIds: [], name: 'Dr. Dara', slug: 'dara', value: 'doctor-uuid' },
    ]);
    expect(content.branches[0]?.id).toBe('branch-uuid');
    expect(content.branches[0]?.slug).toBe('ttp');
    expect(content.branches[0]?.openingDays).toBe('Mon - Sat');
    expect(content.branches[0]?.openingTime).toBe('08:00');
    expect(content.branches[0]?.closingTime).toBe('18:00');
    expect(content.help.phone).toBe('012 345 678');
  });

  it('maps doctor branchIds into booking options doctors list', () => {
    const content = mapBookingOptions(
      publicBookingChrome('en'),
      [],
      [
        {
          id: 'doc-1',
          slug: 'dr-sophea',
          name: 'Dr. Sophea',
          title: 'Orthodontist',
          specialty: 'Orthodontics',
          shortBio: null,
          photoKey: null,
          featured: true,
          branchIds: ['branch-1', 'branch-2'],
        },
      ],
      [],
      { primaryPhone: null, primaryEmail: null },
    );

    expect(content.doctors).toEqual([
      { branchIds: [], name: 'No Preference', value: '' },
      {
        branchIds: ['branch-1', 'branch-2'],
        name: 'Dr. Sophea',
        slug: 'dr-sophea',
        value: 'doc-1',
      },
    ]);
  });

  it('excludes branches that do not accept appointment requests', () => {
    const content = mapBookingOptions(publicBookingChrome('en'), [], [], [{ id: 'branch-uuid', slug: 'closed', name: 'Closed', address: 'Street 1', branchImageKey: null, googleMapsUrl: null, acceptsAppointments: false }]);
    expect(content.branches).toEqual([]);
  });

  it('localizes doctor bookingLabel in Khmer when language is km', () => {
    const doctorKm = toLandingDoctor(
      { id: 'doctor-id', slug: 'dara', name: 'វេជ្ជបណ្ឌិត តារា', title: null, specialty: null, shortBio: null, photoKey: null, featured: false },
      'km',
    );
    expect(doctorKm.bookingLabel).toBe('កក់ជាមួយ វេជ្ជបណ្ឌិត តារា');
  });
});
