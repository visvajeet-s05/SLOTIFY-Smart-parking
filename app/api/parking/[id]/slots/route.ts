import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("🔍 Fetching slots for lotId:", id)

    // First check if the parking lot exists
    const lot = await prisma.parkinglot.findUnique({
      where: { id }
    })

    if (!lot) {
      console.log("❌ Parking lot not found:", id)
      return NextResponse.json(
        { error: "Parking lot not found", lotId: id },
        { status: 404 }
      )
    }

    console.log("✅ Found parking lot:", lot.name)

    // Fetch slots separately
    const slots = await prisma.slot.findMany({
      where: { lotId: id },
      orderBy: { slotNumber: "asc" }
    })

    console.log(`✅ Found ${slots.length} slots for ${id}`)

    return NextResponse.json({ 
      slots: slots,

      lot: {
        id: lot.id,
        name: lot.name,
        totalSlots: slots.length
      }
    })



  } catch (error) {
    console.error("❌ Error fetching slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch slots", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
