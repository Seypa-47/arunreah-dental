import { describe, expect, it, vi } from 'vitest';
import {
  CHUNK_RELOAD_STORAGE_KEY,
  clearChunkReloadMarker,
  isChunkLoadError,
  tryReloadForStaleChunk,
} from './lazy-with-retry';

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

describe('lazy-with-retry', () => {
  it('detects dynamic import chunk load errors across browsers', () => {
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://staging.mekhla.digital/assets/ServicesPage-QoXsYZ8p.js',
        ),
      ),
    ).toBe(true);
    expect(
      isChunkLoadError(new TypeError('error loading dynamically imported module')),
    ).toBe(true);
    expect(
      isChunkLoadError(new TypeError('Importing a module script failed.')),
    ).toBe(true);
    expect(
      isChunkLoadError(new Error('Unable to preload CSS for /assets/ServicesPage.css')),
    ).toBe(true);
    expect(isChunkLoadError(new Error('Regular application error'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });

  it('reloads once for a stale chunk and prevents rapid infinite reload loops on the same path', () => {
    const storage = createMemoryStorage();
    const reload = vi.fn();

    const firstAttempt = tryReloadForStaleChunk({
      getPathname: () => '/services',
      now: () => 1_000,
      reload,
      storage,
    });
    expect(firstAttempt).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);

    const secondAttemptWithinCooldown = tryReloadForStaleChunk({
      getPathname: () => '/services',
      now: () => 5_000,
      reload,
      storage,
    });
    expect(secondAttemptWithinCooldown).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);

    const attemptOnDifferentPath = tryReloadForStaleChunk({
      getPathname: () => '/branches',
      now: () => 6_000,
      reload,
      storage,
    });
    expect(attemptOnDifferentPath).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);

    const attemptAfterCooldown = tryReloadForStaleChunk({
      getPathname: () => '/branches',
      now: () => 25_000,
      reload,
      storage,
    });
    expect(attemptAfterCooldown).toBe(true);
    expect(reload).toHaveBeenCalledTimes(3);

    clearChunkReloadMarker(storage);
    expect(storage.getItem(CHUNK_RELOAD_STORAGE_KEY)).toBeNull();
  });
});
