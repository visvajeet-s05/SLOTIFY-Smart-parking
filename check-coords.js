
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const slots = await prisma.slot.findMany({
      where: { lotId: 'VELACHERY' },
      take: 5
    });

    console.log('--- Slot Data for VELACHERY ---');
    slots.forEach(s => {
      console.log(`Slot ${s.slotNumber}: x=${s.x}, y=${s.y}, w=${s.width}, h=${s.height}, status=${s.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
