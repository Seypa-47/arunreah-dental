import { lazy } from 'react';

export const CHUNK_RELOAD_STORAGE_KEY = 'arunreah:chunk-reload';
const CHUNK_RELOAD_COOLDOWN_MS = 15_000;

const CHUNK_LOAD_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Unable to preload CSS/i,
  /Failed to load module script/i,
  /ChunkLoadError/i,
];

export function isChunkLoadError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'object' &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : typeof error === 'string'
          ? error
          : '';

  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

interface ReloadEnvironment {
  getPathname?: () => string;
  now?: () => number;
  reload?: () => void;
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
}

function getDefaultStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function tryReloadForStaleChunk(env: ReloadEnvironment = {}): boolean {
  const getPathname =
    env.getPathname ?? (() => (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const now = env.now ?? (() => Date.now());
  const reload =
    env.reload ??
    (() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  const storage = env.storage !== undefined ? env.storage : getDefaultStorage();

  const currentPath = getPathname();
  const currentTime = now();

  if (storage) {
    try {
      const raw = storage.getItem(CHUNK_RELOAD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { path?: unknown; timestamp?: unknown };
        if (
          parsed.path === currentPath &&
          typeof parsed.timestamp === 'number' &&
          currentTime - parsed.timestamp < CHUNK_RELOAD_COOLDOWN_MS
        ) {
          return false;
        }
      }
      storage.setItem(
        CHUNK_RELOAD_STORAGE_KEY,
        JSON.stringify({ path: currentPath, timestamp: currentTime }),
      );
    } catch {
      return false;
    }
  }

  reload();
  return true;
}

export function clearChunkReloadMarker(
  storage: Pick<Storage, 'removeItem'> | null = getDefaultStorage(),
): void {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
  } catch {
    // Ignore storage restriction errors
  }
}

export function lazyWithRetry<T extends Parameters<typeof lazy>[0]>(
  importer: T,
): ReturnType<typeof lazy<Awaited<ReturnType<T>>['default']>> {
  return lazy(async () => {
    try {
      const loaded = await importer();
      clearChunkReloadMarker();
      return loaded;
    } catch (error) {
      if (isChunkLoadError(error) && tryReloadForStaleChunk()) {
        return await new Promise<never>(() => {});
      }
      throw error;
    }
  });
}

let preloadListenerRegistered = false;

export function registerVitePreloadErrorHandler(): void {
  if (preloadListenerRegistered || typeof window === 'undefined') {
    return;
  }
  preloadListenerRegistered = true;
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    tryReloadForStaleChunk();
  });
}
