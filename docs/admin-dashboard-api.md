# Admin Dashboard API

`GET /api/admin/dashboard` requires an authenticated admin session and returns
only the sections granted by the server-side role. It is always private:
`Cache-Control: private, no-store`.

| Role           | Returned sections                               |
| -------------- | ----------------------------------------------- |
| `RECEPTIONIST` | `appointments`, `recentAppointments`            |
| `CMS_ADMIN`    | `content`                                       |
| `SUPER_ADMIN`  | `appointments`, `recentAppointments`, `content` |

The request never accepts a client-selected role. Query parameters such as
`?role=SUPER_ADMIN` have no effect.

## Appointment summary

`appointments` contains numeric values:

- `pending`: all records whose status is `PENDING`.
- `confirmedToday`: records whose status is `CONFIRMED` and whose
  `preferred_date` is today in `Asia/Phnom_Penh`.
- `confirmedThisWeek`: records whose status is `CONFIRMED` and whose
  `preferred_date` falls between Monday and Sunday in `Asia/Phnom_Penh`.

`recentAppointments` has at most five rows, ordered by `created_at DESC`. Each
row contains only `id`, `reference`, `patientName`, `serviceNameSnapshot`,
`preferredDate`, `preferredTime`, `status`, and `createdAt`.

## Content summary

`content` provides a metric for each of `services`, `doctors`, `showcases`, and
`branches`. Each metric contains `total`, `published`, `draft`, and `archived`.
`total` is the count of all remaining canonical rows; deleted records are not
included.

## Query strategy

- Appointment-capable roles use one aggregate query for all appointment metrics
  and one indexed `created_at DESC` query for the five recent rows.
- CMS-capable roles use four independent aggregate queries, one per content
  table, executed in parallel.
- Existing appointment status/date/created-at and content status indexes are
  reused. No migration or new index is required.
