import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BRANCH_COORDINATES,
  PSA_CHAS_COORDINATES,
  PSA_CHAS_SATELLITE_EMBED_URL,
  TOUL_TOMPOUNG_SATELLITE_EMBED_URL,
  getBranchCoordinates,
  getBranchSatelliteEmbedUrl,
} from './branch-coordinates';

describe('getBranchCoordinates', () => {
  it('returns Psa Chas coordinates for Psa Chas names in English and Khmer', () => {
    expect(getBranchCoordinates('Psa Chas Branch')).toEqual(PSA_CHAS_COORDINATES);
    expect(getBranchCoordinates('សាខាផ្សារចាស់')).toEqual(PSA_CHAS_COORDINATES);
    expect(getBranchCoordinates('psa-chas')).toEqual(PSA_CHAS_COORDINATES);
    expect(getBranchCoordinates('phsar-chas')).toEqual(PSA_CHAS_COORDINATES);
    expect(getBranchCoordinates('Arunreah Dental Clinic - Psa Chas')).toEqual(PSA_CHAS_COORDINATES);
  });

  it('returns default TTP coordinates for Toul Tompoung names and unrecognized strings', () => {
    expect(getBranchCoordinates('Toul Tompoung Branch')).toEqual(DEFAULT_BRANCH_COORDINATES);
    expect(getBranchCoordinates('សាខាទួលទំពូង')).toEqual(DEFAULT_BRANCH_COORDINATES);
    expect(getBranchCoordinates('ttp')).toEqual(DEFAULT_BRANCH_COORDINATES);
    expect(getBranchCoordinates('Arunreah Dental Clinic - TTP')).toEqual(DEFAULT_BRANCH_COORDINATES);
    expect(getBranchCoordinates(null)).toEqual(DEFAULT_BRANCH_COORDINATES);
    expect(getBranchCoordinates(undefined)).toEqual(DEFAULT_BRANCH_COORDINATES);
    expect(getBranchCoordinates('')).toEqual(DEFAULT_BRANCH_COORDINATES);
  });

  it('returns official satellite place embed URLs for Toul Tompoung and Psa Chas when no API key is set', () => {
    expect(getBranchSatelliteEmbedUrl({ nameOrSlug: 'Toul Tompoung Branch' })).toBe(
      TOUL_TOMPOUNG_SATELLITE_EMBED_URL,
    );
    expect(getBranchSatelliteEmbedUrl({ nameOrSlug: 'សាខាទួលទំពូង' })).toBe(
      TOUL_TOMPOUNG_SATELLITE_EMBED_URL,
    );
    expect(
      getBranchSatelliteEmbedUrl({
        googleMapsUrl: 'https://maps.app.goo.gl/6HenBVpmvf4PiWwv6',
        nameOrSlug: 'Arunreah Dental Clinic',
      }),
    ).toBe(TOUL_TOMPOUNG_SATELLITE_EMBED_URL);
    expect(getBranchSatelliteEmbedUrl({ nameOrSlug: 'Psa Chas Branch' })).toBe(
      PSA_CHAS_SATELLITE_EMBED_URL,
    );
    expect(getBranchSatelliteEmbedUrl({ nameOrSlug: 'សាខាផ្សារចាស់' })).toBe(
      PSA_CHAS_SATELLITE_EMBED_URL,
    );
    expect(
      getBranchSatelliteEmbedUrl({
        googleMapsUrl: 'https://maps.app.goo.gl/sxiKakoGPZEMzciB9',
        nameOrSlug: 'Arunreah Dental Clinic',
      }),
    ).toBe(PSA_CHAS_SATELLITE_EMBED_URL);
  });

  it('extracts coordinates when a full Google Maps URL contains place or viewport coordinates', () => {
    expect(
      getBranchCoordinates(
        'Custom Branch',
        'https://www.google.com/maps/place/Test/@11.55555,104.93333,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d11.56666!4d104.94444',
      ),
    ).toEqual({ lat: 11.56666, lng: 104.94444 });
  });
});
