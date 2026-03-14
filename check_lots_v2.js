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
        lastHeartbeat: true,
        status: true
      }
    });
    console.log('--- Parking Lots ---');
    lots.forEach(l => {
      console.log(`ID: ${l.id}`);
      console.log(`Name: ${l.name}`);
      console.log(`EdgeNodeID: ${l.edgeNodeId}`);
      console.log(`EdgeToken: ${l.edgeToken}`);
      console.log(`LastHeartbeat: ${l.lastHeartbeat}`);
      console.log(`Status: ${l.status}`);
      console.log('-------------------');
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
