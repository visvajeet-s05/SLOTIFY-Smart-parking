const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lot = await prisma.parkinglot.findUnique({
      where: { id: 'VELACHERY' },
      select: {
        id: true,
        edgeNodeId: true,
        edgeToken: true,
        status: true
      }
    });
    console.log(JSON.stringify(lot, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
