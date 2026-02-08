const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lots = await prisma.parkinglot.findMany({
        include: {
            slots: true
        }
    });
    console.log(JSON.stringify(lots, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
