import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lotId } = await params

    // Find parking lot
    const parkingLot = await prisma.parkinglot.findUnique({
      where: { id: lotId },
      select: { 
        id: true,
        name: true,
        cameraUrl: true,
        ownerId: true
      }
    })

    if (!parkingLot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      )
    }

    // Return camera URL (only accessible by owner - middleware handles auth)
    return NextResponse.json({
      success: true,
      lotId: parkingLot.id,
      name: parkingLot.name,
      streamUrl: parkingLot.cameraUrl || null,
      hasCamera: !!parkingLot.cameraUrl
    })

  } catch (error) {
    console.error("Error fetching camera URL:", error)
    return NextResponse.json(
      { error: "Failed to fetch camera URL" },
      { status: 500 }
    )
  }
}
