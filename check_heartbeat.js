const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lot = await prisma.parkinglot.findUnique({
      where: { id: 'CHENNAI_CENTRAL' },
      select: { id: true, lastHeartbeat: true, edgeNodeId: true }
    });
    console.log('--- Heartbeat Check ---');
    console.log('ID:', lot.id);
    console.log('Node:', lot.edgeNodeId);
    console.log('Last Heartbeat (DB):', lot.lastHeartbeat);
    console.log('Current System Time:', new Date());
    
    if (lot.lastHeartbeat) {
        const diff = (new Date() - new Date(lot.lastHeartbeat)) / 1000;
        console.log(`Difference: ${diff.toFixed(2)} seconds`);
        if (diff < 120) {
            console.log('✅ Status should be ONLINE (within 2-minute window)');
        } else {
            console.log('❌ Status will be OFFLINE (stale)');
        }
    } else {
        console.log('❌ No heartbeat recorded');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
