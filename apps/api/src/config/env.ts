import type { Bindings } from '../types/env';

export function getAllowedOrigins(bindings: Bindings) {
  return bindings.CORS_ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(bindings: Bindings, origin: string) {
  return getAllowedOrigins(bindings).includes(origin);
}

export function getRuntimeConfig(bindings: Bindings) {
  return {
    appEnv: bindings.APP_ENV,
    corsAllowedOrigins: getAllowedOrigins(bindings),
    mediaPublicBaseUrl: bindings.MEDIA_PUBLIC_BASE_URL?.replace(/\/+$/, '') ?? '',
  } as const;
}
