const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSpecificUsers() {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          in: ['jane@customer.com', 'john@owner.com']
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

deleteSpecificUsers();