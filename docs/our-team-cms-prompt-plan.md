# Our Team CMS — prompt-by-prompt build plan

Goal: make the four public Our Team categories (Dentists, General Practitioners,
Receptionists, Assistants) fully CMS-driven, with admin CRUD that matches the
existing admin design system.

Today the dentists come from the CMS and the other nine people are hard-coded
placeholders in `apps/web/src/features/doctors-page/team-directory.ts`. This
plan replaces that file's data with API data, one shippable step at a time.

---

## How to use this document

- Run **one prompt per Claude Code session**, in order. Each is sized to land as
  one reviewable commit.
- Paste the **Standing context** block first in every session, then the prompt.
- Do not skip Prompt 1. It produces the plan the rest depend on.
- After each prompt, confirm the acceptance criteria before moving on.

### Standing context (paste at the top of every session)

```
Read AGENTS.md first and follow it exactly.

Project facts you must respect:
- pnpm monorepo: apps/web (React/Vite), apps/api (Hono Cloudflare Worker),
  packages/shared (Zod schemas + shared types).
- D1 for structured data, R2 for files. The frontend never touches D1/R2.
- Admin API routes are guarded by requireAdmin + requirePermission('CMS_MANAGEMENT').
- API layering: modules/<domain>/<domain>.route.ts + .controller.ts ->
  services/<domain>.service.ts -> repositories/<domain>.repository.ts.
- All input validated server-side with shared Zod schemas from packages/shared.
- Never modify an applied migration. Add a new numbered migration instead.
- Keep TypeScript strict. No `any`. Bilingual EN/KM everywhere.
- Never log or expose secrets, tokens, or raw patient data. No stack traces to clients.

Verify with: pnpm typecheck, pnpm lint, pnpm test, pnpm --filter @arunreah/web build
Report what you changed, what you ran, what passed, and anything you did NOT do.
```

---

## Architecture decision (read before Prompt 1)

**Extend the existing `doctors` table with a `category` column. Do not create a
parallel `team_members` table, and do not rename `doctors`.**

Why:

- The `doctors` domain already has everything the other three categories need:
  bilingual names, slug, publish status, display order, portrait + image
  framing, branch assignment, and ~3,000 lines of working admin CRUD.
- A second table would duplicate all of it and leave two places to keep in sync.
- Renaming `doctors` touches `appointments.doctor_id`, every repository, and
  every query key. High risk, zero user-visible benefit. Do it later, separately,
  if ever.

**The one real risk: booking integrity.** `appointments.doctor_id` is a foreign
key to `doctors.id`. Once receptionists live in that table, a receptionist must
never be selectable as an appointment target. This is handled by a `bookable`
flag that every doctor-picker query filters on. Prompt 9 exists solely to prove
that holds.

### Field mapping — public UI to database

| Public UI (`team-directory.ts`) | Database |
| --- | --- |
| category | `doctors.category` *(new)* |
| name | `name_en` / `name_km` |
| roleTitle | `role_en` / `role_km` |
| responsibility (card line) | `specialty_en` / `specialty_km` — same slot the dentist card already uses |
| department | `department_en` / `department_km` *(new)* |
| heroSummary | `short_bio_en` / `short_bio_km` |
| about[] | `about_en` / `about_km` (blank-line separated; `ContentBlocks` already splits) |
| qualifications (GP) | `doctor_education` *(existing)* |
| areasOfCare (GP) | `doctor_expertise` *(existing)* |
| bookingAvailable | `doctors.bookable` *(new)* |
| teamConnection.note | `team_note_en` / `team_note_km` *(new)* |
| experience, responsibilities, training, languages | `doctor_profile_items` *(new, one table)* |
| supportKind | derived from category — do not store |

**On `doctor_profile_items`:** experience, responsibilities, training and
languages are all ordered lists of (optional icon, title, optional subtitle,
optional meta). One table with a `kind` discriminator means one repeater
component in the admin UI instead of four. This is a deliberate departure from
the one-table-per-concern pattern used by `doctor_expertise` / `doctor_education`
— if you prefer strict consistency with that pattern, use four small tables
instead and adjust Prompts 3-7 accordingly.

---

## Prompt 1 — Discovery and written plan (no code)

```
Read-only task. Write no code and change no files except the plan file at the end.

Read and summarise how the doctors domain works end to end:
- apps/api/src/db/schema/doctors.ts
- apps/api/src/repositories/doctor.repository.ts
- apps/api/src/services/doctor.service.ts
- apps/api/src/modules/doctors/doctor.route.ts and doctor.controller.ts
- packages/shared/src/schemas/doctors.ts
- apps/web/src/services/admin-doctors.ts
- apps/web/src/features/admin-doctors-page/AdminDoctorsPage.tsx
- apps/web/src/features/admin-add-doctor-page/AdminAddDoctorPage.tsx
- apps/web/src/features/doctors-page/team-directory.ts (the placeholder data to replace)
- apps/web/src/features/team-member-profile-page/ (the two profile layouts)

Then find and list EVERY place that queries or selects doctors, and mark which
ones must be restricted to bookable clinicians once non-clinical staff exist in
the same table. Check at minimum: the public doctors list, the public doctor
detail, the booking page doctor picker, the admin appointment forms, the admin
calendar, and the dashboard.

Produce docs/our-team-cms-implementation-notes.md containing:
1. The call-site inventory above, with a "must filter by bookable" column.
2. The exact new columns and tables you will add, with types and defaults.
3. Any place where adding a category would change existing behaviour.
4. Open questions you need answered before writing code.

Do not change any other file.
```

**Acceptance:** the notes file exists, the inventory names real files and line
numbers, and every doctor-selection surface is accounted for.

---

## Prompt 2 — Shared schemas and enums

```
Add the Our Team vocabulary to packages/shared. No API or web changes yet.

In packages/shared/src/schemas/doctors.ts (or a new team.ts if that file is
getting long — your call, state which you chose and why):

1. Add `teamCategoryValues = ['DENTIST','GENERAL_PRACTITIONER','RECEPTIONIST','ASSISTANT']`
   and a `TeamCategory` type.
2. Add `profileItemKindValues = ['EXPERIENCE','RESPONSIBILITY','TRAINING','LANGUAGE']`.
3. Add `responsibilityIconValues` matching the icons the public page already
   renders: appointments, comfort, communication, enquiries, equipment, hygiene,
   records, support, welcome. Read
   apps/web/src/features/team-member-profile-page/SupportProfileBody.tsx to
   confirm the exact list before writing it.
4. Extend createDoctorSchema / updateDoctorSchema with:
   category (default 'DENTIST'), bookable (boolean, default true),
   departmentEn/Km, teamNoteEn/Km (all optional nullable text, same
   optionalText() helper already in the file),
   profileItems: array of { kind, icon?, titleEn, titleKm, subtitleEn?,
   subtitleKm?, meta?, displayOrder } with a sane max length.
5. Add `category` as an optional filter to adminDoctorListQuerySchema and to the
   public list query.
6. Add a cross-field refinement: bookable may only be true when category is
   DENTIST or GENERAL_PRACTITIONER. A receptionist or assistant must never be
   bookable.

Export everything from packages/shared/src/index.ts following the existing export style.

Add unit tests next to the existing shared tests covering: the bookable
refinement rejecting RECEPTIONIST + bookable:true, profileItems validation, and
category defaulting.
```

**Acceptance:** `pnpm --filter @arunreah/shared test` passes; invalid
bookable/category combinations are rejected at the schema level.

---

## Prompt 3 — Migration and Drizzle schema

```
Add the database layer for Our Team categories.

1. Update apps/api/src/db/schema/doctors.ts:
   - doctors.category: text, not null, default 'DENTIST', with a CHECK
     constraint listing the four values (match the style of the existing
     doctors_status_check).
   - doctors.bookable: integer boolean, not null, default true.
   - doctors.departmentEn / departmentKm / teamNoteEn / teamNoteKm: nullable text.
   - New table doctorProfileItems: id, doctorId (FK -> doctors.id, onDelete
     cascade), kind, icon (nullable), titleEn, titleKm, subtitleEn (nullable),
     subtitleKm (nullable), meta (nullable), displayOrder, timestamps().
     Index on (doctorId), (doctorId, kind, displayOrder).
   - Add a doctors_category_idx and a (category, status, display_order) index —
     the public page queries by category.
2. Generate the migration with `pnpm --filter @arunreah/api db:generate`. Do NOT
   hand-write it unless drizzle-kit produces something wrong, and if you edit it,
   say exactly what you changed and why.
3. The migration must be additive and safe on a populated database: every
   existing row becomes category='DENTIST', bookable=true. Confirm that is what
   the generated SQL does.
4. Apply locally with `pnpm --filter @arunreah/api db:migrate:local` and confirm
   it applies cleanly.
5. Update apps/api/src/db/schema/relations.ts and index.ts to include the new table.

Never modify an existing migration file. Report the new migration's filename.
```

**Acceptance:** migration applies locally; `pnpm typecheck` passes; existing
dentist rows are untouched and default to `DENTIST` + `bookable`.

---

## Prompt 4 — Repository and service layer

```
Wire the new fields through the API data layer. No HTTP routes yet.

In apps/api/src/repositories/doctor.repository.ts:
- Persist category, bookable, department*, teamNote* in createDoctor/updateDoctor.
- Add getProfileItems(database, doctorId) and a replace-all writer that mirrors
  how expertise/education are currently replaced on update (read the existing
  code and follow it exactly — same transaction behaviour, same delete-then-insert).
- Add category + bookable filtering to listAdminDoctors and listPublicDoctors.
- Add listPublicDoctorsByCategory or a category param — whichever fits the
  existing signature better.

In apps/api/src/services/doctor.service.ts:
- Enforce the bookable rule server-side as well as in Zod: a non-clinical
  category can never be saved bookable.
- When a doctor's category changes to a non-clinical one, refuse the update if
  that doctor has appointments (reuse countAppointmentsForDoctor, and mirror the
  existing delete-protection error shape). Do not silently reassign appointments.

Add repository/service tests alongside the existing ones in apps/api/tests/.
```

**Acceptance:** `pnpm --filter @arunreah/api test` passes; a doctor with
appointments cannot be flipped to RECEPTIONIST.

---

## Prompt 5 — Admin API endpoints

```
Expose the Our Team fields through the admin API.

In apps/api/src/modules/doctors/:
- Extend the existing admin create/update/list controllers to accept and return
  category, bookable, department*, teamNote*, profileItems.
- Add ?category= filtering to the admin list endpoint.
- Add a reorder endpoint for display_order within a category, e.g.
  PATCH /api/admin/doctors/reorder taking an ordered list of ids plus the
  category. Admin drag-and-drop in Prompt 7 depends on this. Keep it guarded by
  requirePermission('CMS_MANAGEMENT') like every other admin doctor route.

Extend apps/api/tests/doctor-routes.integration.test.ts with coverage for:
- creating each of the four categories,
- the bookable refinement being rejected with a 4xx and the shared error code,
- category filtering on the list endpoint,
- reordering.

Do not change the public endpoints in this prompt.
```

**Acceptance:** integration tests cover all four categories; no stack traces or
database details leak in error responses.

---

## Prompt 6 — Public API

```
Serve the four categories to the public site.

- Extend the public doctors list response with category, bookable, department,
  and the profile items the public pages need, in the visitor's language only
  (follow the existing EN/KM resolution in the public mappers — the API returns
  resolved strings, not both languages).
- Keep /api/public/doctors backward compatible: with no category param it still
  returns everything, ordered by category then display_order.
- Support ?category=DENTIST etc.
- Extend the public doctor detail endpoint with the same fields so the profile
  pages can render from it.

Update apps/web/src/services/public-content.ts types to match.

Extend the public integration tests. Confirm DRAFT and ARCHIVED records stay
invisible to the public endpoints for every category, not just dentists.
```

**Acceptance:** `curl` of `/api/public/doctors?lang=km&category=RECEPTIONIST`
returns Khmer strings; unpublished staff never appear.

---

## Prompt 7 — Admin list UI: one Team workspace, four categories

```
Give the admin a single Team workspace instead of a Doctors-only page.

Reference files — match their patterns, do not reinvent:
- apps/web/src/features/admin-doctors-page/AdminDoctorsPage.tsx
- apps/web/src/components/admin/admin-list.tsx, admin-form.tsx, admin-feedback.tsx
- apps/web/src/features/admin-auth/admin-navigation.ts
- apps/web/src/styles/admin.css

Build:
1. Category tabs across the top: All / Dentists / General Practitioners /
   Receptionists / Assistants, each with a live count. Tabs drive the ?category
   filter and are reflected in the URL so a filtered list is linkable.
2. Keep the existing search, status filter, and pagination working alongside the
   category filter.
3. Each row shows portrait, name (EN + KM), role, category badge, status badge,
   and a bookable indicator for clinical rows only.
4. Drag-to-reorder within a single category, persisting via the Prompt 5 reorder
   endpoint. Reordering must be disabled while the list is filtered to "All" —
   explain that in the UI rather than silently doing nothing.
5. Empty states per category that tell the admin what to add and link to the
   create form with the category preselected.
6. Update the admin sidebar: rename the Doctors group to Team, with children
   Team Management and Add Team Member. Keep the existing /admin/doctors routes
   working (redirect or alias) so nothing bookmarked breaks.

UX rules: optimistic updates with rollback on failure, a visible saving state,
and the existing admin toast/feedback components for every outcome. No layout
shift when switching tabs.
```

**Acceptance:** all four categories are reachable in two clicks; reorder
persists across reload; existing `/admin/doctors` links still resolve.

---

## Prompt 8 — Admin create/edit form, category-aware

```
Make one team-member form that adapts to the selected category.

Start from apps/web/src/features/admin-add-doctor-page/AdminAddDoctorPage.tsx
and apps/web/src/features/admin-doctors-page/ (the edit flow). Reuse
MediaUploader and the image framing dialog for portraits exactly as they work now.

Shared fields for every category: category selector, name EN/KM, slug (with the
existing auto-generate behaviour), role title EN/KM, short intro EN/KM, about
EN/KM, portrait, status, featured, branches, display order.

Category-conditional sections:
- DENTIST: unchanged from today — expertise, education, related doctors, stats,
  bookable (default on).
- GENERAL_PRACTITIONER: education (as medical qualifications), expertise (as
  areas of medical care), EXPERIENCE profile items, bookable toggle.
- RECEPTIONIST: RESPONSIBILITY items (with icon picker), LANGUAGE items.
  Bookable is forced off and the control is not rendered.
- ASSISTANT: RESPONSIBILITY items (with icon picker), TRAINING items, department,
  team note. Bookable forced off.

Requirements:
- One generic, reusable repeater component for profile items: add, remove,
  reorder, bilingual fields, optional icon. Used by all four item kinds.
- The icon picker shows the actual rendered icon, not a text value.
- Changing category must not silently delete data the admin already entered —
  warn before hiding a populated section, and keep the data unless they confirm.
- Keep useUnsavedChangesGuard wired up.
- Field-level validation messages from the shared Zod schemas, not ad-hoc strings.
- A live preview panel, or at minimum a "View public profile" link for published
  records.

Add tests for the payload builder like the existing
features/admin-doctors-page/doctor-payload.test.ts.
```

**Acceptance:** an admin can create one of each category end to end; switching
category never loses typed data without a confirmation.

---

## Prompt 9 — Booking integrity sweep

```
Prove that non-clinical staff can never be booked.

Using the call-site inventory from docs/our-team-cms-implementation-notes.md,
go through every place a doctor can be selected and filter it to bookable
clinicians:
- the public booking page doctor picker,
- admin appointment create/edit,
- the admin calendar,
- the dashboard,
- any notification or email template that names a doctor.

Then add tests that fail if this regresses:
- API: POST an appointment with a RECEPTIONIST's id and assert it is rejected
  with the correct shared error code.
- API: the booking doctor list endpoint never returns non-bookable records.

Also confirm: changing an existing bookable dentist to a non-clinical category is
refused when appointments exist (added in Prompt 4) and that the error surfaces
clearly in the admin UI.
```

**Acceptance:** a deliberately crafted request naming a receptionist is rejected
by the API, not just hidden in the UI.

---

## Prompt 10 — Replace the public placeholders with CMS data

```
Retire the hard-coded placeholder team.

apps/web/src/features/doctors-page/team-directory.ts currently holds nine
invented staff records plus the category copy. Replace the DATA with API data
and keep the category copy (eyebrows, titles, descriptions) as static UI copy.

- Map the public API response into the existing TeamMember / TeamMemberProfile
  types. Keep the discriminated union: category DENTIST/GENERAL_PRACTITIONER ->
  clinical layout, RECEPTIONIST/ASSISTANT -> support layout, supportKind derived
  from category.
- Delete the hard-coded placeholder collection entirely. No invented people may remain in the
  codebase.
- findTeamMemberProfile must resolve from fetched data, so the profile route
  needs the data loaded — follow the existing useDoctorsPageQuery /
  useDoctorDetailPageQuery pattern rather than inventing a new one.
- Sections with no published members must not render an empty heading.
- Keep the existing loading skeletons and error states working for all four
  sections.
- Update apps/web/src/features/doctors-page/team-directory.test.ts: the data
  tests become mapper tests.

Verify in the browser at 1440 and 390 in both EN and KM.
```

**Acceptance:** search `apps/web/src` for every known placeholder staff name and confirm there are no matches.
returns nothing; all four sections render from the API.

---

## Prompt 11 — Seed, QA, and handover

```
Final pass.

1. Write apps/api/scripts/seed-team-members.sql following the style of the
   existing seed-service-detail-content.sql, creating one realistic example per
   non-dentist category so a fresh environment is not empty. Mark clearly in a
   comment that these are examples to be replaced, and do NOT run it against
   staging or production.
2. Full regression: the public Our Team page, all four profile layouts, the
   dentist profile, the booking flow, and the admin Team workspace.
3. Accessibility: re-run a contrast check over the admin Team pages. Accent text
   must use #0d7596, not #3695B9 — see the audit already applied to the public
   pages.
4. Responsive check at 1440 / 768 / 390 for the admin list and form.
5. Update docs/ with a short admin-facing note: how to add each category, what
   bookable means, and which fields appear for which role.
6. Confirm no secrets, no .env changes, and no modified historical migrations.

Report a final summary: what shipped, what is still placeholder, and any known gaps.
```

**Acceptance:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all green;
docs updated; no invented staff anywhere in the repo.

---

## Guardrails to repeat if a session drifts

- Do not rename the `doctors` table or `appointments.doctor_id`.
- Do not edit a migration that has already been applied.
- Do not let a non-clinical category be bookable, in the schema, the service, or the UI.
- Do not invent staff names, credentials, licences, or languages — placeholders
  must be obviously generic and flagged.
- Do not change the public dentist card or dentist profile layout; they are the
  design-system reference.
- Bilingual EN/KM for every admin-entered string. Khmer is not optional.

## Suggested commit sequence

`feat(shared)` -> `feat(db)` -> `feat(api)` -> `feat(api)` -> `feat(api)` ->
`feat(cms)` -> `feat(cms)` -> `fix(booking)` -> `feat(web)` -> `chore(qa)`

One prompt, one commit, one reviewable diff.
