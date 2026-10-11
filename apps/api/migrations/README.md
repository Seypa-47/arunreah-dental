# SQL migrations

Generated, versioned SQL migrations belong here. Never edit a migration after it
has been applied to a shared environment; create a new corrective migration.

Migration order: local → staging → production. Destructive changes require
explicit technical-lead approval and a rollout plan.

The numbered SQL files in this directory are the authoritative migration
history. Drizzle metadata is historical only through migration `0008` and must
not be used to regenerate, squash, rename, or reorder later SQL files. The
`pnpm --filter @arunreah/api db:generate` command deliberately stops with this
policy instead of producing unsafe metadata-derived SQL.

New migrations must use the next unused zero-padded number and be applied in
filename order. Migrations `0024` through `0030` are considered pending and
unverified for shared environments until the deployment record for that
environment explicitly lists them as applied. Rehearse pending files against a
disposable or staging copy and verify row counts, foreign-key integrity,
indexes, and triggers before production. Fix an applied migration only with a
new forward migration.
