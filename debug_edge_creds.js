
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lot = await prisma.parkinglot.findUnique({
    where: { id: 'CHENNAI_CENTRAL' },
    select: {
      id: true,
      edgeNodeId: true,
      edgeToken: true,
      lastHeartbeat: true,
    }
  });
  console.log('CHENNAI_CENTRAL DB record:');
  console.log(JSON.stringify(lot, null, 2));

  // Also check what the .env.local has
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
  console.log('\n.env.local values:');
  console.log('EDGE_NODE_ID:', process.env.EDGE_NODE_ID);
  console.log('EDGE_TOKEN:', process.env.EDGE_TOKEN);
  console.log('PARKING_LOT_ID:', process.env.PARKING_LOT_ID);
  
  // Check if they match
  const match = lot && 
    lot.edgeNodeId === process.env.EDGE_NODE_ID && 
    lot.edgeToken === process.env.EDGE_TOKEN;
  console.log('\n✅ Credentials match DB:', match);
  if (!match && lot) {
    console.log('\n❌ MISMATCH DETECTED!');
    console.log('DB edgeNodeId:', lot.edgeNodeId);
    console.log('Env EDGE_NODE_ID:', process.env.EDGE_NODE_ID);
    console.log('DB edgeToken:', lot.edgeToken);
    console.log('Env EDGE_TOKEN:', process.env.EDGE_TOKEN);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
