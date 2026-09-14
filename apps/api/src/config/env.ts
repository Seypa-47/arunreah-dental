import type { Bindings } from '../types/env';

export function getRuntimeConfig(bindings: Bindings) {
  return {
    appEnv: bindings.APP_ENV,
    corsAllowedOrigin: bindings.CORS_ALLOWED_ORIGIN,
  } as const;
}
