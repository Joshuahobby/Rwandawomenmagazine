
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting database cleanup...');

    // Delete Media
    console.log('🗑️  Deleting Media...');
    const deletedMedia = await prisma.media.deleteMany({});
    console.log(`✅ Deleted ${deletedMedia.count} media records.`);

    // Delete Articles (Cascade deletes comments, views, revisions, tags, seoMeta)
    console.log('🗑️  Deleting Articles...');
    const deletedArticles = await prisma.article.deleteMany({});
    console.log(`✅ Deleted ${deletedArticles.count} articles.`);

    // Verify Users
    const userCount = await prisma.user.count();
    console.log(`ℹ️  Users remaining: ${userCount}`);

    console.log('✨ Cleanup complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
