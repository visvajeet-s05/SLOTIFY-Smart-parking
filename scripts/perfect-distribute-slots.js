const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Standard Frame Size for Calculation
// Upgrade to 1080p Coordinate Basis to ensure full-screen coverage
const FRAME_W = 1920;
const FRAME_H = 1080;
const MARGIN_X = 10;
const MARGIN_Y = 80; // Moderate top margin for HUD

async function main() {
    const lots = await prisma.parkinglot.findMany();

    console.log(`� FORCING MAX-SCALE DISTRIBUTION for ${lots.length} lots...`);

    for (const lot of lots) {
        const total = lot.totalSlots || 60;
        console.log(`Lot: ${lot.name} (${total} slots)`);

        // Optimized grid to fill the 16:9 aspect ratio fully
        let cols = 15;
        if (total <= 50) cols = 8;
        else if (total <= 80) cols = 10;
        else if (total <= 100) cols = 12;

        const rows = Math.ceil(total / cols);

        const availableW = FRAME_W - (MARGIN_X * 2);
        const availableH = FRAME_H - (MARGIN_Y * 2);

        // Minimal gap for maximum box size
        const gap = 4;

        const slotW = Math.floor((availableW - (cols * gap)) / cols);
        const slotH = Math.floor((availableH - (rows * gap)) / rows);

        const existingSlots = await prisma.slot.findMany({
            where: { lotId: lot.id },
            orderBy: { slotNumber: 'asc' }
        });

        console.log(`  -> Final Grid: ${cols}x${rows}, Heavy-Weight Vector: ${slotW}x${slotH}`);

        const updates = existingSlots.map((slot, index) => {
            const col = index % cols;
            const rowNum = Math.floor(index / cols);

            const x = MARGIN_X + col * (slotW + gap);
            const y = MARGIN_Y + rowNum * (slotH + gap);

            return prisma.slot.update({
                where: { id: slot.id },
                data: {
                    x: x,
                    y: y,
                    width: slotW,
                    height: slotH,
                    row: String.fromCharCode(65 + rowNum)
                }
            });
        });

        await prisma.$transaction(updates);
        console.log(`  ✓ Successfully expanded ${updates.length} nodes to fill frame.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
