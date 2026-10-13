# Production provisioning and release

Production does not exist yet. At the time of writing the Cloudflare account
holds only the staging D1 database, R2 bucket and Pages project, and no
`arunreah-api-production` Worker. `apps/api/wrangler.jsonc` therefore carries a
placeholder `database_id`, which makes a premature `wrangler deploy --env
production` fail instead of writing to the wrong place.

Planned topology, following the staging pattern of same-site HTTPS subdomains:

```text
Frontend: https://arunreahdental.com
API:      https://api.arunreahdental.com
Media:    https://media.arunreahdental.com
```

Production must never share D1 data, R2 objects, admin accounts, sessions,
cookie signing keys or provider credentials with staging. Copying staging
secrets into production, or the reverse, is a security incident.

Before any remote action, run `pnpm check:production-config`. It performs a
local, non-secret check of the committed production Worker bindings and fails
while the D1 id, media origin, route, or R2 bucket is missing or still a
placeholder. After it passes, `pnpm build:production:api` performs a Wrangler
production-environment dry run without deploying.

## 1. Create the data stores

```bash
cd apps/api
npx wrangler d1 create arunreah-dental-production
npx wrangler r2 bucket create arunreah-dental-production
```

Put the id printed by the D1 command into the `production` block of
`apps/api/wrangler.jsonc`, replacing `REPLACE_WITH_PRODUCTION_D1_DATABASE_ID`.

## 2. Apply migrations

```bash
pnpm --filter @arunreah/api db:migrate:production
```

This runs the same `migrations/` directory as staging. Never hand-edit an
applied migration; add a new one.

## 3. Set the media URL

Attach `media.arunreahdental.com` to the production bucket and set that
exact HTTPS origin as `MEDIA_PUBLIC_BASE_URL`. Do not enable or use an `r2.dev`
development URL in production. Keep direct bucket listing private; public reads
must use only the intended custom domain. An empty value renders the site
without images.

## 4. Set the Worker secrets

Secrets never belong in `wrangler.jsonc` or in any `VITE_*` value:

```bash
npx wrangler secret put SESSION_SIGNING_KEY --env production
npx wrangler secret put TURNSTILE_SECRET_KEY --env production
npx wrangler secret put RESEND_API_KEY --env production
npx wrangler secret put TELEGRAM_BOT_TOKEN --env production   # only if Telegram is used
```

Generate a `SESSION_SIGNING_KEY` unique to production. Public appointment
requests reject submissions without `TURNSTILE_SECRET_KEY`.

The production owner approved reusing the existing clinic Telegram bot and
group. The chat id is a non-secret production var, while the bot token must be
entered again as a production Worker secret.

## 5. Deploy the Worker and attach the domain

```bash
pnpm deploy:production:api
```

The guarded command runs the committed production-config check first and then
selects the production environment explicitly. Record the resulting Worker
version/deployment id in the release record. Do not bypass the guard with a
direct Wrangler deploy during a routine release.

The `routes` entry claims `api.arunreahdental.com` as a custom domain, so
that hostname must be on the same Cloudflare account as the zone.

## 6. Create the Pages project and deploy the site

```bash
npx wrangler pages project create arunreah-dental-production
```

Build the frontend against production values — these are embedded in the
browser bundle, so they must contain no secrets:

```text
VITE_API_BASE_URL=https://api.arunreahdental.com
VITE_MEDIA_PUBLIC_BASE_URL=<the media URL from step 3>
VITE_TURNSTILE_SITE_KEY=<production Turnstile site key>
```

```bash
pnpm --filter @arunreah/web build:production
cd apps/web
npx wrangler pages deploy dist --project-name arunreah-dental-production --branch main
```

The production build command pins the public production API and media origins
so a developer's local staging environment file cannot be embedded in the
production browser bundle. It still reads the public Turnstile site key from
the production environment configuration.

The Pages project's production branch label decides which deploys are served at
the custom domain; other labels are previews. Attach
`arunreahdental.com` to the project, and confirm it matches
`CORS_ALLOWED_ORIGINS` exactly, including the scheme and any `www`.

## 7. Create the first administrator

Use `pnpm --filter @arunreah/api admin:bootstrap:sql` to generate the insert for
a production super administrator. Never copy a staging account, password hash or
session across.

## 8. Verify before announcing

- `GET https://api.arunreahdental.com/api/health` returns ok.
- `GET https://api.arunreahdental.com/api/health/ready` returns 200. Treat
  any non-200 response as a release blocker; the response intentionally omits
  provider and database details.
- The site loads at the custom domain and its asset hash matches the local build.
- Admin sign-in works, and a CMS save round-trips.
- An image uploaded in the admin renders on the public site.
- The public pages render in both English and Khmer, including the booking
  calendar, and language survives navigation between pages.
- A test appointment request succeeds and its notification arrives.

Also verify that an unknown public SPA route shows the branded 404 experience.
Cloudflare Pages may still return HTTP 200 for a client-side fallback, so record
the observed network status as a known hosting limitation unless a Pages routing
rule provides a real 404.

## 9. Migration rehearsal and recovery bookmark

Before production, apply every pending migration to a disposable or staging
copy in filename order and verify expected table row counts, foreign-key
integrity, required indexes, and trigger definitions. Store the exact migration
list and results in the release record. Never edit an already-applied file.

Immediately before a production migration, an authorized operator must record a
D1 Time Travel bookmark:

```bash
pnpm --filter @arunreah/api exec wrangler d1 time-travel info arunreah-dental-production --env production
```

If validation fails after migration, prefer a forward corrective migration.
Use Time Travel restore only under the incident owner's explicit authorization,
because it replaces database state after the selected bookmark:

```bash
pnpm --filter @arunreah/api exec wrangler d1 time-travel restore arunreah-dental-production --bookmark=<recorded-bookmark> --env production
```

Capture the undo bookmark printed by the restore, re-run integrity checks, and
record the incident. Confirm the account's current Time Travel retention window
in Cloudflare before relying on it.

## 10. R2 orphan and retention procedure

R2 has no transaction shared with D1. Periodically export the referenced media
keys from D1 and compare them with a read-only listing of the production bucket.
Never delete a key that is referenced by any clinic, branch, service, doctor,
showcase, or page-media row. Place unmatched keys in an orphan report, retain
them for the clinic's approved recovery window, recheck references, then delete
only through an authorized maintenance procedure. Normal user-driven deletion
must continue through the API so the media deletion lock and reference checks
run. Record object key, discovery time, decision, and deletion time without
logging patient data or signed URLs.

## 11. Monitoring and external-provider checks

- Confirm Worker logs and traces are retained in the production dashboard.
- Confirm invocation logs remain disabled so URL query strings are not captured
  by the automatic request log; application logs must remain metadata-only.
- Enable and test Cloudflare alerting/issues for elevated 5xx responses and
  availability. These controls cannot be proven by repository configuration.
- Confirm Resend and Telegram dashboards use production-only credentials and
  destinations. Notification delivery is best effort; durable retries require a
  separately approved Queue or Workflow and are not created by this release.
- Run a synthetic readiness check from outside Cloudflare and alert on a
  sustained non-200 response.

## 12. Font privacy and CSP decision

The public CSP allows Google Fonts stylesheet and font origins because the
current frontend loads that hosted font. This means a visitor's browser contacts
Google. Obtain privacy approval for that behavior, or self-host properly
licensed font files and then remove both Google origins from the CSP. Do not
weaken the remaining CSP directives to solve a font-loading error.
