import { describe, expect, it } from 'vitest';
import { resolveOptionalResult } from './use-landing-page';

describe('landing endpoint isolation', () => {
  it('preserves fulfilled optional data without marking a section failed', () => {
    expect(resolveOptionalResult({ status: 'fulfilled', value: ['service'] }, [])).toEqual({
      data: ['service'],
      failed: false,
    });
  });

  it('uses an empty fallback and marks only the rejected optional endpoint failed', () => {
    const failure = resolveOptionalResult<string[]>(
      { status: 'rejected', reason: new Error('network unavailable') },
      [],
    );

    expect(failure).toEqual({ data: [], failed: true });
  });
});
