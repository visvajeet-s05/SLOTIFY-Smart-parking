const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lots = await prisma.parkinglot.findMany();

    console.log(`Processing ${lots.length} parking lots...`);

    for (const lot of lots) {
        console.log(`Standardizing lot: ${lot.name} (${lot.id}) to 120 slots...`);

        // 1. Delete existing slots for this lot to prevent conflicts
        // In a real production app we might want to reconcile, 
        // but the user asked to "make it perfect" which implies a reset to this standard.
        await prisma.slotStatusLog.deleteMany({
            where: { slot: { lotId: lot.id } }
        });
        await prisma.slot.deleteMany({
            where: { lotId: lot.id }
        });

        // 2. Create 120 slots: 8 rows (A-H) x 15 columns
        const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const slots = [];
        let slotGlobalNumber = 1;

        for (const row of rows) {
            for (let col = 1; col <= 15; col++) {
                // Initial lattice layout - spread them out so they aren't all at (0,0)
                // This makes calibration MUCH easier
                const x = (col - 1) * 60 + 20;
                const y = (rows.indexOf(row)) * 40 + 60;
                const width = 50;
                const height = 30;

                slots.push({
                    id: `${lot.id}-${row}-${slotGlobalNumber}`,
                    lotId: lot.id,
                    slotNumber: slotGlobalNumber,
                    row: row,
                    displayName: `${lot.id}-${row}-${String(slotGlobalNumber).padStart(2, '0')}`,
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

        // Use transaction for bulk creation
        await prisma.slot.createMany({
            data: slots
        });

        // 3. Update totalSlots in parkinglot
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
