import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- START SEEDING ARTICLES ---');

    // 1. Ensure Roles exist
    console.log('Ensuring roles exist...');
    const roles = [
        { name: 'Admin', description: 'System Administrator' },
        { name: 'Editor', description: 'Content Editor' },
        { name: 'Author', description: 'Content Creator' }
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
    if (!adminRole) throw new Error('Admin role not found');

    // 2. Ensure at least one User exists
    console.log('Ensuring admin user exists...');
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@rwandawomen.com' },
        update: {},
        create: {
            email: 'admin@rwandawomen.com',
            fullName: 'System Admin',
            passwordHash: await bcrypt.hash('Admin@123', 10),
            roleId: adminRole.id,
            bio: 'Primary system administrator for Rwanda Women Magazine.',
            isActive: true,
        },
    });

    // 3. Ensure Categories exist
    console.log('Ensuring categories exist...');
    const categoryData = [
        { name: 'Fashion', slug: 'fashion', color: '#ff0000' },
        { name: 'Business', slug: 'business', color: '#00ff00' },
        { name: 'Health', slug: 'health', color: '#0000ff' },
        { name: 'Women Empowerment', slug: 'women-empowerment', color: '#ff00ff' },
        { name: 'Technology', slug: 'technology', color: '#00ffff' }
    ];

    const categories = [];
    for (const cat of categoryData) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
        categories.push(created);
    }

    // 4. Create Articles for each category
    console.log('Creating articles...');
    for (const cat of categories) {
        // Check if articles already exist for this category
        const existingCount = await prisma.article.count({ where: { categoryId: cat.id } });

        if (existingCount < 2) {
            for (let i = 1; i <= 2; i++) {
                const title = `Insightful read on ${cat.name}: Volume ${i}`;
                const slug = `${cat.slug}-insight-${Date.now()}-${i}`;

                await prisma.article.create({
                    data: {
                        title,
                        slug,
                        excerpt: `This is a sample article providing depth into ${cat.name}. It covers key trends and success stories from Rwanda.`,
                        content: `<p>Detailed content about <strong>${cat.name}</strong>. Here we explore how women are leading the way in this field in Rwanda.</p>`,
                        featuredImage: `https://picsum.photos/800/600?random=${cat.id}${i}`,
                        status: 'published',
                        isFeatured: i === 1,
                        authorId: adminUser.id,
                        categoryId: cat.id,
                        publishedAt: new Date(),
                    }
                });
                console.log(`Created article: ${title}`);
            }
        } else {
            console.log(`Category ${cat.name} already has ${existingCount} articles.`);
        }
    }

    console.log('--- SEEDING COMPLETED SUCCESSFULY ---');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
