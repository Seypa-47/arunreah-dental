# Admin Appointment Inbox API

All endpoints require an authenticated `RECEPTIONIST` or `SUPER_ADMIN` session.
`CMS_ADMIN` receives `403 FORBIDDEN`. Responses use the standard API envelope
and are sent with `Cache-Control: private, no-store`.

## Inbox list

`GET /api/admin/appointments`

Supported query parameters:

```text
page=1                  default 1
limit=20                default 20, maximum 100
search=...              reference, patient name, phone, or email
status=PENDING
serviceId=<uuid>
doctorId=<uuid>
branchId=<uuid>
fromDate=YYYY-MM-DD
toDate=YYYY-MM-DD
sort=createdAt|preferredDate|updatedAt|status
order=asc|desc
```

The default is newest first: `sort=createdAt&order=desc`. The response returns
only lightweight table data plus `meta.page`, `meta.limit`, `meta.total`, and
`meta.totalPages`; it deliberately excludes notes from list rows.

## Detail

`GET /api/admin/appointments/:id`

The response includes patient contact data, preferred date/time, notes, status,
and the stored Service/Doctor/Branch snapshot names. `doctor` is `null` when
the patient selected **No preference**. Current CMS records are included when
available, but their absence or unpublished state never prevents viewing the
historical appointment snapshot.

## Status update

`PATCH /api/admin/appointments/:id/status`

```json
{ "status": "CONFIRMED" }
```

Allowed transitions are:

```text
PENDING   -> CONFIRMED | CANCELLED
CONFIRMED -> COMPLETED | CANCELLED
```

Submitting the current status again is safe and returns the existing record.
Transitions from `COMPLETED` or `CANCELLED` to another status return
`409 CONFLICT`. Successful updates record `updated_at`, `status_updated_at`,
and the authenticated admin ID. Status updates do not send patient/provider
notifications in this scope.
