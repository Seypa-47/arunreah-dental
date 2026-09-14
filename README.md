# Arunreah Dental Clinic Website & CMS

A bilingual English/Khmer dental clinic website and private CMS. This repository
contains the engineering foundation only; product pages, CMS workflows,
authentication, data tables, and business APIs have not been implemented.

## Architecture

- `apps/web` — React, Vite, TypeScript, Tailwind CSS public website and admin UI.
- `apps/api` — Hono API deployed to Cloudflare Workers.
- `packages/shared` — shared Zod-ready contracts, API response types, enums, and types.
- Cloudflare D1 will store structured data; Cloudflare R2 will store files/images.

## Technology stack

- React, Vite, TypeScript, Tailwind CSS
- React Router, React Hook Form, Zod, TanStack Query
- Cloudflare Workers, Hono, D1, R2
- Drizzle ORM with versioned SQL migrations
- pnpm workspaces, ESLint, Prettier, Vitest

## Repository structure

```text
apps/
  web/       Frontend application
  api/       Cloudflare Worker API
packages/
  shared/    Cross-application contracts and types
  config/    Reserved shared tooling configuration
docs/        Development and operational documentation
```

## Prerequisites

- Node.js 22 or later
- pnpm 9.15.1 or later
- A Cloudflare account and Wrangler authentication are needed only for remote
  staging/production deployment and migrations.

## Installation

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

## Local development

```bash
pnpm dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787`
- Health endpoint: `http://localhost:8787/health`

The Worker uses Wrangler local mode. The D1 and R2 bindings in
`apps/api/wrangler.jsonc` use safe placeholders until real Cloudflare resources
are deliberately created and configured.

## Common commands

```bash
pnpm dev          # frontend and API
pnpm dev:web      # frontend only
pnpm dev:api      # API only
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format
pnpm format:check
```

## Environment setup

`apps/web/.env.local` contains public browser values only. Never place secrets
in `VITE_*` variables. `apps/api/.dev.vars` is reserved for local Worker
secrets and is not committed. See [environment documentation](docs/environments.md).

## Environments

Local, staging, and production must have separate Pages deployments, Workers,
D1 databases, R2 buckets, secrets, admin sessions, and patient data. Production
deployment is intentionally not configured in this foundation.

## Team workflow

Use short-lived branches from `main`, open focused pull requests, and do not
push directly to `main`. Read [the Git workflow](docs/git-workflow.md) before
starting feature work.
