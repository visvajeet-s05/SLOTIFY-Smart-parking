const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CAPACITIES = {
    'CHENNAI_CENTRAL': 200,
    'ANNA_NAGAR': 120,
    'T_NAGAR': 160,
    'VELACHERY': 100,
    'OMR': 240,
    'ADYAR': 80,
    'GUINDY': 140,
    'PORUR': 90
};

async function main() {
    const lots = await prisma.parkinglot.findMany();

    console.log(`🚀 RE-INITIALIZING SLOTS WITH CUSTOM CAPACITIES...`);

    for (const lot of lots) {
        try {
            const totalSlots = CAPACITIES[lot.id] || 120;
            console.log(`Processing lot: ${lot.name} (${lot.id}) -> Set to ${totalSlots} slots...`);

            // 1. Clear old slots
            const existingSlots = await prisma.slot.findMany({
                where: { lotId: lot.id },
                select: { id: true }
            });
            const slotIds = existingSlots.map(s => s.id);

            if (slotIds.length > 0) {
                // Disconnect bookings to prevent foreign key errors
                await prisma.booking.updateMany({
                    where: { slotId: { in: slotIds } },
                    data: { slotId: null }
                });

                // Delete related logs
                await prisma.slotStatusLog.deleteMany({
                    where: { slotId: { in: slotIds } }
                });

                // Delete the slots
                await prisma.slot.deleteMany({
                    where: { id: { in: slotIds } }
                });
            }

            // 2. Create Custom Slots
            const slots = [];
            // Determine grid layout based on total slots for a neat appearance
            let cols = 15;
            if (totalSlots <= 80) cols = 10;
            else if (totalSlots <= 100) cols = 10;
            else if (totalSlots <= 150) cols = 15;
            else if (totalSlots > 150) cols = 20;

            for (let i = 1; i <= totalSlots; i++) {
                const rowNum = Math.floor((i - 1) / cols);
                const colNum = (i - 1) % cols + 1;
                const rowChar = String.fromCharCode(65 + rowNum);

                slots.push({
                    id: `slot-${lot.id}-${rowChar}-${colNum}`,
                    lotId: lot.id,
                    slotNumber: i,
                    row: rowChar,
                    displayName: `${rowChar}${String(i).padStart(2, '0')}`,
                    status: 'AVAILABLE',
                    price: 50,
                    slotType: 'REGULAR',
                    x: 0, // Will be fixed by distribution script
                    y: 0,
                    width: 50,
                    height: 40,
                    updatedBy: 'AI'
                });
            }

            // 3. Batch Create
            await prisma.slot.createMany({
                data: slots
            });

            // 4. Update Lot Capacity
            await prisma.parkinglot.update({
                where: { id: lot.id },
                data: { totalSlots: totalSlots }
            });

            console.log(`  ✓ Successfully initialized ${totalSlots} slots for ${lot.name}`);
        } catch (e) {
            console.error(`  ❌ Failed to process ${lot.name}:`, e);
        }
    }

    console.log('✅ Custom slot initialization complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
