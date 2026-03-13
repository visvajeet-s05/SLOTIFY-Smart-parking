
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const allSlots = await prisma.slot.findMany({
      select: { lotId: true }
    });
    
    const uniqueLotIdsInSlots = [...new Set(allSlots.map(s => s.lotId))];
    console.log('Unique Lot IDs in Slot table:', uniqueLotIdsInSlots);
    
    const allLots = await prisma.parkinglot.findMany({
      select: { id: true, name: true, status: true }
    });
    console.log('Lots in parkinglot table:');
    allLots.forEach(l => console.log(`- ${l.id} (${l.name}) [${l.status}]`));
    
    const missingLots = uniqueLotIdsInSlots.filter(id => !allLots.find(l => l.id === id));
    if (missingLots.length > 0) {
      console.log('CRITICAL: Slots exist for these non-existent lots:', missingLots);
    } else {
      console.log('All slots are correctly linked to existing lots.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
