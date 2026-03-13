
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lots = await prisma.parkinglot.findMany({
      include: {
        _count: {
          select: { slots: true }
        }
      }
    });

    console.log('--- Parking Lots & Slot Counts ---');
    lots.forEach(lot => {
      console.log(`ID: ${lot.id} | Name: ${lot.name} | Slots: ${lot._count.slots} | Status: ${lot.status}`);
    });

    if (lots.length > 0) {
      console.log('\n--- Sample Slots from first lot ---');
      const slots = await prisma.slot.findMany({
        where: { lotId: lots[0].id },
        take: 10
      });
      slots.forEach(s => {
        console.log(`- Slot ${s.slotNumber}: ${s.status} (ID: ${s.id})`);
      });
    } else {
      console.log('No parking lots found in database.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
