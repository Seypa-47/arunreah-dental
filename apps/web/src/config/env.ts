type PublicEnvKey = 'VITE_API_BASE_URL';

function readPublicEnv(key: PublicEnvKey): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing required public environment variable: ${key}`);
  }

  return value;
}

export const env = {
  get apiBaseUrl() {
    return readPublicEnv('VITE_API_BASE_URL');
  },
  get turnstileSiteKey() {
    return import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || undefined;
  },
} as const;
