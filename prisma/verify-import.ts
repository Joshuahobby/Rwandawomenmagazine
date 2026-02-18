
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    const articleCount = await prisma.article.count();
    const mediaCount = await prisma.media.count();
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();

    console.log(`Articles: ${articleCount}`);
    console.log(`Media: ${mediaCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Categories: ${categoryCount}`);

    const articles = await prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: true, category: true }
    });

    console.log('--- Recent Articles ---');
    articles.forEach(a => {
        console.log(`- [${a.status}] ${a.title} (by ${a.author.email}, cat: ${a.category.name})`);
        console.log(`  Img: ${a.featuredImage}`);
    });
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
