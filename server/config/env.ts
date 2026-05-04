import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
// Prioritize .env.local for local development, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Environment variables are managed by Vercel in production.

export const env = {
  // Use Vercel's standard Postgres env vars as fallbacks
  DATABASE_URL: process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL!,
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL!,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: parseInt(process.env.PORT || '5000', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  APP_URL: process.env.APP_URL || 'https://rwandawomenmagazine.rw',
};
