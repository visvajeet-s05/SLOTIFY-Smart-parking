const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lotId = 'CHENNAI_CENTRAL';
    await prisma.parkinglot.update({
      where: { id: lotId },
      data: { lastHeartbeat: new Date() }
    });
    console.log('Success: Updated lastHeartbeat');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
