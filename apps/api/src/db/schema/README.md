# Drizzle schema modules

Schema modules are grouped by domain and exported through `index.ts`. Relations
are defined centrally in `relations.ts` to avoid circular module imports.

All primary keys are application-generated text IDs. Timestamps use UTC ISO-8601
text values. `updated_at` is set when records are created and must be updated by
future mutation services on every write.

See `docs/database.md` for the entity and relationship reference. Applied SQL
migrations remain immutable.
