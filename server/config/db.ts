import { PrismaClient } from '@prisma/client';
import { env } from './env';

const dbUrl = env.DATABASE_URL;

if (!dbUrl) {
    console.error('❌ [DB] DATABASE_URL is undefined. Check Vercel environment variables.');
} else {
    const maskedUrl = dbUrl.replace(/(postgresql|postgres):\/\/[^:@]+:[^@]+@/, '$1://***:***@');
    console.log(`🔌 [DB] Initializing Prisma with: ${maskedUrl}`);
}

// Singleton pattern: critical for Vercel serverless to avoid
// opening a new DB connection on every function invocation.
declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
    global.__prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}

export default prisma;
