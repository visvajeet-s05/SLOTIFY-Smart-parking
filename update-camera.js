
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lotId = 'CHENNAI_CENTRAL'; // Assuming this is the main lot
    const cameraUrl = 'http://10.245.197.193:8080/video';

    const updated = await prisma.parkinglot.update({
        where: { id: lotId },
        data: { cameraUrl },
    });

    console.log('Updated Lot:', updated);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
