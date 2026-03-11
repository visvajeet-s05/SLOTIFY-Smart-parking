import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        parkinglot: {
          select: {
            name: true,
            address: true
          }
        },
        slot: {
          select: {
            slotNumber: true,
            row: true
          }
        }
      }
    })

    const mappedBookings = bookings.map(b => ({
      id: b.id,
      bookingId: b.id.substring(0, 8).toUpperCase(),
      parkingLocation: b.parkinglot.name,
      slotId: b.slot ? `${b.slot.row}-${b.slot.slotNumber}` : "N/A",
      bookingDate: b.startTime.toISOString(),
      bookingTime: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: Math.round((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60)),
      licensePlate: "TN-XX-XXXX", // TODO: Fetch from booking vehicle relation if available
      vehicleModel: b.vehicleType,
      amount: b.amount,
      paymentMethod: "Online",
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }))

    return NextResponse.json(mappedBookings)
  } catch (error) {
    console.error("[BOOKINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    let { slotId, duration, amount, licensePlate, vehicleModel, parkingLotId } = body

    if (!slotId || !duration || !amount) {
      return new NextResponse("Missing required fields (slotId, duration, amount)", { status: 400 })
    }

    // Resolver: If parkingLotId is missing, try to find it via the Slot
    if (!parkingLotId && slotId) {
      const relatedSlot = await prisma.slot.findUnique({
        where: { id: slotId },
        select: { lotId: true }
      });
      if (relatedSlot) {
        parkingLotId = relatedSlot.lotId;
      }
    }

    if (!parkingLotId) {
      return new NextResponse("Parking Lot ID is required and could not be resolved", { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        vehicle: true
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Find or create vehicle if license plate doesn't match existing
    let vehicleId = null
    const existingVehicle = user.vehicle.find(v => v.licensePlate === licensePlate)

    if (existingVehicle) {
      vehicleId = existingVehicle.id
    } else if (licensePlate) {
      const specificVehicleModel = vehicleModel || "Unknown Model"
      // Use a try-catch for vehicle creation to avoid race conditions or duplicates crashing the whole flow
      try {
        const newVehicle = await prisma.vehicle.create({
          data: {
            id: `VEH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            userId: user.id,
            licensePlate: licensePlate,
            model: specificVehicleModel,
            make: "Unknown",
            color: "Unknown",
            updatedAt: new Date()
          }
        })
        vehicleId = newVehicle.id
      } catch (vErr) {
        console.error("Vehicle creation warning:", vErr);
        // Proceed without explicit vehicle ID linked if strictly necessary, or just use user-provided strings
      }
    }

    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000)

    // Fetch parking lot to get the owner's userId
    const parkingLot = await prisma.parkinglot.findUnique({
      where: { id: parkingLotId },
      include: {
        ownerprofile: {
          select: { userId: true }
        }
      }
    })

    if (!parkingLot) {
      return new NextResponse("Parking lot not found", { status: 404 })
    }

    // Check if ownerprofile exists
    // If data is inconsistent (parkingLot exists but no ownerProfile), we might need a fallback or fail.
    // Failing is safer for data integrity, but let's be descriptive.
    if (!parkingLot.ownerprofile) {
      console.error(`Parking lot ${parkingLotId} has no owner profile linked. Data integrity issue.`)
      return new NextResponse("Parking lot configuration error (No Linked Owner)", { status: 500 })
    }

    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const booking = await prisma.booking.create({
      data: {
        id: bookingId,
        customerId: user.id,
        ownerId: parkingLot.ownerprofile.userId,
        parkingLotId: parkingLotId,
        slotId: slotId,
        startTime: startTime,
        endTime: endTime,
        amount: parseFloat(amount),
        vehicleType: vehicleModel || "Car",
        status: "UPCOMING",
      }
    })

    // Get current slot status for broadcast and update
    const slot = await prisma.slot.findUnique({
      where: { id: slotId }
    })

    if (slot) {
      // Update slot status
      const updatedSlot = await prisma.slot.update({
        where: { id: slotId },
        data: {
          status: "RESERVED",
          updatedAt: new Date()
        }
      })

      // Broadcast update via WebSocket server with TIMEOUT
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        await fetch("http://localhost:4000/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "SLOT_UPDATE",
            lotSlug: parkingLotId,
            slotNumber: updatedSlot.slotNumber,
            slotId: updatedSlot.id,
            status: "RESERVED",
            oldStatus: slot.status,
            source: "CUSTOMER",
            bookingId: booking.id
          }),
          signal: controller.signal
        })
        clearTimeout(timeoutId);
      } catch (wsError) {
        console.error("Failed to broadcast booking update (continued anyway):", wsError)
      }
    }

    return NextResponse.json(booking)

  } catch (error) {
    console.error("[BOOKINGS_POST] Critical Error:", error)
    // Return a JSON response even for 500 so frontend can parse it if possible, or at least text
    return new NextResponse(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
