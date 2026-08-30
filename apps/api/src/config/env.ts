import type { Bindings } from '../types/env';

export function getRuntimeConfig(bindings: Bindings) {
  return {
    appEnv: bindings.APP_ENV,
    corsAllowedOrigins: bindings.CORS_ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  } as const;
}
