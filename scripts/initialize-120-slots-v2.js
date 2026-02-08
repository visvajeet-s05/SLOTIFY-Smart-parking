const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lots = await prisma.parkinglot.findMany();

    console.log(`Processing ${lots.length} parking lots...`);

    for (const lot of lots) {
        console.log(`Standardizing lot: ${lot.name} (${lot.id}) to 120 slots...`);

        // 1. Clear old slots
        // Use transaction to ensure deletions happen before recreations
        await prisma.$transaction([
            prisma.booking.updateMany({
                where: { parkingLotId: lot.id },
                data: { slotId: null }
            }),
            prisma.slotStatusLog.deleteMany({
                where: { slot: { lotId: lot.id } }
            }),
            prisma.slot.deleteMany({
                where: { lotId: lot.id }
            })
        ]);

        // 2. Create 120 slots: 8 rows (A-H) x 15 columns
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const slots = [];
        let slotGlobalNumber = 1;

        for (const row of rows) {
            for (let col = 1; col <= 15; col++) {
                // Initial lattice layout - spread them out so they aren't all at (0,0)
                const x = (col - 1) * 60 + 50;
                const y = (rows.indexOf(row)) * 50 + 80;
                const width = 50;
                const height = 40;

                slots.push({
                    id: `${lot.id}-${row}-${slotGlobalNumber}`,
                    lotId: lot.id,
                    slotNumber: slotGlobalNumber,
                    row: row,
                    displayName: `${row}${String(slotGlobalNumber).padStart(2, '0')}`,
                    status: 'AVAILABLE',
                    price: 50,
                    slotType: 'REGULAR',
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    updatedBy: 'AI'
                });
                slotGlobalNumber++;
            }
        }

        // 3. Create the slots
        await prisma.slot.createMany({
            data: slots
        });

        // 4. Update totalSlots
        await prisma.parkinglot.update({
            where: { id: lot.id },
            data: { totalSlots: 120 }
        });

        console.log(`  ✓ Successfully initialized 120 slots for ${lot.name}`);
    }

    console.log('All lots standardized to 120-slot grid.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
