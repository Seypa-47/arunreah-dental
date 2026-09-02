# Backend security baseline

## Cookie-authenticated admin requests

Admin sessions use a host-only, `HttpOnly` cookie with `SameSite=Lax`, path `/`,
and a seven-day expiry. The cookie is `Secure` outside local development.

In staging and production, every state-changing `/api/admin/*` request and the
authentication `POST` routes must include an exact `Origin` listed in
`CORS_ALLOWED_ORIGINS`. This is a deliberate CSRF defence in addition to the
cookie's SameSite policy. The deployed Pages origin must therefore be included
exactly, for example `https://admin.example.com`; do not use `*`.

## Environment and secrets

Set public Worker configuration through Wrangler variables:

- `APP_ENV`
- `CORS_ALLOWED_ORIGINS`
- `MEDIA_PUBLIC_BASE_URL`

Set secrets through `wrangler secret put` for each environment:

- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- any email recipient/from-address values that are treated as operationally sensitive

Production and staging must use different D1 databases, R2 buckets, origins,
and secrets. Replace every `example.com` origin and placeholder D1 ID in
`wrangler.jsonc` before deployment.

## Public appointment requests

Production requires server-side Turnstile verification. Appointment requests
are limited per Cloudflare client IP, idempotency keys are stored as hashes, and
the created request is always `PENDING`. Notification failures never remove a
persisted request.

## Media

Only CMS administrators and super administrators can upload or delete media.
The API accepts JPEG, PNG, and WEBP only, checks file signatures, limits images
to 5 MB, generates unique category-prefixed R2 keys, and prevents deletion when
a key remains referenced by CMS content.
