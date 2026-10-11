# Public website integration

Public pages use the unauthenticated Worker endpoints for clinic/contact settings,
services, doctors, branches, and showcases. Each content query includes
`?lang=en` or `?lang=km`; switching the public language selects a separate
React Query cache entry.

Images are stored as R2 object keys. Configure the optional
`VITE_MEDIA_PUBLIC_BASE_URL` only when an R2 public-serving origin is available.
The browser never treats a raw key as an image URL.

## Appointment requests

The booking page loads published Services, Doctors, and appointment-accepting
Branches from public APIs. It submits their server-issued UUIDs to
`POST /api/public/appointments`, uses a new idempotency key per form instance,
and sends `doctorId: null` for **No Preference**. A successful response means
the request is `PENDING`; it is never presented as a confirmed appointment.

The API accepts preferred times as `HH:mm` values. Availability, schedules,
payments, and automatic confirmation are intentionally not part of the client.

## Turnstile

The Worker requires a Turnstile token outside local development whenever
`TURNSTILE_SECRET_KEY` is configured. Before staging booking can be enabled,
create a Turnstile widget for the deployed frontend hostname, configure its
public `VITE_TURNSTILE_SITE_KEY` in the frontend environment, and configure the
matching `TURNSTILE_SECRET_KEY` only as a Worker secret. Never place the secret
in `VITE_*`, source code, or a committed environment file.

The deployed frontend and Worker must use compatible HTTPS, same-site origins
for cookie-based admin flows. Public content requests do not send admin cookies.
