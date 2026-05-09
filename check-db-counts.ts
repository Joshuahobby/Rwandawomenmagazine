import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

// Use DIRECT_URL for local scripting to bypass connection pool limits
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL
        }
    }
});

async function main() {
    try {
        const users = await prisma.user.count();
        const articles = await prisma.article.count();
        const categories = await prisma.category.count();
        
        console.log('\n--- Database Content Counts ---');
        console.log(`Users: ${users}`);
        console.log(`Articles: ${articles}`);
        console.log(`Categories: ${categories}`);
        console.log('-------------------------------\n');
    } catch (e) {
        console.error('Failed to query database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
