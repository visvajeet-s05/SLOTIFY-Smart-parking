const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FRAME_W = 1920;
const FRAME_H = 1080;
const MARGIN_X = 20;
const MARGIN_Y = 120; // More space for HUD

async function main() {
    const lots = await prisma.parkinglot.findMany();

    for (const lot of lots) {
        console.log(`Setting up 5 cameras for lot: ${lot.name}`);

        // 1. Create 5 Cameras
        const cameras = [];
        for (let i = 1; i <= 5; i++) {
            const cam = await prisma.camera.create({
                data: {
                    lotId: lot.id,
                    name: `Camera ${i}`,
                    url: lot.cameraUrl // Use lot's default URL for all initially
                }
            });
            cameras.push(cam);
        }

        // 2. Clear old slots to reset perfectly
        await prisma.slot.deleteMany({ where: { lotId: lot.id } });

        // 3. Generate 30 slots per camera (total 150)
        for (const cam of cameras) {
            console.log(`  -> Generating 30 slots for ${cam.name}`);

            const total = 30;
            const cols = 6; // user image showed 15, but 30 slots fit well in 6x5 or 10x3
            const rows = 5;

            const availableW = FRAME_W - (MARGIN_X * 2);
            const availableH = FRAME_H - (MARGIN_Y * 2);
            const gap = 8;

            const slotW = Math.floor((availableW - (cols * gap)) / cols);
            const slotH = Math.floor((availableH - (rows * gap)) / rows);

            const slots = [];
            for (let i = 1; i <= total; i++) {
                const index = i - 1;
                const col = index % cols;
                const rowNum = Math.floor(index / cols);

                const x = MARGIN_X + col * (slotW + gap);
                const y = MARGIN_Y + rowNum * (slotH + gap);
                const rowChar = String.fromCharCode(65 + rowNum);

                slots.push({
                    lotId: lot.id,
                    cameraId: cam.id,
                    slotNumber: (cameras.indexOf(cam) * 30) + i, // Continuous numbering across cameras
                    row: rowChar,
                    displayName: `${cam.name.replace('Camera ', 'C')}-${rowChar}${String(i).padStart(2, '0')}`,
                    status: 'AVAILABLE',
                    x, y, width: slotW, height: slotH,
                    updatedBy: 'AI',
                    price: 50,
                    slotType: 'REGULAR'
                });
            }

            // Bulk create for this camera
            for (const slotData of slots) {
                await prisma.slot.create({ data: slotData });
            }
        }

        // Update lot total slots
        await prisma.parkinglot.update({
            where: { id: lot.id },
            data: { totalSlots: 150 }
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
