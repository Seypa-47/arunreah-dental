export type Bindings = {
  DB: D1Database;
  ASSETS: R2Bucket;
  APP_ENV: 'development' | 'staging' | 'production';
  CORS_ALLOWED_ORIGINS: string;
  MEDIA_PUBLIC_BASE_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL_NOTIFICATIONS_ENABLED?: string;
  EMAIL_NOTIFICATION_RECIPIENT?: string;
  EMAIL_FROM_ADDRESS?: string;
  RESEND_API_KEY?: string;
  TELEGRAM_NOTIFICATIONS_ENABLED?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

export type AppVariables = {
  requestId: string;
  requestStartedAt: number;
  authenticatedAdmin: AuthenticatedAdmin;
  authenticatedSessionId: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: AppVariables;
};
import type { AuthenticatedAdmin } from './auth';
