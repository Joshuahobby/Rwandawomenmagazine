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
let DATABASE_URL =
    process.env.DATABASE_URL ||
    process.env.DATABASE_POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

// Auto-convert Neon direct URL to pooled URL for Vercel serverless
// This allows the Vercel Neon integration to work out-of-the-box without manual env var overrides.
if (DATABASE_URL && DATABASE_URL.includes('.neon.tech') && !DATABASE_URL.includes('-pooler')) {
    DATABASE_URL = DATABASE_URL.replace('.aws.neon.tech', '-pooler.aws.neon.tech');
    if (!DATABASE_URL.includes('pgbouncer=true')) {
        DATABASE_URL += (DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
    console.log('🔄 [ENV] Automatically converted Neon direct URL to pooled URL for serverless compatibility.');
}

const DIRECT_URL =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

const IS_PROD = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (!DATABASE_URL && IS_PROD) {
    throw new Error('❌ [ENV] Missing DATABASE_URL in production!');
}

if (!process.env.JWT_SECRET && IS_PROD) {
    throw new Error('❌ [ENV] Missing JWT_SECRET in production! This is a critical security risk.');
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
    NODE_ENV: process.env.NODE_ENV || 'development',
};
