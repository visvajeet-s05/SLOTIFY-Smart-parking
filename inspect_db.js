const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- DB Investigation ---');
    
    // Check parking lots
    const lots = await prisma.parkinglot.findMany({ select: { id: true, name: true } });
    console.log('Parking Lots available:', lots.map(l => l.id));
    
    // Check generic slots
    const slotCount = await prisma.slot.count();
    console.log(`Total slots in Slot table: ${slotCount}`);
    
    if (slotCount > 0) {
        const samples = await prisma.slot.findMany({ take: 10, select: { lotId: true, slotNumber: true } });
        console.log('Sample lotIds in Slot table:', [...new Set(samples.map(s => s.lotId))]);
        
        // Try exact match for one of the sample IDs
        const testId = samples[0].lotId;
        const matching = await prisma.slot.findMany({ where: { lotId: testId } });
        console.log(`Verified matching for ${testId}: ${matching.length} slots`);
    }

    // Check parkingslot table
    const psCount = await prisma.parkingslot.count();
    console.log(`Total records in parkingslot table: ${psCount}`);

  } catch (err) {
    console.error('Error during inspection:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
