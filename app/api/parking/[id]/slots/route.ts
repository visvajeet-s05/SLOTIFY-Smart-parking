import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const cameraId = searchParams.get('cameraId')

    // First check if the parking lot exists (with cameras fallback)
    let lot: any;
    try {
      lot = await prisma.parkinglot.findUnique({
        where: { id },
        include: { cameras: true }
      })
    } catch (e) {
      console.warn("⚠️ Prisma relation 'cameras' not ready, falling back...");
      lot = await prisma.parkinglot.findUnique({
        where: { id }
      });
      if (lot) lot.cameras = [];
    }

    if (!lot) {
      console.log("❌ Parking lot not found:", id)
      return NextResponse.json(
        { error: "Parking lot not found", lotId: id },
        { status: 404 }
      )
    }

    console.log("✅ Found parking lot:", lot.name)

    // Fetch slots filtered by lotId and optionally cameraId
    const slots = await prisma.slot.findMany({
      where: {
        lotId: id,
        ...(cameraId ? { cameraId } : {})
      },
      orderBy: { slotNumber: "asc" }
    })

    console.log(`✅ Found ${slots.length} slots for ${id}${cameraId ? ` camera ${cameraId}` : ''}`)

    let targetCameraUrl = lot.cameraUrl
    if (cameraId) {
      const cam = lot.cameras.find(c => c.id === cameraId)
      if (cam && cam.url) targetCameraUrl = cam.url
    }

    return NextResponse.json({
      slots: slots,
      cameraUrl: targetCameraUrl,
      cameras: lot.cameras,
      lot: {
        id: lot.id,
        name: lot.name,
        totalSlots: slots.length,
        address: lot.address
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
