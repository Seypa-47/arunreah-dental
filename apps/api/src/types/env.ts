export type Bindings = {
  DB: D1Database;
  ASSETS: R2Bucket;
  APP_ENV: 'development' | 'staging' | 'production';
  CORS_ALLOWED_ORIGINS: string;
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
