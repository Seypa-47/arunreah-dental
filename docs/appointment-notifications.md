# Appointment notifications

`POST /api/public/appointments` persists a request as `PENDING` first. Only
after the D1 insert succeeds does the appointment service call the reusable
notification service. Notification delivery is operationally useful but does
not determine whether the request succeeded for the patient.

## Providers

- Email is the primary channel when `EMAIL_NOTIFICATIONS_ENABLED=true` and all
  email configuration is present. The Worker sends through Resend's HTTP API.
- Telegram is an independent secondary channel when
  `TELEGRAM_NOTIFICATIONS_ENABLED=true` and its configuration is present.
- The service invokes enabled providers independently. A failure in one does
  not prevent the other from running.

Provider credentials are Worker secrets, never CMS data or frontend variables:

```text
RESEND_API_KEY
TELEGRAM_BOT_TOKEN
```

Non-secret configuration:

```text
EMAIL_NOTIFICATIONS_ENABLED=true|false
EMAIL_NOTIFICATION_RECIPIENT=appointments@clinic.example
EMAIL_FROM_ADDRESS=Arunreah Dental <appointments@clinic.example>
TELEGRAM_NOTIFICATIONS_ENABLED=true|false
TELEGRAM_CHAT_ID=-1001234567890
```

Set `EMAIL_NOTIFICATIONS_ENABLED=false` and
`TELEGRAM_NOTIFICATIONS_ENABLED=false` locally unless deliberately testing a
provider with safe test credentials. Automated tests mock all provider HTTP
requests and never send real messages.

## Payload and privacy

Providers receive only the operational appointment DTO: reference, patient
contact details, service/doctor/branch snapshots, preferred date/time, notes,
and creation time. Email includes `Status: PENDING` and states that clinic
review is required. Telegram is sent as plain text to avoid format injection.

Failures are logged only with `appointmentReference`, provider name, and a safe
error category. Patient contact details, notes, raw provider responses, and
credentials are never logged by the notification service.

## Failure policy

| Condition                              | Result                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| D1 insert fails                        | No notification is attempted; the API returns an error.                         |
| D1 insert succeeds; one provider fails | Appointment remains `PENDING`; other enabled provider still runs.               |
| D1 insert succeeds; all providers fail | Appointment remains `PENDING`; patient receives normal request acknowledgement. |

The current implementation deliberately has no queue or automatic retries.
Operational retries and a notification audit trail can be added later if the
clinic needs them.
