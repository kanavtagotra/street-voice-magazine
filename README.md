# Street Voice Magazine

A Next.js web app for publishing and reading digital magazine editions. Admins upload PDFs; the server renders pages to responsive WebP variants, stores them locally or on Vercel Blob, and serves a protected in-browser reader for signed-in users.

## Features

- **Public homepage** — hero, latest edition cover, archive of past editions, about section
- **Google sign-in** — NextAuth (Auth.js) with JWT sessions; one admin email via `ADMIN_EMAIL`
- **Admin dashboard** — upload PDFs, manage editions (draft/publish, set current), edit homepage copy
- **PDF pipeline** — render pages with `pdf-to-img`, generate thumb/mobile/tablet/desktop WebP via Sharp, extract cover from page 1
- **Protected reader** — `/read` requires login; reader API issues an HMAC cookie so page assets are not hotlinkable
- **Dual storage** — local `storage/` for development; Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set

## Requirements

- Node.js 20+
- npm (or compatible package manager)
- For PDF processing: native deps used by Sharp and canvas (install build tools on Windows if needed)
- Google OAuth credentials for sign-in
- Optional: Vercel Blob token for production storage

## Quick start

```bash
git clone <repo-url>
cd street-voice-magazine
npm install
cp .env.example .env.local
# Edit .env.local — see Environment variables below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` with the Google account that matches `ADMIN_EMAIL` to access `/admin/dashboard`.

### Seed a demo edition (optional)

With the dev server running and `ADMIN_SECRET` set:

```bash
node scripts/seed-demo-edition.mjs path/to/magazine.pdf
```

This POSTs to `/api/admin/upload` with `x-admin-secret` and can set the edition as current.

### Test the PDF renderer only

Without the full app:

```bash
node scripts/test-pdf-pipeline.mjs path/to/magazine.pdf
```

Output goes to `storage/test-out/` (gitignored).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local`. Required for a typical dev setup:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Random secret for Auth.js session encryption ([generate](https://generate-secret.vercel.app/32)) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `ADMIN_EMAIL` | Yes | Google account email granted `admin` role |
| `ADMIN_SECRET` | Recommended | Shared secret for `x-admin-secret` on admin API (scripts, automation) |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob token; omit to use local `storage/` |
| `READER_SECRET` | Production | HMAC secret for reader cookie; defaults to `ADMIN_SECRET` or a dev placeholder |
| `CDN_URL` / `NEXT_PUBLIC_CDN_URL` | Optional | Absolute origin for asset URLs (e.g. CDN or canonical site URL) |
| `BASE_URL` | Scripts | Base URL for `seed-demo-edition.mjs` (default `http://localhost:3000`) |

Google OAuth redirect URI (development): `http://localhost:3000/api/auth/callback/google`

## Project layout

```
app/                    # App Router pages and API routes
  admin/dashboard/      # Admin UI (upload, editions, homepage settings)
  read/                 # Magazine reader (auth required)
  api/                  # REST-style route handlers
components/             # React UI (magazine reader, admin, auth, layout)
lib/
  server/               # PDF pipeline, catalog, blob/local storage, CDN helpers
  auth/                 # Roles, guards, session helpers
  reader/               # Client fetch + page cache for reader
hooks/                  # Reader virtualization, preload, fullscreen
storage/                # Local catalog + WebP assets (gitignored)
scripts/                # Seed and PDF pipeline test utilities
docs/ARCHITECTURE.md     # Deeper design notes
```

## Routes

| Path | Access | Purpose |
|------|--------|---------|
| `/` | Public | Marketing homepage |
| `/login`, `/signup` | Public | Auth UI (signup redirects to Google) |
| `/read` | Signed in | Full-screen magazine reader |
| `/profile` | Signed in | User profile and reading preferences |
| `/admin/dashboard` | Admin | Upload and manage editions |

Middleware protects `/read`, `/profile`, `/api/reader/*`, `/admin/dashboard/*`, and `/api/admin/*` (admin session or `x-admin-secret`).

## Admin API (automation)

Authenticated admins or requests with header `x-admin-secret: <ADMIN_SECRET>` can call:

- `POST /api/admin/upload` — multipart form: `file` (PDF), `title`, `headline`, `summary`, optional `id`, `setAsCurrent`, `publishNow`, `publishedAt`
- `GET|POST /api/admin/editions` — list or create/update editions
- `GET|PATCH|DELETE /api/admin/editions/[id]` — single edition
- `GET|PATCH /api/admin/site-settings` — homepage copy
- `GET /api/admin/status` — processing/storage health

Upload limit: **80 MB** PDF. Server actions use the same body size limit in `next.config.ts`.

## Storage model

- **Catalog** — `storage/catalog.json` or `magazines/catalog.json` on Blob; tracks `currentEditionId` and edition list
- **Current edition** — `storage/current-edition/` (pages + covers + `meta.json`)
- **Archive** — `storage/archive/<edition-id>/` for non-current editions
- **Page assets** — `pages/{thumb|mobile|tablet|desktop}/001.webp` per page; covers in `covers/`

Only the **current published** edition’s pages are readable via the public magazine page API; the reader uses `/api/reader/page/[n]` with a signed cookie from `/api/reader/bootstrap`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for pipeline flow, auth, and API details.

## Deployment

Designed for [Vercel](https://vercel.com):

1. Set environment variables in the project dashboard (including `BLOB_READ_WRITE_TOKEN` and `AUTH_SECRET`).
2. Configure Google OAuth with your production callback URL.
3. Set `ADMIN_EMAIL` to the operator’s Google address.
4. Use a strong `ADMIN_SECRET` and `READER_SECRET` in production.

`next.config.ts` marks PDF/canvas packages as `serverExternalPackages` and allows large server action bodies for uploads.

## Agent / AI contributors

See [AGENTS.md](AGENTS.md). This project uses **Next.js 16** with breaking changes vs older docs — check `node_modules/next/dist/docs/` when unsure.

## License

Private project (`package.json` → `"private": true`). Add a license file if you open-source it.
