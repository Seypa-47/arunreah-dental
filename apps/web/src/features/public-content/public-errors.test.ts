import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/api';
import { isPublicNotFoundError } from './public-errors';

describe('isPublicNotFoundError', () => {
  it('only classifies API 404 responses as missing content', () => {
    expect(isPublicNotFoundError(new ApiClientError({ code: 'NOT_FOUND', message: 'Missing', status: 404 }))).toBe(true);
    expect(isPublicNotFoundError(new ApiClientError({ code: 'INTERNAL_ERROR', message: 'Failed', status: 500 }))).toBe(false);
    expect(isPublicNotFoundError(new Error('Network failed'))).toBe(false);
  });
});
