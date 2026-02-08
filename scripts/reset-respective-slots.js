const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ORIGINAL_COUNTS = {
    "CHENNAI_CENTRAL": 120,
    "ANNA_NAGAR": 80,
    "T_NAGAR": 90,
    "VELACHERY": 100,
    "OMR": 150,
    "ADYAR": 50,
    "GUINDY": 70,
    "PORUR": 60
};

async function main() {
    for (const [lotId, count] of Object.entries(ORIGINAL_COUNTS)) {
        console.log(`Resetting ${lotId} to ${count} slots...`);

        // 1. Get all current slot IDs
        const currentSlots = await prisma.slot.findMany({
            where: { lotId },
            select: { id: true }
        });
        const ids = currentSlots.map(s => s.id);

        // 2. Clear relations
        if (ids.length > 0) {
            await prisma.booking.updateMany({
                where: { slotId: { in: ids } },
                data: { slotId: null }
            });
            await prisma.slotStatusLog.deleteMany({
                where: { slotId: { in: ids } }
            });
            // 3. Delete slots
            await prisma.slot.deleteMany({
                where: { id: { in: ids } }
            });
        }

        // 4. Create new slots
        const slotsPerRow = 10;
        const slots = [];
        for (let i = 1; i <= count; i++) {
            const rowIndex = Math.floor((i - 1) / slotsPerRow);
            const row = String.fromCharCode(65 + rowIndex); // A, B, C...
            const col = ((i - 1) % slotsPerRow) + 1;

            slots.push({
                id: `slot-${lotId}-${i}`,
                lotId: lotId,
                slotNumber: i,
                row: row,
                displayName: `${row}${String(i).padStart(2, '0')}`,
                status: 'AVAILABLE',
                price: 50,
                slotType: 'REGULAR',
                x: col * 80 + 20,
                y: (rowIndex + 1) * 60 + 20,
                width: 60,
                height: 40,
                updatedBy: 'AI'
            });
        }

        await prisma.slot.createMany({ data: slots });

        // 5. Update totalSlots
        await prisma.parkinglot.update({
            where: { id: lotId },
            data: { totalSlots: count }
        });

        console.log(`  ✓ Done.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
