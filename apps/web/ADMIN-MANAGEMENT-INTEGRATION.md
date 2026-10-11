# Admin Management Integration

The Admin Management page is available at `/admin/admins` only to an authenticated `SUPER_ADMIN`.

It uses the existing cookie-authenticated API endpoints:

- `GET /api/admin/admins` — list safe staff-account fields.
- `POST /api/admin/admins` — create a staff account.
- `PATCH /api/admin/admins/:id` — update supported account fields, including active status.

The current backend does not provide a detail or delete endpoint, so the UI does not invent either operation. It uses the list response as the backend’s canonical editable record representation.

Passwords are sent only once in the create request, never cached, stored in browser storage, displayed after submission, or placed in a `VITE_*` setting. The server remains responsible for duplicate-email checks and protections that prevent removal, demotion, or deactivation of the final active super administrator.

For staging, the deployed frontend and API must use HTTPS and compatible same-site cookie settings. No API secrets, passwords, D1 credentials, R2 credentials, or Worker secrets belong in `VITE_*` variables.
