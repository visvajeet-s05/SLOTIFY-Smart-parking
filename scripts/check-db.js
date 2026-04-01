const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lot = await prisma.parkinglot.findUnique({
    where: { id: 'CHENNAI_CENTRAL' },
  });
  console.log("DB_CAMERA_URL:", lot.cameraUrl);
  console.log("EDGE_NODE_ID:", lot.edgeNodeId);
  console.log("EDGE_TOKEN:", lot.edgeToken);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
