const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUsers() {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          in: ['owner@gmail.com', 'customer@gmail.com']
        }
      }
    });
    console.log(`Deleted ${result.count} users`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsers();