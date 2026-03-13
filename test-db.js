
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Database Connection Test ---');
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    console.log('\n--- Checking Tables ---');
    
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);

    const parkingLots = await prisma.parkinglot.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { slots: true }
        }
      }
    });
    console.log(`Active Parking Lots: ${parkingLots.length}`);
    
    parkingLots.forEach(lot => {
      console.log(`- ${lot.name} (${lot.id}): ${lot._count.slots} slots`);
    });

    if (parkingLots.length === 0) {
      const allLotsCount = await prisma.parkinglot.count();
      console.log(`Note: There are ${allLotsCount} total parking lots, but none are ACTIVE.`);
      
      if (allLotsCount > 0) {
        const sampleLot = await prisma.parkinglot.findFirst();
        console.log('Sample Lot Status:', sampleLot.status);
      }
    }

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
