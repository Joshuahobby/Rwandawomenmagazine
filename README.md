# Rwanda Women Magazine

A full-stack magazine and CMS platform — articles, categories, comments and a
newsletter — plus an awards system with nominations and public voting.

Production: [rwandawomenmagazine.rw](https://www.rwandawomenmagazine.rw)

## Stack

- **Frontend:** React 19 + Vite, React Router v7, Tailwind CSS, TanStack Query
- **Backend:** Express (one app, two entry points — see below), Prisma
- **Database:** PostgreSQL (Neon)
- **Hosting:** Vercel — the API runs as a single serverless function
- **Media:** Cloudinary · **Email:** Resend · **Monitoring:** Sentry

## Prerequisites

- Node.js 20+
- A PostgreSQL database (Neon recommended — the pooled connection is required
  for serverless)

## Setup

```bash
npm install
```

Create `.env.local` with at least the following (never commit it):

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | **Pooled** Neon connection string (used at runtime) |
| `DIRECT_URL` | Non-pooled connection (used by Prisma migrations only) |
| `JWT_SECRET` | Signing key for auth tokens |
| `CLOUDINARY_*` | Image uploads (`CLOUD_NAME`, `API_KEY`, `API_SECRET`) |
| `RESEND_API_KEY` | Transactional email (optional locally) |
| `VITE_SENTRY_DSN` | Error tracking (optional locally) |

Then apply the schema and seed:

```bash
npm run db:migrate:dev
npm run db:seed
```

## Running

```bash
npm run dev:all
```

Frontend on **http://localhost:3000**, API on **http://localhost:5000**. The
Vite dev server proxies `/api` and `/uploads` to the backend, so use port 3000
in the browser.

Run them separately with `npm run dev` (frontend) and `npm run server` (backend).

## Testing and checks

```bash
npm test              # Vitest (unit + API), run once
npm run test:e2e      # Playwright, auto-starts dev:all
npm run lint
npm run type-check
```

> `npm run build` runs `prisma generate` before `vite build`. To check that the
> frontend compiles without touching the database, use `npx vite build`.

## Architecture

One Express app with two entry points:

- **Local:** `server/index.ts` runs it standalone on port 5000.
- **Production:** `api/index.ts` exports the same app as a single Vercel
  serverless function. `vercel.json` rewrites `/api/:path*` and `/sitemap.xml`
  to it; everything else falls through to the SPA.

`server/app.ts` is the shared app definition and route registry. Routes live in
`server/routes/*.routes.ts` and logic in `server/controllers/*.controller.ts`.

One deployment constraint worth knowing before adding a server dependency: the
serverless function is bundled as CommonJS, so a package with no CJS entry point
will crash every API route on cold start with `ERR_REQUIRE_ESM`. A local
`require()` will *not* catch this — recent Node versions allow requiring ESM.

## Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for the branching model, environment
separation and the pre-deploy checklist. `main` is production and deploys on
push; `develop` is the integration branch.
