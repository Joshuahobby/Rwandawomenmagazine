import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (local dev overrides), then .env as fallback.
// On Vercel, neither file exists — Vercel injects env vars directly into process.env.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ─── Database URL resolution ──────────────────────────────────────────────────
// For Vercel serverless + Neon, DATABASE_URL MUST be the *pooled* connection.
// Neon pooled URL hostname ends in -pooler.* and includes ?pgbouncer=true
// DIRECT_URL is used only by Prisma migrate (non-pooled).
//
// Priority order for DATABASE_URL (pooled):
//   1. DATABASE_URL          (set manually in Vercel → should be pooled URL)
//   2. DATABASE_POSTGRES_PRISMA_URL (Neon integration auto-sets this as pooled)
//   3. POSTGRES_PRISMA_URL   (Vercel Postgres integration)
//   4. POSTGRES_URL          (last resort)
//
// Priority order for DIRECT_URL (non-pooled):
//   1. DIRECT_URL
//   2. DATABASE_URL_UNPOOLED / DATABASE_POSTGRES_URL_NON_POOLING
//   3. POSTGRES_URL_NON_POOLING
const DATABASE_URL =
    process.env.DATABASE_URL ||
    process.env.DATABASE_POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

const DIRECT_URL =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

if (!DATABASE_URL) {
    console.error(
        '❌ [ENV] No DATABASE_URL found. Set it in Vercel Environment Variables.\n' +
        '   It must be the POOLED Neon connection string (hostname contains -pooler).\n' +
        '   Example: postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?pgbouncer=true&sslmode=require'
    );
}

export const env = {
    DATABASE_URL: DATABASE_URL!,
    DIRECT_URL: DIRECT_URL!,
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-dev-secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    PORT: parseInt(process.env.PORT || '5000', 10),
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
    APP_URL: process.env.APP_URL || 'https://rwandawomenmagazine.rw',
};
