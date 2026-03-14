const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lot = await prisma.parkinglot.findUnique({
      where: { id: 'VELACHERY' }
    });
    if (lot) {
      console.log('ID: ' + lot.id);
      console.log('EDGE_NODE_ID: ' + lot.edgeNodeId);
      console.log('EDGE_TOKEN: ' + lot.edgeToken);
    } else {
      console.log('VELACHERY not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
