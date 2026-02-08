const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lots = await prisma.parkinglot.findMany({
        select: {
            id: true,
            name: true,
            _count: {
                select: { slots: true }
            }
        }
    });
    console.log('Lots and slot counts:');
    lots.forEach(lot => {
        console.log(`- ${lot.name} (${lot.id}): ${lot._count.slots} slots`);
    });

    const slotsWithCoords = await prisma.slot.count({
        where: {
            x: { not: null },
            y: { not: null }
        }
    });
    console.log(`Slots with coordinates: ${slotsWithCoords}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
