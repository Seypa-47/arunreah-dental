# Environments

## Separation

| Environment | Pages                    | Worker            | D1                  | R2                  |
| ----------- | ------------------------ | ----------------- | ------------------- | ------------------- |
| Local       | Vite                     | Wrangler local    | local D1            | local R2 simulation |
| Staging     | separate Pages project   | separate Worker   | separate database   | separate bucket     |
| Production  | production Pages project | production Worker | production database | production bucket   |

Staging and production must never share D1 data, R2 objects, admin accounts,
sessions, cookie signing keys, provider credentials, or patient data.

## Frontend public configuration

Copy `apps/web/.env.example` to `apps/web/.env.local`.

```text
VITE_API_BASE_URL=http://localhost:8787
```

Every `VITE_*` value is embedded in the browser bundle. Never add tokens,
private keys, Worker secrets, R2 credentials, D1 credentials, or session keys.

## Worker configuration and secrets

Non-secret Worker configuration belongs in `wrangler.jsonc` environment `vars`.
Secrets belong in Cloudflare Worker secrets remotely and in untracked
`apps/api/.dev.vars` locally. Future expected secret names may include:

```text
SESSION_SIGNING_KEY
EMAIL_PROVIDER_API_KEY
TURNSTILE_SECRET_KEY
```

No real secret is required for the current health-check-only foundation.

Public appointment requests require `TURNSTILE_SECRET_KEY` in staging and
production. Set it with `wrangler secret put TURNSTILE_SECRET_KEY --env staging`
or `--env production`; never place it in `wrangler.jsonc` or `VITE_*` values.
Local development may omit it, allowing local API testing without a real
Turnstile challenge.

## Public R2 media origin

`MEDIA_PUBLIC_BASE_URL` is a non-secret Worker variable used only to form the
stable URL returned after CMS media uploads. Configure it to the HTTPS origin of
the R2 custom domain for each environment, without a trailing slash. It is
empty locally because Wrangler's local R2 simulation has no public custom
domain. Do not use the R2 API endpoint or credentials as this value.

## Cloudflare placeholders

`apps/api/wrangler.jsonc` includes separate development, staging, and production
binding sections. Replace every zero UUID, example origin, and placeholder
bucket/database value only after creating the corresponding environment resource.
Never reuse a production ID for staging.
