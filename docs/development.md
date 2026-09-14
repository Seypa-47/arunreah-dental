# Development

## First run

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.dev.vars.example apps/api/.dev.vars
pnpm dev
```

Visit `http://localhost:5173` and `http://localhost:8787/health`.

## Workspace commands

Run all checks before submitting a pull request:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Adding work

- Keep frontend feature code within `apps/web/src/features/<feature>`.
- Keep Worker routes thin and move non-trivial behavior into services/repositories.
- Put future shared API contracts in `packages/shared`.
- Add schema changes through reviewed Drizzle migrations; never hand-edit an
  already-applied migration.
