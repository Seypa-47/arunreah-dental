# Frontend API foundation

## Phase 2: dashboard and appointments

The private dashboard uses `GET /api/admin/dashboard` with the authenticated
cookie. Its optional `appointments`/`recentAppointments` and `content` sections
are determined by the server-side role, so the CMS dashboard must never infer or
render appointment data that is absent from the response.

Appointment staff views use `GET /api/admin/appointments`,
`GET /api/admin/appointments/:id`, and
`PATCH /api/admin/appointments/:id/status`. Status writes invalidate the
appointment list/detail and dashboard query keys. The local API must be running,
`VITE_API_BASE_URL` must point to it, and an admin must sign in first.

Staging browser authentication still requires same-site HTTPS frontend and API
domains; do not rely on a cross-site `workers.dev` cookie setup.

## Public environment configuration

The browser receives only `VITE_*` values. Copy the example file locally:

```bash
cp apps/web/.env.example apps/web/.env.local
```

For local development, use the local Worker:

```text
VITE_API_BASE_URL=http://localhost:8787
```

For a staging build, use the deployed staging Worker URL in an uncommitted
staging environment file:

```text
VITE_API_BASE_URL=https://arunreah-api-staging.arunreah-dental.workers.dev
```

Never place D1/R2 credentials, Worker secrets, Turnstile secrets, email keys,
Telegram tokens, or session credentials in a `VITE_*` value.

## Frontend API client

Use the shared API client for future calls instead of calling `fetch` in page
components. It builds URLs from `VITE_API_BASE_URL`, parses the standard API
response envelope, and exposes safe typed errors.

```ts
import { getApiClient } from '@/lib/api';

const clinic = await getApiClient().get('/api/public/clinic');
const dashboard = await getApiClient().get('/api/admin/dashboard', {
  authenticated: true,
});
```

`authenticated: true` opts into `credentials: 'include'`. Public requests omit
credentials by default. Future admin login must also explicitly request
credentials so the browser accepts the session cookie.

Use the centralized `queryKeys` helpers for every React Query query and mutation
invalidation. Do not put an API base URL, secrets, or raw error payloads in a
query key.

## Local database and first admin

Apply local migrations before testing locally:

```bash
pnpm --filter @arunreah/api db:migrate:local
```

Create a local SQL bootstrap file without writing a plaintext password to Git:

```bash
read -r 'INITIAL_SUPER_ADMIN_NAME?Admin name: '
read -r 'INITIAL_SUPER_ADMIN_EMAIL?Admin email: '
read -rs 'INITIAL_SUPER_ADMIN_PASSWORD?Admin password: '
echo
export INITIAL_SUPER_ADMIN_NAME INITIAL_SUPER_ADMIN_EMAIL INITIAL_SUPER_ADMIN_PASSWORD
pnpm --filter @arunreah/api admin:bootstrap:sql > /tmp/arunreah-local-super-admin.sql
unset INITIAL_SUPER_ADMIN_PASSWORD
pnpm --filter @arunreah/api exec wrangler d1 execute arunreah-dental-development --local --file=/tmp/arunreah-local-super-admin.sql
```

Use a unique password-manager value of at least 12 characters. Delete the local
SQL file after successful execution. It contains a password hash, but is still
environment-sensitive operational data and must never be committed.

## Staging database and first admin

Apply committed migrations to the remote staging D1 database:

```bash
pnpm --filter @arunreah/api db:migrate:staging
```

Create the first staging super admin with the same interactive process, changing
only the final execution command:

```bash
pnpm --filter @arunreah/api exec wrangler d1 execute arunreah-dental-staging --env staging --remote --file=/tmp/arunreah-staging-super-admin.sql
```

Generate `/tmp/arunreah-staging-super-admin.sql` with
`admin:bootstrap:sql` first. Confirm the selected Wrangler account and database
name before executing it. Never reuse production credentials in staging.

## CMS test data

This phase does not seed clinic data automatically. Create CMS content manually
through the future connected CMS UI or a separately reviewed bootstrap process.
Do not add mock clinic data directly to staging or production D1.

## Health check

The shared health service calls `GET /api/health`. With the local Worker running,
verify it directly:

```bash
curl http://localhost:8787/api/health
```

Expected data contains `service: "arunreah-api"` and `status: "ok"`.
