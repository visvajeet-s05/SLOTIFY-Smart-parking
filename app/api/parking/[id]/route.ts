import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Case-insensitive ID lookup fallback
    let lot = await (prisma.parkinglot as any).findUnique({
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
        edgeNodeId: true,
        lastHeartbeat: true,
        ddnsDomain: true
      }
    })

    // If not found, try lowercase search (common in production environments)
    if (!lot) {
      lot = await (prisma.parkinglot as any).findFirst({
        where: { id: { equals: id, mode: 'insensitive' } as any },
        select: {
          id: true,
          name: true,
          address: true,
          lat: true,
          lng: true,
          status: true,
          cameraUrl: true,
          totalSlots: true
        }
      })
    }

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
