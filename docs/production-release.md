# Production provisioning and release

Production does not exist yet. At the time of writing the Cloudflare account
holds only the staging D1 database, R2 bucket and Pages project, and no
`arunreah-api-production` Worker. `apps/api/wrangler.jsonc` therefore carries a
placeholder `database_id`, which makes a premature `wrangler deploy --env
production` fail instead of writing to the wrong place.

Planned topology, following the staging pattern of same-site HTTPS subdomains:

```text
Frontend: https://arunreah.mekhla.digital
API:      https://api.arunreah.mekhla.digital
Media:    set after the production R2 bucket exists
```

Production must never share D1 data, R2 objects, admin accounts, sessions,
cookie signing keys or provider credentials with staging. Copying staging
secrets into production, or the reverse, is a security incident.

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

Expose the production bucket (its `r2.dev` URL, or a custom media domain) and
set `MEDIA_PUBLIC_BASE_URL` in the `production` vars. An empty value renders
the site without images.

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

To turn on Telegram notifications, set the production chat id and flip
`TELEGRAM_NOTIFICATIONS_ENABLED` to `"true"` in the `production` vars. It ships
disabled so a fresh deploy cannot message a staging chat.

## 5. Deploy the Worker and attach the domain

```bash
npx wrangler deploy --env production
```

The `routes` entry claims `api.arunreah.mekhla.digital` as a custom domain, so
that hostname must be on the same Cloudflare account as the zone.

## 6. Create the Pages project and deploy the site

```bash
npx wrangler pages project create arunreah-dental-production
```

Build the frontend against production values — these are embedded in the
browser bundle, so they must contain no secrets:

```text
VITE_API_BASE_URL=https://api.arunreah.mekhla.digital
VITE_MEDIA_PUBLIC_BASE_URL=<the media URL from step 3>
VITE_TURNSTILE_SITE_KEY=<production Turnstile site key>
```

```bash
cd apps/web && pnpm build
npx wrangler pages deploy dist --project-name arunreah-dental-production --branch main
```

The Pages project's production branch label decides which deploys are served at
the custom domain; other labels are previews. Attach
`arunreah.mekhla.digital` to the project, and confirm it matches
`CORS_ALLOWED_ORIGINS` exactly, including the scheme and any `www`.

## 7. Create the first administrator

Use `pnpm --filter @arunreah/api admin:bootstrap:sql` to generate the insert for
a production super administrator. Never copy a staging account, password hash or
session across.

## 8. Verify before announcing

- `GET https://api.arunreah.mekhla.digital/api/health` returns ok.
- The site loads at the custom domain and its asset hash matches the local build.
- Admin sign-in works, and a CMS save round-trips.
- An image uploaded in the admin renders on the public site.
- The public pages render in both English and Khmer, including the booking
  calendar, and language survives navigation between pages.
- A test appointment request succeeds and its notification arrives.
