/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEV_ALLOWED_HOSTS?: string;
  readonly VITE_DEV_API_PROXY_TARGET?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_MEDIA_PUBLIC_BASE_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
