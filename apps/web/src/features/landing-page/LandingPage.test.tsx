import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';
import { describe, expect, it } from 'vitest';
import { branchBookingHref, BranchesSection, HeroSection } from './LandingPage';

describe('BranchesSection', () => {
  it('renders the supporting eyebrow before the semantic Branches heading without changing branch cards', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter><PublicLanguageProvider>
        <BranchesSection
          branches={[{
            name: 'Psa Chas Branch', hoursDays: 'Monday - Sunday', hoursTime: '8:00 AM - 7:00 PM',
            imageAlt: 'Psa Chas Branch', imageUrl: '', phones: ['069 978 997'],
          }]}
          eyebrow="Our locations"
        />
      </PublicLanguageProvider></MemoryRouter>,
    );

    expect(html.indexOf('Our locations')).toBeLessThan(html.indexOf('<h2'));
    expect(html).toContain('<h2');
    expect(html).toContain('>Branches</h2>');
    expect(html).toContain('Psa Chas Branch');
    expect(html).toContain('aria-label="View Psa Chas Branch"');
    expect(html).toContain('href="/branches"');
  });
});

describe('HeroSection', () => {
  it('loads only the initially visible hero eagerly', () => {
    const hero = {
      address: 'Street 1',
      appointmentLabel: 'Book Appointment',
      branchSlug: 'psa-chas',
      callLabel: 'Call Us',
      imageAlt: 'Clinic',
      imageUrl: '/clinic.jpg',
      locationLabel: 'Location',
      phones: ['012 345 678'],
      qrImageUrl: '',
      qrLabel: 'Clinic information',
    };
    const html = renderToStaticMarkup(
      <MemoryRouter><PublicLanguageProvider><HeroSection heroes={[hero, { ...hero, address: 'Street 2', branchSlug: 'toul-tompoung', imageUrl: '/clinic-2.jpg' }]} /></PublicLanguageProvider></MemoryRouter>,
    );

    expect(html).toContain('fetchPriority="high"');
    expect(html.match(/loading="eager"/g)).toHaveLength(1);
    expect(html.match(/loading="lazy"/g)).toHaveLength(1);
    expect(branchBookingHref('toul-tompoung')).toBe('/book-appointment?branch=toul-tompoung');
  });
});
