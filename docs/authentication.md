# Admin authentication and RBAC

## Roles

| Permission group       | Allowed roles                 |
| ---------------------- | ----------------------------- |
| Appointment management | `RECEPTIONIST`, `SUPER_ADMIN` |
| CMS management         | `CMS_ADMIN`, `SUPER_ADMIN`    |
| Admin management       | `SUPER_ADMIN`                 |

The backend is the authorization boundary. Frontend navigation may hide routes,
but it must not be treated as permission enforcement.

## Endpoints

| Endpoint                      | Access               |
| ----------------------------- | -------------------- |
| `POST /api/auth/login`        | Public, rate-limited |
| `POST /api/auth/logout`       | Authenticated admin  |
| `GET /api/auth/me`            | Authenticated admin  |
| `GET /api/admin/admins`       | `SUPER_ADMIN` only   |
| `POST /api/admin/admins`      | `SUPER_ADMIN` only   |
| `PATCH /api/admin/admins/:id` | `SUPER_ADMIN` only   |

Future appointment routes must use `requirePermission('APPOINTMENT_MANAGEMENT')`.
Future CMS and upload routes must use `requirePermission('CMS_MANAGEMENT')`.

## Sessions

Sessions are opaque, random 256-bit tokens held only in an HttpOnly cookie.
Only a SHA-256 hash is persisted in `admin_sessions`. Each request resolves the
current active admin record, so role changes and account deactivation take effect
without trusting stale role data in a session.

Cookies use `HttpOnly`, `SameSite=Lax`, `Path=/`, a seven-day expiry, and
`Secure` outside the development environment. This assumes Pages and Worker API
will be deployed as same-site HTTPS subdomains. If that changes, review cookie
and CORS settings before deployment.

## Frontend session integration

The web app resolves the current session through `GET /api/auth/me` and keeps
only the safe admin identity (`id`, `name`, `email`, and `role`) in React Query
memory. It never stores a password or session token in local storage/session
storage; the browser manages the HttpOnly cookie.

`/admin/*` routes redirect signed-out visitors to `/admin/login`, then return
them only to a safe admin path after a successful login. Navigation and route
visibility mirror the role returned by `/api/auth/me`:

- `RECEPTIONIST`: appointment operations.
- `CMS_ADMIN`: CMS/content operations.
- `SUPER_ADMIN`: both groups.

These checks are UX only—the Worker RBAC middleware remains the authorization
boundary and must still return `401`/`403` for direct API requests.

For local browser testing, run the API and web app with the documented local
origins. The temporary `workers.dev` staging Worker is cross-site relative to a
future Pages domain, while the session cookie intentionally uses `SameSite=Lax`.
Use same-site HTTPS custom subdomains for staging (for example,
`admin.staging.example.com` and `api.staging.example.com`) before relying on
browser cookie authentication there. Do not weaken the cookie policy or place
session secrets in `VITE_*` variables to work around this.

## First super-admin bootstrap

1. Apply migrations to the target environment.
2. Generate an SQL insert locally; do not save the command output to Git:

   ```bash
   INITIAL_SUPER_ADMIN_NAME='Clinic Owner' \
   INITIAL_SUPER_ADMIN_EMAIL='owner@example.com' \
   INITIAL_SUPER_ADMIN_PASSWORD='use-a-unique-password-manager-value' \
   node apps/api/scripts/generate-super-admin-sql.mjs
   ```

3. Copy the generated SQL, which contains only a password hash, and execute it
   once against the intended D1 environment with Wrangler.
4. Confirm login through `POST /api/auth/login`, then remove any local SQL file.

Never commit bootstrap credentials, generated SQL, or Worker secret values.

## Safety rules

- Only super admins can create/update admin accounts.
- Password hashes are generated with Workers-native PBKDF2-HMAC-SHA-256 at
  600,000 iterations and a random 16-byte salt.
- Login failures use a generic credential error and a D1-backed per-email/IP
  rate-limit record.
- The final active super admin cannot be disabled or demoted.
- A super admin cannot disable or demote their own account in its active session.
