# CMS integration

## Media previews

CMS records store an R2 **object key**, never a browser URL. Set the optional
public configuration value below only when a public R2/custom-domain serving
endpoint is available:

```bash
VITE_MEDIA_PUBLIC_BASE_URL=https://media.example.com
```

It is not a secret. Without it, the CMS still stores and saves media keys but
does not attempt to render a broken `<img>` URL from a raw key.

The frontend uses `src/services/cms.ts` for authenticated CMS requests. It integrates the admin services, doctors, branches, showcases, clinic, contact, and media endpoints. Each request goes through the shared API client with cookies included; screens never parse response bodies themselves.

List filters are normalized before being placed in request URLs and React Query keys. CMS mutations invalidate the domain's admin and public query prefixes; clinic and contact changes invalidate their corresponding settings keys.

Media lifecycle: upload an approved image with `file` and `category`, receive the object key, then save that key in the CMS record. For a replacement, upload the new key first, save the record, and only then optionally remove a confirmed orphan. Uploads do not invalidate domain records by themselves.

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` locally. In staging, the frontend and API must be same-site HTTPS so authenticated cookies are sent correctly. Secrets must never be placed in `VITE_*` variables.
