import { PrismaClient } from '@prisma/client';
import { env } from './env';

const dbUrl = env.DATABASE_URL;

if (!dbUrl) {
    console.error('❌ DATABASE_URL is undefined in server/config/db.ts');
    // We don't throw here to avoid crasing the import, but Prisma will likely fail.
} else {
    // Log the URL with credentials masked
    const maskedUrl = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
    console.log(`🔌 Initializing Prisma with URL: ${maskedUrl}`);
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

export default prisma;
