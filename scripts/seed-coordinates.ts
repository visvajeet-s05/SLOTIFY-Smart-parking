import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const lotId = "CHENNAI_CENTRAL"

    // Update the first few slots with sample coordinates
    // Sample image might be 1920x1080 or similar
    const sampleCoordinates = [
        { number: 1, x: 100, y: 300, w: 150, h: 250 },
        { number: 2, x: 280, y: 300, w: 150, h: 250 },
        { number: 3, x: 460, y: 300, w: 150, h: 250 },
        { number: 4, x: 640, y: 300, w: 150, h: 250 },
        { number: 5, x: 820, y: 300, w: 150, h: 250 },
        { number: 6, x: 1000, y: 300, w: 150, h: 250 },
        { number: 7, x: 1180, y: 300, w: 150, h: 250 },
        { number: 8, x: 1360, y: 300, w: 150, h: 250 },
    ]

    console.log(`Updating slots for ${lotId}...`)

    for (const coord of sampleCoordinates) {
        const slotId = `${lotId}-A-${coord.number}`
        await prisma.slot.update({
            where: { id: slotId },
            data: {
                x: coord.x,
                y: coord.y,
                width: coord.w,
                height: coord.h
            }
        })
        console.log(`  ✓ Updated slot ${slotId}`)
    }

    console.log("✅ Coordinates updated!")
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })
