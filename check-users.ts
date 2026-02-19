import prisma from './server/config/db';

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        console.log('Total users:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email}: active=${u.isActive}, role=${u.role.name}`);
        });
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
