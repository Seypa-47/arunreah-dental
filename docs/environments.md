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
TURNSTILE_SECRET_KEY
RESEND_API_KEY
TELEGRAM_BOT_TOKEN
```

No real secret is required for the current health-check-only foundation.

Public appointment requests require `TURNSTILE_SECRET_KEY` in staging and
production. Set it with `wrangler secret put TURNSTILE_SECRET_KEY --env staging`
or `--env production`; never place it in `wrangler.jsonc` or `VITE_*` values.
Local development may omit it, allowing local API testing without a real
Turnstile challenge.

## Appointment notifications

Appointment persistence is independent from notification delivery: a request is
saved with status `PENDING` before notification is attempted. A delivery failure
is logged with only the appointment reference and provider result; it never
removes or changes the saved appointment.

The provider enablement and recipient configuration are non-secret Worker vars.
Set them in `wrangler.jsonc` only after selecting real environment-specific
values, or use local `.dev.vars` for testing:

```text
EMAIL_NOTIFICATIONS_ENABLED=true
EMAIL_NOTIFICATION_RECIPIENT=appointments@clinic.example
EMAIL_FROM_ADDRESS=Arunreah Dental <appointments@clinic.example>
TELEGRAM_NOTIFICATIONS_ENABLED=true
TELEGRAM_CHAT_ID=-1001234567890
```

Use Worker secrets for credentials:

```text
RESEND_API_KEY
TELEGRAM_BOT_TOKEN
```

Email uses Resend's HTTP API when enabled and correctly configured. Telegram
uses the Bot API. Neither provider is attempted when its corresponding enabled
flag is `false`. Set remote secrets with `wrangler secret put RESEND_API_KEY
--env staging` (and the analogous production command), never in `VITE_*`, D1,
or committed files.

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
