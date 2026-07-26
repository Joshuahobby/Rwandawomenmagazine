# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Rwanda Women Magazine — a full-stack magazine/CMS platform (articles, categories, comments, newsletter) plus an awards system (nominations and public voting with fraud detection). Production runs at rwandawomenmagazine.rw on Vercel.

## Commands

```bash
npm run dev:all        # Run frontend (Vite, port 3000) + backend (Express, port 5000) together
npm run dev            # Frontend only — proxies /api and /uploads to localhost:5000
npm run server         # Backend only (tsx watch server/index.ts)

npm test               # Vitest, run once
npx vitest run path/to/file.test.ts        # Single test file
npx vitest run -t "test name"              # Single test by name
npm run test:e2e       # Playwright (tests/e2e/), auto-starts dev:all; override base URL with APP_URL
npm run test:coverage

npm run lint           # ESLint
npm run type-check     # tsc --noEmit

npm run db:migrate:dev # Create/apply migrations locally (prisma migrate dev)
npm run db:seed        # tsx prisma/seed.ts
npm run db:studio      # Prisma Studio
```

**Warning:** `npm run build` runs `prisma migrate deploy` first — it requires `DATABASE_URL` and mutates the database. To check that the frontend compiles without touching the DB, use `npx vite build` or `npm run type-check`.

## Architecture

One Express app, two entry points:

- **Local dev:** `server/index.ts` starts Express standalone on port 5000. The Vite dev server (port 3000) proxies `/api` and `/uploads` to it.
- **Production (Vercel):** `api/index.ts` exports the same app as a single serverless function. `vercel.json` rewrites `/api/:path*` and `/sitemap.xml` to it; all other paths fall through to the SPA's `index.html`.

`server/app.ts` is the shared app definition and route registry.

### Backend (`server/`)

- **routes → controllers** pattern: `server/routes/*.routes.ts` wire URLs + middleware, `server/controllers/*.controller.ts` hold the logic. Prisma is the data layer (`server/config/db.ts`).
- **Middleware** (`server/middleware/`): `authenticate` (JWT from `Authorization: Bearer`, verifies the user is active), `requireRole(...roles)` (Admin always passes regardless of the list), `validate` (Zod), `upload` (multer), and `detectFraud` (blocks VPN/proxy/datacenter IPs via proxycheck.io — used on voting endpoints, results cached in memory 24h).
- **Env resolution** (`server/config/env.ts`): loads `.env.local` then `.env`. `DATABASE_URL` must be the *pooled* Neon connection for serverless — the module auto-converts a direct `*.neon.tech` URL to the `-pooler` form and appends `pgbouncer=true`. `DIRECT_URL` (non-pooled) is only for Prisma migrations. In production, missing `DATABASE_URL` or `JWT_SECRET` throws at startup.
- **Services** (`server/services/`): Resend email (+ `server/emails/` react-email templates, Resend webhooks verified with svix), node-cache, Sentry monitoring, slug generation. Images upload to Cloudinary.

### Database (`prisma/schema.prisma`)

PostgreSQL (Neon). All models map to snake_case tables/columns via `@map`/`@@map` — keep that convention when adding fields. Two domains:

- **CMS:** User/Role (Admin, Editor, Author, Contributor), Article (status enum: draft → review → published → archived, with revisions, SEO meta, views, tags), Category, Media, Page, Comment (requires approval), Subscriber.
- **Awards:** AwardCategory (grouped INDIVIDUAL/CORPORATE/SME), Nomination (status pipeline: pending → approved → shortlisted → finalist/rejected, plus `manualVotes`), Vote. Both Nomination and Vote use a unique `identityHash` for dedup — voting integrity depends on it.

### Frontend (root: `App.tsx`, `pages/`, `components/`)

- React 19 SPA, React Router v7, all pages lazy-loaded. `App.tsx` also passes a legacy `navigate(PageView, slug?)` callback into pages — many pages use that prop instead of router hooks directly.
- Auth state lives in `context/AuthContext.tsx`; the JWT is stored in localStorage (`rwanda_women_token`) and attached by the shared axios instance `services/api.ts` (baseURL `/api`). A 401 response clears stored credentials.
- `/dashboard` and `/editor` are protected and render without the standard `Layout`; everything else is public inside `Layout`.
- Tailwind theme in `tailwind.config.js`: brand `primary` #d800b4, fonts Inter (sans) / Playfair Display (display), dark mode via class.

## Workflow (from DEVELOPMENT.md)

GitFlow lite: `main` is production (deploys live), `develop` is integration (Vercel preview + staging DB), work happens on `feature/*` branches cut from `develop`. Before merging to `main`: tests pass and the build succeeds.

## Notes

- **Adding a server dependency:** the Vercel function is bundled as CommonJS, so any package (or transitive dep) without a CJS entry point crashes *every* API route on cold start with `ERR_REQUIRE_ESM`. A local `require()` does **not** catch this — Node 22.12+ allows requiring ESM, so it passes locally and fails in production. `"type": "module"` alone is not the tell either: `zod` and `axios` are ESM and fine, because their `exports` maps expose a `require` condition. Frontend-only deps are unaffected.
- **Article HTML is sanitized twice, by design:** `server/services/sanitize.ts` (js-xss) on write and `utils/sanitize.ts` (DOMPurify) on render, both driven by the shared allowlist in `utils/sanitizePolicy.ts`. The render-side pass is what neutralizes content stored before sanitization existed — don't remove it as redundant. Tests hold both engines to the same attack matrix.
- Backend API tests live in `server/tests/` (supertest), frontend tests in `tests/`, e2e specs in `tests/e2e/`. Vitest picks up `*.test.ts(x)` anywhere but excludes `tests/e2e/**` (those are Playwright and crash the Vitest worker).
- Tests run against the real database in `DATABASE_URL`, so keep them to reads and rejection paths unless that points at a throwaway DB.
