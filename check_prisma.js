const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lotId = 'CHENNAI_CENTRAL';
    console.log(`Checking slots for lotId: ${lotId}`);
    
    const slots = await prisma.slot.findMany({
      where: { lotId: lotId }
    });
    
    console.log(`Found ${slots.length} slots via prisma.slot`);
    
    if (slots.length === 0) {
        const anySlots = await prisma.slot.findMany({ take: 5 });
        console.log('Sample slots from DB:', anySlots.map(s => s.lotId));
    }

    const parkingSlot = await prisma.parkingslot.findMany({
        where: { parkingLotId: lotId }
    });
    console.log(`Found ${parkingSlot.length} slots via prisma.parkingslot`);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
