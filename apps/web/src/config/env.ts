type PublicEnvKey = 'VITE_API_BASE_URL';

function readPublicEnv(key: PublicEnvKey): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing required public environment variable: ${key}`);
  }

  return value;
}

export const env = {
  apiBaseUrl: readPublicEnv('VITE_API_BASE_URL'),
} as const;
