import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lotId } = await params

    // Find parking lot with safety fallback for pending prisma generation
    let parkingLot: any;
    try {
      parkingLot = await prisma.parkinglot.findUnique({
        where: { id: lotId },
        include: {
          cameras: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    } catch (e) {
      console.warn("⚠️ Prisma 'cameras' field not generated yet, falling back...");
      parkingLot = await prisma.parkinglot.findUnique({
        where: { id: lotId }
      });
      if (parkingLot) parkingLot.cameras = [];
    }

    if (!parkingLot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      )
    }

    // Return camera URL and cameras list
    return NextResponse.json({
      success: true,
      lotId: parkingLot.id,
      name: parkingLot.name,
      streamUrl: parkingLot.cameraUrl || null,
      hasCamera: !!(parkingLot.cameraUrl || parkingLot.cameras.length > 0),
      cameras: parkingLot.cameras
    })

  } catch (error) {
    console.error("Error fetching camera URL:", error)
    return NextResponse.json(
      { error: "Failed to fetch camera URL" },
      { status: 500 }
    )
  }
}
