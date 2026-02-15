import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const prisma = new PrismaClient();

async function test() {
    try {
        const category = 'business-economy';
        const limit = 4;
        const status = 'published';

        const where: Record<string, unknown> = { status };
        if (category) where.category = { slug: category };

        console.log('Querying with where:', JSON.stringify(where, null, 2));

        const articles = await prisma.article.findMany({
            where,
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: {
                category: { select: { id: true, name: true, slug: true, color: true } },
                author: { select: { id: true, fullName: true, profileImage: true } },
                tags: { include: { tag: true } },
            },
        });

        const logMsg = `Success! Found articles: ${articles.length}`;
        console.log(logMsg);
        fs.writeFileSync('test-output.txt', `${logMsg}\n${JSON.stringify(articles, null, 2)}`);
    } catch (error: unknown) {
        const errMsg = `FAILED with error: ${error instanceof Error ? error.message : String(error)}\n${error instanceof Error ? error.stack : ''}`;
        console.error(errMsg);
        fs.writeFileSync('test-output.txt', errMsg);
    } finally {
        await prisma.$disconnect();
    }
}

test();
