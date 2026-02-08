import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/parking - Fetch all active parking lots with slot counts
export async function GET() {
  try {
    // Fetch all active parking lots with their slots and owner info
    const parkingLots = await prisma.parkinglot.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
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
        },
        _count: {
          select: {
            slots: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform data for customer dashboard
    const transformedLots = parkingLots.map((lot) => {
      const totalSlots = lot.slots.length
      const availableSlots = lot.slots.filter((s) => s.status === "AVAILABLE").length
      const occupiedSlots = lot.slots.filter((s) => s.status === "OCCUPIED").length
      const reservedSlots = lot.slots.filter((s) => s.status === "RESERVED").length

      // Calculate average price from slots
      const avgPrice = lot.slots.length > 0
        ? Math.round(lot.slots.reduce((sum, s) => sum + (s.price || 0), 0) / lot.slots.length)
        : 50

      // Determine status based on availability
      const availabilityRatio = totalSlots > 0 ? availableSlots / totalSlots : 0
      const status = availabilityRatio > 0.5 ? "available" :
        availabilityRatio > 0.2 ? "limited" : "full"

      // Use parking lot name if available, otherwise fallback to owner's name
      const ownerName = lot.ownerprofile?.user?.name || "Unknown Owner"

      let parkingName = lot.name
      if (!parkingName) {
        // Smart suffixing: Only add " Parking" if not already present
        parkingName = ownerName.match(/parking$/i)
          ? ownerName
          : `${ownerName} Parking`
      }

      // Safety cleanup: Remove double "Parking" if it somehow exists
      if (parkingName) {
        parkingName = parkingName.replace(/ parking parking$/i, " Parking");
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
        ownerName: lot.ownerprofile?.user?.name || "Unknown Owner",
        ownerEmail: lot.ownerprofile?.user?.email || "",
        cameraUrl: lot.cameraUrl,
        // Default features based on amenities (can be enhanced later)
        features: ["CCTV", "24/7", "Security"],
        // Calculate distance from default Chennai coordinates (will be updated with user location)
        distance: 0,
        rating: 4.5, // Default rating (can be enhanced with reviews later)
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
