import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Slot Distribution...")
    const slots = await prisma.slot.findMany({
        orderBy: { slotNumber: 'asc' }
    })
    
    console.log(`Found ${slots.length} slots.`)
    
    // Group slots into buckets of 30 and see their average x,y,w,h
    for (let i = 0; i < slots.length; i += 30) {
        const bucket = slots.slice(i, i + 30)
        const avgX = bucket.reduce((sum, s) => sum + (s.x || 0), 0) / bucket.length
        const avgY = bucket.reduce((sum, s) => sum + (s.y || 0), 0) / bucket.length
        const minX = Math.min(...bucket.map(s => s.x || 0))
        const minY = Math.min(...bucket.map(s => s.y || 0))
        const maxX = Math.max(...bucket.map(s => (s.x || 0) + (s.width || 0)))
        const maxY = Math.max(...bucket.map(s => (s.y || 0) + (s.height || 0)))
        
        console.log(`Bucket S${i+1}-S${i+bucket.length}:`)
        console.log(`  Min [${minX}, ${minY}], Max [${maxX}, ${maxY}]`)
        console.log(`  Suggested ROI: { x: ${minX - 50}, y: ${minY - 50}, w: ${maxX - minX + 100}, h: ${maxY - minY + 100} }`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
