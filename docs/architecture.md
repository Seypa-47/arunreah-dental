# Architecture

## Boundaries

- `apps/web` owns React routes, UI, frontend state, responsive behavior, and
  static interface localization.
- `apps/api` owns Hono routing, input validation, authorization, service logic,
  repositories, Cloudflare bindings, and server-side error handling.
- `packages/shared` owns public API contracts, Zod schemas, shared domain enums,
  and inferred TypeScript types. It must not contain database internals or UI.

The frontend does not access D1 or R2 directly. D1 stores structured data and
R2 stores file/image objects; D1 stores only R2 keys and metadata.

## API surface

The Worker exposes `GET /api/health`, cookie-authenticated routes under
`/api/auth` and `/api/admin`, and public website routes under `/api/public`.
Route modules are mounted centrally in `apps/api/src/app.ts`; new business
routes must preserve those public/private boundaries and use the shared API
response shape:

```ts
{ success: true, data: T }
{ success: false, error: { code: string, message: string } }
```

## Language boundary

Static interface strings are version-controlled frontend locale files.
Clinic-authored English/Khmer content will be CMS-managed data. Do not mix the
two systems.

## Appointment boundary

Appointments are requests, not automatic bookings. Future status values are
`PENDING`, `CONFIRMED`, `COMPLETED`, and `CANCELLED` only.
