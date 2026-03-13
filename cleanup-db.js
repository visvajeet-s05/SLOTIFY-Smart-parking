
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Sync VELACHERY with the Edge Node ID from .env
    const edgeId = "edge-device-tamilnadu-01";
    await prisma.parkinglot.update({
      where: { id: "VELACHERY" },
      data: {
        edgeNodeId: edgeId,
        edgeToken: "slotify-secure-edge-token-2024",
        ddnsDomain: "slotify-tn01.duckdns.org",
        lastHeartbeat: new Date()
      }
    });
    console.log('✅ Updated VELACHERY with Edge Node ID');

    // 2. Clear out any duplicate/ghost owners if necessary, but careful not to break relations.
    // Let's just verify the owners used in seed.ts exist.
    const owners = await prisma.user.findMany({
      where: { role: 'OWNER' }
    });
    console.log(`Found ${owners.length} owners in system.`);

    // 3. Ensure all slots have coordinates (even if defaults)
    // The seed.ts doesn't set X/Y, but the API route generates them if missing.
    // However, if we want them "perfectly" restored, let's check one.
    const firstSlot = await prisma.slot.findFirst({ where: { lotId: 'VELACHERY' } });
    console.log('Sample Slot:', firstSlot);

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
