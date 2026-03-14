const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lots = await prisma.parkinglot.findMany({
      select: {
        id: true,
        name: true,
        edgeNodeId: true,
        edgeToken: true,
        lastHeartbeat: true
      }
    });
    console.log(JSON.stringify(lots, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
