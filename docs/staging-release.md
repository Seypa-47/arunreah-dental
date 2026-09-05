# Staging and release runbook

This runbook prepares a safe staging environment and a later production release.
It does **not** authorize a production deployment, remote data changes, or the
creation of staff accounts. Use test data only in staging; never enter real
patient information there.

## Current staging topology

The staging application uses same-site HTTPS subdomains:

```text
Frontend: https://staging.mekhla.digital
API:      https://api.staging.mekhla.digital
Media:    https://pub-0dae1b4d79d0465fa30f0366829841b4.r2.dev
```

The API's `CORS_ALLOWED_ORIGINS` value is the exact frontend origin above.
`SameSite=Lax` admin cookies are intentional. Do not weaken them to make a
cross-site `workers.dev` and `pages.dev` pairing work. The temporary Pages and
Workers URLs are deployment diagnostics only, not the browser-admin origins.

## Environment boundary

| Environment | Browser configuration | Worker vars/bindings | Worker secrets |
| --- | --- | --- | --- |
| Local | `apps/web/.env.local` | local Wrangler D1/R2 simulation | `apps/api/.dev.vars` |
| Staging | uncommitted frontend host settings | staging D1, R2, origins, media URL | staging-only Turnstile/notification secrets |
| Production | deployment host settings | production D1, R2, origins, media URL | production-only Turnstile/notification secrets |

Only these browser-visible values are permitted:

```text
VITE_API_BASE_URL
VITE_MEDIA_PUBLIC_BASE_URL
VITE_TURNSTILE_SITE_KEY
```

`VITE_TURNSTILE_SITE_KEY` is public. Never place session tokens, D1/R2
credentials, `TURNSTILE_SECRET_KEY`, Resend keys, Telegram bot tokens, or
passwords in `VITE_*` values.

The Worker uses non-secret `wrangler.jsonc` vars for `APP_ENV`,
`CORS_ALLOWED_ORIGINS`, and `MEDIA_PUBLIC_BASE_URL`. D1/R2 are bound in the
same environment block. Each remote environment must have its own database,
bucket, admin sessions, and secrets.

## D1 migration and first-admin procedure

Run migration commands from the repository root. Review pending migrations
before applying them; migrations proceed local → staging → production.

```bash
# Local state only
pnpm --filter @arunreah/api db:migrate:local
pnpm --filter @arunreah/api exec wrangler d1 migrations list arunreah-dental-development --local

# Staging: inspect first, then apply after approval
pnpm --filter @arunreah/api exec wrangler d1 migrations list arunreah-dental-staging --env staging --remote
pnpm --filter @arunreah/api db:migrate:staging

# Production: inspect first. Apply only during an approved production release.
pnpm --filter @arunreah/api exec wrangler d1 migrations list arunreah-dental-production --env production --remote
pnpm --filter @arunreah/api db:migrate:production
```

Do not edit an applied migration. Wrangler creates a backup before a remote
apply and rolls back a failing migration step; this is not a substitute for
reviewing the migration and maintaining a recovery plan.

To bootstrap the first administrator, generate the SQL locally with a unique
password-manager value. The command output contains a password hash, so keep
it out of source control and remove the temporary file immediately after use.

```bash
INITIAL_SUPER_ADMIN_NAME='Clinic Owner' \
INITIAL_SUPER_ADMIN_EMAIL='owner@example.com' \
INITIAL_SUPER_ADMIN_PASSWORD='use-a-unique-password-of-at-least-12-characters' \
pnpm --filter @arunreah/api admin:bootstrap:sql
```

Copy the generated single `INSERT` statement into a reviewed temporary SQL
file, apply it **once** to the intended local or remote database using Wrangler,
verify login, then securely remove the temporary file. Never run a staging
bootstrap statement against production.

## Staging Worker configuration

Set a secret interactively; do not put secret values in a command, shell
history, `wrangler.jsonc`, or a committed file:

```bash
pnpm --filter @arunreah/api exec wrangler secret put TURNSTILE_SECRET_KEY --env staging
pnpm --filter @arunreah/api exec wrangler secret put RESEND_API_KEY --env staging
pnpm --filter @arunreah/api exec wrangler secret put TELEGRAM_BOT_TOKEN --env staging
pnpm --filter @arunreah/api exec wrangler secret list --env staging
```

Only set the email/Telegram secrets if that provider is enabled. Configure the
matching non-secret enablement and recipient/from/chat settings in the staging
Worker environment without copying production values. Repeat the same commands
with `--env production` only during an approved production release.

Turnstile requires a widget created for the deployed frontend hostname. The
frontend receives its site key as `VITE_TURNSTILE_SITE_KEY`; the Worker receives
only `TURNSTILE_SECRET_KEY`. Staging and production fail closed when the secret
or a valid token is missing. Local development deliberately permits no secret
for deterministic local API testing.

## R2 media configuration

Configure both values to the public HTTPS serving origin for the same
environment, without a trailing slash:

```text
Worker:   MEDIA_PUBLIC_BASE_URL=https://media.staging.example
Frontend: VITE_MEDIA_PUBLIC_BASE_URL=https://media.staging.example
```

The CMS uploads image bytes to R2 and receives a unique object key. CMS records
store the key only; the frontend combines that key with
`VITE_MEDIA_PUBLIC_BASE_URL` for previews and public images. A new upload gets
a new immutable key, so replacement must be:

```text
upload new object → save the CMS record with the new key → optionally delete a confirmed orphan
```

Never delete an old key before the CMS save succeeds. The API rejects deletion
of media still referenced by Clinic, Branch, Service, Doctor, or Showcase data.

## Staging deployment order

1. Confirm the staging D1 database, R2 bucket, API hostname, frontend hostname,
   and public R2 media origin are distinct from production.
2. Set the exact staging frontend origin in `CORS_ALLOWED_ORIGINS` and confirm
   it is same-site HTTPS with the API hostname.
3. List and apply approved staging D1 migrations.
4. Set staging Worker secrets interactively.
5. Deploy the Worker after a dry run:

   ```bash
   pnpm --filter @arunreah/api exec wrangler deploy --dry-run --env staging
   pnpm --filter @arunreah/api exec wrangler deploy --env staging
   ```

6. Build/deploy the frontend using an uncommitted staging environment file with
   `VITE_API_BASE_URL`, `VITE_MEDIA_PUBLIC_BASE_URL`, and the public Turnstile
   site key.
7. Request `GET /api/health`, then execute the manual checklist below.

For production, use the same order with production-only resources and a formal
change approval. Do not deploy production from this runbook automatically.

## Manual staging acceptance checklist

Use test staff accounts and fictional patient data.

- [ ] Open `GET /api/health`; expect `{ success: true, data: { status: "ok" } }`.
- [ ] Sign in as a SUPER_ADMIN; expect dashboard, appointment, CMS, and Admin
  Management navigation.
- [ ] Sign in as CMS_ADMIN; expect CMS only and `403` for appointment/admin
  management APIs.
- [ ] Sign in as RECEPTIONIST; expect appointment operations only and `403` for
  CMS/admin management APIs.
- [ ] Create, update, publish, and unpublish a test Service, Doctor, Branch,
  and Showcase; verify EN and Khmer public views separately.
- [ ] Upload a JPEG, PNG, or WEBP image, save its object key to a CMS record,
  and verify the public R2 URL loads. Attempt deletion while referenced; expect
  a conflict. Remove the reference before testing orphan deletion.
- [ ] Submit one fictional appointment with a published service, doctor, and
  appointment-enabled branch; expect a PENDING **request received** response,
  never an automatic confirmation.
- [ ] Submit with No Preference; expect a null doctor reference. Verify the
  receptionist inbox, status transitions, and dashboard counts.
- [ ] Verify the Turnstile widget rejects missing/expired tokens in staging.
- [ ] Test the final active SUPER_ADMIN protection by attempting a safe test
  deactivation/demotion; expect a conflict and no false success state.
- [ ] Verify logout and an expired/invalid session return the user to login.
- [ ] Check empty, not-found, retry, and forbidden UI states with test records.

## Rollback and operational checks

Before deployment, record the current Worker version. If a Worker release must
be rolled back, inspect the available versions and use the approved version
through Wrangler:

```bash
pnpm --filter @arunreah/api exec wrangler versions list --env staging
pnpm --filter @arunreah/api exec wrangler versions view <VERSION_ID> --env staging
```

Use the Cloudflare dashboard or the team’s approved version deployment procedure
to restore a known-good Worker version. Roll frontend deployments back through
the frontend host’s deployment history. Do not roll back D1 by applying old SQL;
use a reviewed forward corrective migration or a documented database recovery
procedure.

For short-lived diagnostics, tail logs while avoiding patient details, cookies,
passwords, or secret values:

```bash
pnpm --filter @arunreah/api exec wrangler tail arunreah-api-staging --env staging --status error
```

Rotate an exposed Turnstile, email, or Telegram secret by creating a replacement
in the provider, setting it interactively in the target Worker environment,
redeploying if needed, validating the affected flow, then revoking the old value
at the provider. The current opaque-session implementation does not use a
separate session-signing secret. Never place a secret in a Git commit.

## Automated validation coverage

The deterministic suite uses local mocks/test D1 bindings only. It covers
public CMS filtering/localization, appointment persistence/idempotency/status
workflow and notification failure isolation, RBAC, dashboard behavior, media
reference protection, CORS/origin controls, secure cookies, and cache headers.
It does not send email/Telegram, write staging/production D1/R2, or call the
real Turnstile service.
