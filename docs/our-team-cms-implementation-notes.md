# Our Team CMS implementation notes

Read-only audit of the current working tree on 2026-10-08. This document is a
plan, not an implementation. The repository already contains partial,
uncommitted schema/shared-model work for categories; the repository, service,
API response, and web UI layers do not yet implement it end to end.

## Current doctors-domain flow

The domain follows the expected layering:

`doctor.route.ts` -> `doctor.controller.ts` -> `doctor.service.ts` ->
`doctor.repository.ts` -> Drizzle/D1.

- Public routes are `GET /api/public/doctors` and
  `GET /api/public/doctors/:slug`. The controller validates query parameters
  with `publicDoctorQuerySchema`, asks the service for localized data, applies
  public CMS caching, and wraps the result in `successResponse`.
- Admin CRUD is under `/api/admin/doctors` and is protected at the router level
  by `requireAdmin` and `requirePermission('CMS_MANAGEMENT')`. Request bodies
  and list queries are parsed through shared Zod schemas.
- `doctor.service.ts` owns slug conflicts, nested-ID validation, localization,
  admin/public response shaping, image-presentation lookup, and delete
  protection. It currently does not expose the new category/profile fields or
  enforce the partially added bookable/category invariant.
- `doctor.repository.ts` stores the core row plus ordered expertise, education,
  related-doctor, and branch rows in a transaction. Related collections are
  replaced wholesale on update. The partially added `profileItems` input is
  not excluded from the core row and has no read/write repository functions
  yet.
- Existing public list behavior is `status = PUBLISHED`, ordered by
  `display_order, id`. Public detail is a published slug plus expertise,
  education, published related doctors, branches, and image presentation.
- Existing admin list behavior supports status, featured, specialty, search,
  sorting, and pagination. Although the shared query schema now accepts
  `category`, the repository does not apply it.
- The web client in `services/public-content.ts` has one unscoped
  `getPublicDoctors(language)` function. The homepage, About page, Our Team
  page, and booking page all share it. The doctor-detail client is separate.
- Admin doctor types/mappers/forms still model a dentist only. They omit
  `category`, `bookable`, department/team-note fields, and profile items.
- `team-directory.ts` supplies unverified placeholder records for general
  practitioners, receptionists, and assistants. Dentists come from the API.
  `/team/:memberSlug` resolves only those placeholders. Its two render paths
  are:
  - clinical: biography, qualifications, experience, areas of care, optional
    appointment CTA;
  - support: biography, responsibilities, optional languages/training/team
    connection, and no personal booking CTA.

## 1. Doctor query and selection call-site inventory

“Must filter by bookable” means the candidate set must require
`doctors.bookable = true` in addition to any publication/archival rule. A
historical appointment read must not discard a doctor merely because the
current profile is no longer bookable.

### API and database call sites

| Call site | Current behavior | Must filter by bookable? | Required treatment |
| --- | --- | --- | --- |
| `doctor.repository.ts` — `findDoctorById` | Reads any doctor/team row by ID. Used by admin CRUD and public appointment validation. | No at repository primitive; **yes at the appointment service call site** | Keep the generic lookup. Validate `status === 'PUBLISHED' && bookable === true` in `createPublicAppointmentRequest` so a crafted request cannot book support staff or a non-bookable clinician. |
| `doctor.repository.ts` — `findDoctorBySlug` | Reads any row by slug for admin conflict checks. | No | Slug uniqueness is global across all team categories. |
| `doctor.repository.ts` — `findPublicDoctorBySlug` | Reads any published row by slug. | No | This should become the published team-member detail lookup. Return category/bookable and render the proper layout; hide booking actions when `bookable` is false. If `/doctors/:slug` must remain clinician-only, enforce that in the route contract rather than making the shared member lookup unusable by `/team/:slug`. |
| `doctor.repository.ts` — `listPublicDoctors` | Reads every published row, ordered by display order. It currently ignores the parsed `scope` and `category`. | Conditional | Accept a typed public query. `scope=all` is the Our Team directory; clinical/booking consumers must require `bookable = true`. An explicit category filters the directory category. |
| `doctor.repository.ts` — `listAdminDoctors` / count query | Reads and counts all admin-visible rows; filters do not yet include the accepted `category`. | No | Admin CMS must manage every category. Add the category condition but do not force bookable. |
| `doctor.repository.ts` — `getRelatedDoctors` | Joins self-relations to the related doctor rows; public service later removes unpublished rows. | No, pending related-content decision | Preserve published team profiles. Decide whether relations mean “related clinicians” or “more from this category” before adding category/bookable constraints. |
| `doctor.repository.ts` — `doctorsExist` | Validates related IDs exist. | No | It is integrity validation, not an appointment candidate list. Add category compatibility only if the related-content decision requires it. |
| `doctor.repository.ts` — `countAppointmentsForDoctor` | Counts historical appointment references for delete protection. | No | Also use it when an edit would change a previously referenced row to `bookable=false` or a non-clinical category, if that transition is to be prohibited. |
| `doctor.repository.ts` — branch, expertise, education lookups | Select child rows for known doctor IDs. | No | These do not choose appointment candidates. Add an equivalent profile-items lookup. |
| `appointment.service.ts` — `createPublicAppointmentRequest` | Loads `input.doctorId` with `findDoctorById`; rejects only missing/unpublished rows. | **Yes — mandatory server-side boundary** | Reject every supplied doctor ID that is not both published and bookable. UI filtering alone is not authorization/validation. |
| `appointment.repository.ts` — appointment-detail left join to `doctors` | Reads the current doctor record alongside an appointment snapshot. | No | Historical appointments must remain readable after unpublishing, archiving, or making a person non-bookable. |
| `appointment.repository.ts` — appointment list `doctorId` predicate | Filters appointments by their stored doctor FK. | No | This is a historical appointment filter, not a candidate selector. |
| `dashboard.repository.ts` — `getContentDashboardSummary` | Counts every row in `doctors` by publication status. | Decision required | If the card remains “Doctors”, filter to bookable clinicians. If it becomes “Team members”, count all categories and rename the contract/UI. Prefer per-category counts if operationally useful. |
| `media.repository.ts` — doctor `photoKey` reference check | Prevents deletion of R2 media referenced by any doctor/team row. | No | It must cover every category. |
| Image-presentation owner lookups in `doctor.service.ts` | Select presentation rows for known doctor IDs. | No | They do not select candidates. |

### Web/public and web/admin call sites

| Call site | Current behavior | Must filter by bookable? | Required treatment |
| --- | --- | --- | --- |
| `services/public-content.ts` — `getPublicDoctors` | Calls `/api/public/doctors?lang=...`; cannot send `scope` or `category`. | Conditional | Add typed scope/category options and include them in query/cache keys. Do not rely on client-side filtering for booking safety. |
| `features/doctors-page/use-doctors-page.ts` + `DoctorsPage.tsx` | Fetches the public list; API doctors fill only the Dentists section while three sections use placeholders. | **No** | Request `scope=all`, group response rows by category, and replace every placeholder group. This is the full public Our Team directory. |
| `features/doctor-detail-page/use-doctor-detail-page.ts` | Fetches `/api/public/doctors/:slug` and always maps the dentist detail layout. | No for visibility; booking CTA must use `bookable` | Keep published non-bookable clinician profiles visible. Prevent support rows from being rendered as dentists; category should determine `/doctors` versus `/team` layout/URL behavior. |
| `features/team-member-profile-page/TeamMemberProfilePage.tsx` | Does not query the API; resolves placeholder data through `findTeamMemberProfile`. | No | Replace lookup with published CMS detail data. Select clinical/support layout from category and select appointment CTA from `bookable`. |
| `features/book-appointment-page/use-book-appointment-page.ts` + `BookAppointmentPage.tsx` + `mapBookingOptions` | Uses the unscoped public list, then filters only by branch. | **Yes** | Fetch only published, bookable clinicians. Keep branch filtering as a second constraint. The submitted ID is revalidated by the API. |
| `features/landing-page/use-landing-page.ts` | Uses the public list for the homepage “doctors/specialists” carousel. | **Yes under the current doctor/specialist semantics** | Request the bookable/clinical scope. If the product wants non-bookable clinicians featured here, define a separate clinical scope rather than overloading `bookable`. |
| `features/about-page/use-about-page.ts` | Chooses the first two featured rows (or first rows) as clinic leadership portraits. | **Yes under the current doctor-leadership semantics** | Apply the intended clinical scope before `featured`. If leadership may include support staff, make that an explicit product decision/flag instead. |
| `services/admin-doctors.ts` + `use-admin-doctors-page.ts` + `AdminDoctorsPage.tsx` | Lists all admin doctors and fetches one detail. Related IDs are edited as raw text. | No for the CMS list/detail | This becomes team management. Add category filtering and all new fields. A future related-member picker may need a category rule, but not an unconditional bookable rule. |
| `services/admin-add-doctor.ts` + `AdminAddDoctorPage.tsx` | Creates dentist-shaped records only; omitted category/bookable would use defaults. | No | Add an explicit category and bookable choice. Selecting receptionist/assistant must set `bookable=false`; otherwise the shared default `true` correctly makes validation fail. |
| `services/admin-calendar.ts` — `cmsApi.doctors.list` | Loads up to 100 non-archived rows by name; public-list fallback is also unscoped. | **Yes for new-appointment choices; no for historical filters** | Return structured IDs/names, not just names. Build a published+bookable candidate list for creation. Keep snapshot/current names from loaded appointments in a separate historical filter list. Do not merge both lists into the create modal. |
| `AdminCalendarPage.tsx` — `doctorOptions` and `modalDoctors` | Merges CMS names, appointment snapshots, and locally created names; the merged list feeds both filtering and creation. | **Yes for `modalDoctors`; no for calendar filtering** | Split these two option sets. The current merge can reintroduce archived/non-bookable people into the create form. |
| `AdminCalendarPage.tsx` — `NewAppointmentDialog` | Selects a doctor name and creates only local UI state; no doctor ID or persisted admin appointment API call. | **Yes** | Only offer published bookable IDs. Persisting admin-created appointments is a separate product/API scope and must not be invented in this change. |
| `features/admin-appointments/AppointmentList.tsx` + `services/appointments.ts` | Reads appointment doctor snapshots/current IDs; current UI has status/search filters but no doctor picker. | No | Historical display/filtering should retain all referenced doctors. If a doctor filter is added, it filters stored appointments, not bookable candidates. |
| `services/admin-all-appointments.ts` | Contains unused hard-coded demo doctor names; the routed page uses `AppointmentList` instead. | No query present | Do not treat this as live data. Remove it only in a separately scoped cleanup. |
| `features/admin-dashboard-page/AdminDashboardPage.tsx` | Displays the API doctors content metric. | Inherits dashboard decision | Keep it in sync with the API contract and label (“Doctors” vs “Team members”). |
| `services/public-page-mappers.ts` | Converts list/detail doctors into homepage, doctors-page, detail, and booking view models. | Inherits its caller; booking mapping must be bookable-only | Add category/bookable fields and category-aware profile URLs. Mappers are not the primary security filter. |

## 2. Exact additive database shape

The following is the exact shape already represented by the uncommitted
`apps/api/migrations/0024_team_categories.sql` and Drizzle schema. No existing
applied migration should be edited.

### New columns on `doctors`

| SQL column | Drizzle/application type | Nullability | SQL default | Purpose |
| --- | --- | --- | --- | --- |
| `category` | `text`; enum `DENTIST | GENERAL_PRACTITIONER | RECEPTIONIST | ASSISTANT` | `NOT NULL` | `'DENTIST'` | Public section and profile-layout discriminator. |
| `bookable` | `integer`; Drizzle boolean | `NOT NULL` | `1` | Whether the row may be attached to a new appointment. Only dentist/GP categories may be true. |
| `department_en` | `text` | nullable | none | English department/clinical-area label. |
| `department_km` | `text` | nullable | none | Khmer department/clinical-area label. |
| `team_note_en` | `text` | nullable | none | English “working with the team” copy. |
| `team_note_km` | `text` | nullable | none | Khmer “working with the team” copy. |

New indexes:

- `doctors_category_idx` on `(category)`;
- `doctors_category_status_order_idx` on
  `(category, status, display_order)`.

Existing rows backfill implicitly to `category='DENTIST'` and `bookable=1`.
The additive SQLite migration cannot add a table-level CHECK to the existing
`doctors` table. Therefore category validity and “bookable only for dentist/GP”
must be enforced by shared Zod validation and again by the service after
combining a patch with the stored row. If a hard D1 guarantee is required, use
a new migration containing triggers or a deliberate table rebuild; do not edit
an applied migration.

### New table `doctor_profile_items`

| SQL column | Type | Nullability/default | Meaning |
| --- | --- | --- | --- |
| `id` | `text` primary key | `NOT NULL` | UUID generated by the API. |
| `doctor_id` | `text` FK -> `doctors.id` | `NOT NULL`; `ON UPDATE CASCADE ON DELETE CASCADE` | Owning team member. |
| `kind` | `text` | `NOT NULL` | `EXPERIENCE | RESPONSIBILITY | TRAINING | LANGUAGE`. |
| `icon` | `text` | nullable | Required for `RESPONSIBILITY`; null for all other kinds. Shared schema values: `appointments`, `comfort`, `communication`, `enquiries`, `equipment`, `hygiene`, `records`, `support`, `welcome`. |
| `title_en` | `text` | `NOT NULL` | English role/responsibility/training/language label. |
| `title_km` | `text` | `NOT NULL` | Khmer equivalent. |
| `subtitle_en` | `text` | nullable | English organisation, responsibility description, or training detail. |
| `subtitle_km` | `text` | nullable | Khmer equivalent. |
| `meta` | `text` | nullable | Confirmed period/year label; not localized in the current design. |
| `display_order` | `integer` | `NOT NULL DEFAULT 0` | Order within a kind. |
| `created_at` | `text` | `NOT NULL DEFAULT strftime(...)` | Existing `timestamps()` convention. |
| `updated_at` | `text` | `NOT NULL DEFAULT strftime(...)` | Existing `timestamps()` convention. |

Constraints and indexes:

- CHECK that `kind` is one of the four allowed values;
- CHECK that responsibility rows have an icon and all other kinds do not;
- `doctor_profile_items_doctor_id_idx` on `(doctor_id)`;
- `doctor_profile_items_doctor_kind_order_idx` on
  `(doctor_id, kind, display_order)`.

No additional category table is proposed: the four categories are a fixed
product enum with static bilingual UI labels, not CMS-authored content.
Existing `doctor_education`, `doctor_expertise`, `doctor_related_doctors`, and
`doctor_branches` remain in place.

## 3. Behavior changed by adding category/bookable

1. **Public query semantics change.** `publicDoctorQuerySchema` already parses
   `scope` (default `clinical`) and optional `category`, but the controller
   currently passes only `lang` and the repository ignores both fields. Adding
   category rows before wiring this through would expose every published staff
   row to all current list consumers.
2. **Appointment acceptance changes.** Today any published doctors-table row is
   accepted by a crafted public appointment POST. The service must add the
   bookable check before non-clinical records can be published.
3. **Existing rows become bookable dentists.** The migration defaults preserve
   current dentist behavior. New receptionist/assistant creation must override
   `bookable` to false.
4. **Partial updates need stored-state validation.** Shared Zod can reject
   `{category:'RECEPTIONIST', bookable:true}` but intentionally accepts a patch
   containing only one of those fields. The service must merge the patch with
   the existing row and validate the resulting pair.
5. **Current repository writes are incomplete.** `profileItems` is part of the
   shared input but is not stripped from the core doctor row or replaced in its
   own table. Category/profile fields are also omitted from every service
   response mapper.
6. **The public page changes from dentist list to team directory.** API rows
   must replace all placeholder records, be grouped into four fixed categories,
   and link to category-appropriate profile routes/layouts.
7. **Profile content becomes category-dependent.** Dentist/GP rows use the
   clinical layout; receptionist/assistant rows use the support layout.
   `bookable`, not layout alone, controls the appointment CTA.
8. **`featured` becomes ambiguous.** It currently affects the homepage doctor
   carousel and About leadership portraits. A featured support row would alter
   those surfaces unless their queries remain bookable/clinical or the product
   introduces a separate leadership/homepage flag.
9. **Dashboard counts change meaning.** The current `doctors` total will become
   an all-team total. The label/contract or query must change deliberately.
10. **Admin doctor management becomes team management.** List labels, filters,
    add/edit fields, validation messages, and bilingual profile-item editors
    must handle all categories. Existing API authorization remains correct and
    must remain enforced server-side.
11. **Admin calendar behavior must split.** Historical doctor filters may show
    archived/non-bookable snapshot names, while new appointment candidates
    must not. The current shared name list cannot satisfy both rules.
12. **Related profiles may cross categories.** Existing related-doctor IDs
    accept any doctors-table row. Adding categories changes “Other specialists”
    unless a category rule is defined.
13. **Reclassification can conflict with appointment history.** Deletion is
    blocked when appointments exist, but changing category/bookable is not.
    Whether to allow it must be decided; historical snapshots remain valid
    either way.
14. **Public URLs can diverge.** Existing dentists use `/doctors/:slug`; new
    placeholder staff use `/team/:slug`. Once both come from one table, URL
    generation and direct-route guards must be category-aware.
15. **Cache identity changes.** Public doctor query keys currently vary only by
    language. Scope/category must be included or React Query can serve an
    all-team response to a booking consumer (or vice versa).
16. **Branch assignments apply to more than dentists.** Unless restricted,
    every staff category can have `doctor_branches` rows. This is useful for a
    directory but should not make a non-bookable member appear in a booking
    picker.

## 4. Open questions before implementation

1. **Dashboard meaning:** should the CMS dashboard card become “Team members”
   and count all four categories, remain “Doctors” and count only bookable
   clinicians, or show per-category counts?
2. **Homepage/About semantics:** does `featured` mean featured anywhere across
   the team, or only in doctor/clinical surfaces? May a non-bookable clinician
   appear in the homepage carousel or About leadership portraits? A separate
   flag may be clearer if leadership and homepage featuring differ.
3. **Profile URLs:** should `/doctors/:slug` remain for dentists and
   `/team/:slug` serve the other categories, or should `/team/:slug` become the
   canonical route for everyone with redirects for existing dentist URLs?
4. **Related members:** should related IDs be limited to published bookable
   clinicians, limited to the same category, or allowed across the whole team?
   This determines both API validation and the admin picker.
5. **GP content mapping:** should `doctor_education` continue to hold GP
   qualifications while `EXPERIENCE` profile items hold role/organisation/
   period, as the current partial schema implies?
6. **Reclassification policy:** may an existing clinician with appointment
   history be changed to `bookable=false` or a support category? Allowing it is
   compatible with snapshots, but the UI must clearly distinguish historical
   assignments from new eligibility. Blocking it would reuse
   `countAppointmentsForDoctor`.
7. **Admin calendar scope:** this screen's “New Appointment” flow currently
   creates client-only state and sends no API request. Is this task limited to
   making its picker safe, or is a real admin-created appointment workflow a
   separately authorized feature?
8. **Category ordering:** should the fixed order remain Dentist, General
   Practitioner, Receptionist, Assistant, with `display_order` applied only
   inside each category?
9. **Profile-item limits:** are the current shared maximum of 24 total items and
   the existing 10-item limits for expertise/education acceptable for real
   clinic content?
10. **Database-level bookable guarantee:** are Zod plus service checks
    sufficient, or is a new trigger migration required because SQLite cannot
    add the desired CHECK constraint additively?

## Verification for this audit

- Read the requested schema, repository, service, route/controller, shared
  schema, admin service/pages, placeholder directory, and both profile layout
  implementations.
- Searched `apps/api/src`, `apps/web/src`, and `packages/shared/src` for direct
  doctors-table selects/joins, public/admin doctor API calls, and doctor
  appointment selectors.
- No typecheck, lint, test, or build command was run because this was a
  read-only planning task and those commands can create generated/cache output.
- No application, migration, configuration, or test file was changed. Only
  this notes file was replaced.
