const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lot = await prisma.parkinglot.findUnique({
      where: { id: 'CHENNAI_CENTRAL' }
    });
    
    if (!lot) {
      console.log('Lot not found');
      return;
    }

    const hb = lot.lastHeartbeat;
    const now = new Date();
    
    console.log('--- isOnline Logic Debug ---');
    console.log('Last Heartbeat Object:', hb);
    console.log('Last Heartbeat MS:', hb.getTime());
    console.log('Now Object:', now);
    console.log('Now MS:', now.getTime());
    
    const diff = now.getTime() - hb.getTime();
    console.log('Difference MS:', diff);
    console.log('Difference seconds:', diff / 1000);
    
    const isOnline = diff < 120000;
    console.log('isOnline (diff < 120s):', isOnline);
    
    if (!isOnline) {
        console.log('⚠️ isOnline is FALSE. This is why service shows as DOWN.');
        if (diff > 1000000) {
            console.log('🚨 Huge difference! Likely a Timezone mismatch.');
            console.log('Current Hour:', now.getHours());
            console.log('HB Hour:', hb.getHours());
        }
    } else {
        console.log('✅ isOnline is TRUE. If UI shows DOWN, it might be a caching or mapping issue.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
