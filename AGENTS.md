# Arunreah Dental Clinic Website & CMS

## Before editing

1. Inspect the relevant existing code, configuration, and tests first.
2. Follow the established architecture and keep changes narrowly scoped.
3. Do not modify unrelated files, silently replace configuration, or invent
   requirements. State material assumptions clearly.
4. Do not add dependencies without a concrete need and a note in the final report.

## Architecture

- `apps/web` is the React/Vite frontend.
- `apps/api` is the Hono Cloudflare Worker API.
- `packages/shared` contains shared Zod schemas, API contracts, enums, and
  common TypeScript types.
- D1 is for structured data. R2 is for files and images; never store binary
  uploads in D1.
- Frontend code must not access D1/R2 directly or import database internals.

## Product boundaries

- The product is bilingual English/Khmer.
- Static UI translations and CMS-managed bilingual content are separate systems.
- Appointments are requests, never automatic confirmations.
- Future appointment statuses are only `PENDING`, `CONFIRMED`, `COMPLETED`, and
  `CANCELLED`.
- The CMS is private; authorization must be enforced by the API, not only by UI.

## Security and quality

- Keep TypeScript strict. Avoid `any`; validate unknown input at boundaries.
- Validate all future API input server-side using shared Zod schemas.
- Never put secrets in `VITE_*` variables or commit `.env`/`.dev.vars` files.
- Never log passwords, tokens, cookies, authorization headers, or raw sensitive
  patient data.
- Do not expose stack traces or provider/database details to API clients.
- Never modify an applied migration; add a new corrective migration instead.

## Verification

Run relevant checks after changes: `pnpm typecheck`, `pnpm lint`, `pnpm test`,
and `pnpm build`. Report what ran, what passed, and any limitations.

Do not create product pages, business APIs, database tables, authentication
flows, cloud resources, deployments, or mock clinic content unless explicitly
requested.
