const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lots = await prisma.parkinglot.findMany({
      select: { id: true, name: true }
    });
    console.log('IDs found:', lots.map(l => l.id));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
