import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/parking - Fetch all active parking lots with slot counts
export async function GET() {
  try {
    // Fetch all active parking lots with their slots and owner info
    const parkingLots = await prisma.parkinglot.findMany({
      where: {
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        status: true,
        cameraUrl: true,
        createdAt: true,
        // Include new fields but handle gracefully later
        // edgeNodeId: true, 
        // lastHeartbeat: true,
        // ddnsDomain: true,
        ownerprofile: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        slots: {
          select: {
            id: true,
            status: true,
            price: true,
            slotType: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform data for customer dashboard
    const transformedLots = parkingLots.map((lot: any) => {
      const totalSlots = lot.slots?.length || 0
      const availableSlots = (lot.slots || []).filter((s: any) => s.status === "AVAILABLE").length
      const occupiedSlots = (lot.slots || []).filter((s: any) => s.status === "OCCUPIED").length
      const reservedSlots = (lot.slots || []).filter((s: any) => s.status === "RESERVED").length

      // Calculate average price from slots
      const avgPrice = totalSlots > 0
        ? Math.round(lot.slots.reduce((sum: number, s: any) => sum + (s.price || 0), 0) / totalSlots)
        : 50

      // Determine status based on availability
      const availabilityRatio = totalSlots > 0 ? availableSlots / totalSlots : 0
      const status = availabilityRatio > 0.5 ? "available" :
        availabilityRatio > 0.2 ? "limited" : "full"

      const ownerName = lot.ownerprofile?.user?.name || "Unknown Owner"

      let parkingName = lot.name
      if (!parkingName) {
        parkingName = ownerName.match(/parking$/i)
          ? ownerName
          : `${ownerName} Parking`
      }

      return {
        id: lot.id,
        name: parkingName,
        address: lot.address,
        lat: lot.lat,
        lng: lot.lng,
        totalSlots,
        availableSlots,
        occupiedSlots,
        reservedSlots,
        price: avgPrice,
        status,
        ownerName,
        ownerEmail: lot.ownerprofile?.user?.email || "",
        cameraUrl: lot.cameraUrl,
        // Safe access to new fields (might be missing in DB)
        edgeNodeId: (lot as any).edgeNodeId || null,
        lastHeartbeat: (lot as any).lastHeartbeat || null,
        ddnsDomain: (lot as any).ddnsDomain || null,
        isOnline: (lot as any).lastHeartbeat ? (new Date().getTime() - new Date(lot.lastHeartbeat).getTime() < 120000) : false,
        features: ["CCTV", "24/7", "Security"],
        distance: 0,
        rating: 4.5,
        openingHours: "24/7",
        coordinates: [lot.lat, lot.lng] as [number, number]
      }
    })

    return NextResponse.json({
      success: true,
      count: transformedLots.length,
      parkingAreas: transformedLots
    })

  } catch (error) {
    console.error("Error fetching parking lots:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch parking lots",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
