import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BRANCH_COORDINATES,
  PSA_CHAS_COORDINATES,
  getBranchCoordinates,
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
});
