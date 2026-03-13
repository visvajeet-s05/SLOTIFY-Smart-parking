
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lots = await prisma.parkinglot.findMany({
      where: { status: 'ACTIVE' },
      include: {
        slots: {
          select: { id: true }
        }
      }
    });

    console.log(`Found ${lots.length} active lots.`);
    lots.forEach(lot => {
      console.log(`Lot: ${lot.name} (ID: ${lot.id}) | Slots in DB check: ${lot.slots.length}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
