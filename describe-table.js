
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`DESCRIBE parkinglot`;
    console.log(JSON.stringify(columns, null, 2));
  } catch (error) {
    console.error('Error describing table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
