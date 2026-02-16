// Environment variables are managed by Vercel in production.
// .env.local is only used locally.

export const env = {
  // Use Vercel's standard Postgres env vars as fallbacks
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL!,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: parseInt(process.env.PORT || '5000', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
};
