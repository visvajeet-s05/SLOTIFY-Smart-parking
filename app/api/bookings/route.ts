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
      licensePlate: "TN-XX-XXXX",
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
    const { slotId, duration, amount, licensePlate, vehicleModel, parkingLotId } = body

    if (!slotId || !duration || !amount || !parkingLotId) {
      return new NextResponse("Missing required fields", { status: 400 })
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

    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const booking = await prisma.booking.create({
      data: {
        id: bookingId,
        customerId: user.id,
        ownerId: parkingLot.ownerprofile.userId, // Use userId from profile, not profile.id
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

    if (!slot) {
      return new NextResponse("Slot not found", { status: 404 })
    }

    // Update slot status
    const updatedSlot = await prisma.slot.update({
      where: { id: slotId },
      data: {
        status: "RESERVED",
        updatedAt: new Date()
      }
    })

    // Broadcast update via WebSocket server
    try {
      await fetch("http://localhost:4000/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SLOT_UPDATE",
          lotSlug: parkingLotId,
          slotNumber: updatedSlot.slotNumber, // Ensure it's a number matches WS expectation
          slotId: updatedSlot.id,
          status: "RESERVED",
          oldStatus: slot.status,
          source: "CUSTOMER",
          bookingId: booking.id
        })
      })
    } catch (wsError) {
      console.error("Failed to broadcast booking update:", wsError)
      // Continue execution, don't fail the request just because WS failed
    }

    return NextResponse.json(booking)

  } catch (error) {
    console.error("[BOOKINGS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
