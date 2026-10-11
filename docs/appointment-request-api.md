# Public appointment request API

`POST /api/public/appointments` creates a clinic **request**, never a confirmed
appointment. Every successful new submission has status `PENDING`.

## Request

Send JSON with:

```json
{
  "patientName": "Sok Dara",
  "phone": "+855 12 345 678",
  "email": "patient@example.com",
  "serviceId": "UUID",
  "doctorId": "UUID or null",
  "branchId": "UUID",
  "preferredDate": "2026-09-15",
  "preferredTime": "10:30",
  "notes": "Optional plain-text note",
  "idempotencyKey": "UUID",
  "turnstileToken": "required outside local development"
}
```

`doctorId` may be omitted or `null` for **No Preference**. `idempotencyKey` must
be a newly generated UUID for each user intent; reuse the same key only when
retrying the same submission.

## Response

```json
{
  "success": true,
  "data": {
    "reference": "AR-20260831-ABC123",
    "status": "PENDING"
  }
}
```

The frontend owns the English/Khmer acknowledgement copy. It must state that
the request was received and will be reviewed; it must not state that an
appointment is confirmed or scheduled.

## Protection and lifecycle

- Only published services and doctors are selectable; doctors remain optional.
- Branches must be published and accept appointments.
- Dates are compared against Cambodia (`Asia/Phnom_Penh`) local date; times use
  `HH:mm`.
- Public validated submissions are limited to 10 requests per IP per 15
  minutes. Cloudflare Turnstile is required in staging/production.
- The Worker stores English service/doctor/branch names as immutable snapshot
  fields. Later CMS renames do not alter historical appointment records.
- The appointment saves before the notification hook runs. Notification failure
  is logged with the reference only and never deletes a valid request.
