import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const lotId = "CHENNAI_CENTRAL"
    const aiSlots = await prisma.slot.findMany({
        where: {
            lotId: lotId,
            updatedBy: "AI"
        },
        select: {
            id: true,
            slotNumber: true,
            status: true,
            updatedBy: true,
            aiConfidence: true
        }
    })

    console.log(`Found ${aiSlots.length} slots updated by AI in ${lotId}`)
    if (aiSlots.length > 0) {
        console.log("Sample AI update:", aiSlots[0])
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })
