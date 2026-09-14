export type Bindings = {
  DB: D1Database;
  ASSETS: R2Bucket;
  APP_ENV: 'development' | 'staging' | 'production';
  CORS_ALLOWED_ORIGIN: string;
};
