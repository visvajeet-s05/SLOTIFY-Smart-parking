import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lot = await (prisma.parkinglot as any).findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        status: true,
        cameraUrl: true,
        totalSlots: true,
        // Safe access to edge node fields
        edgeNodeId: true,
        lastHeartbeat: true,
        ddnsDomain: true
      }
    })

    if (!lot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ lot })

  } catch (error) {
    console.error("Error fetching parking lot:", error)
    return NextResponse.json(
      { error: "Failed to fetch parking lot" },
      { status: 500 }
    )
  }
}
