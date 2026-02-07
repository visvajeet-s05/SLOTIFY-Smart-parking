import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slotId, lotId, startTime, endTime, vehicleType = "CAR" } = body

    // Validate required fields
    if (!slotId || !lotId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: slotId, lotId, startTime, endTime" },
        { status: 400 }
      )
    }

    // Find the slot
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { parkingLot: { include: { ownerprofile: { include: { user: true } } } } }
    })

    if (!slot) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      )
    }

    // Check if slot is available
    if (slot.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: `Slot is not available. Current status: ${slot.status}` },
        { status: 400 }
      )
    }

    // Get customer (in real app, this would come from session)
    const customer = await prisma.user.findFirst({
      where: { role: "CUSTOMER" }
    })

    if (!customer) {
      return NextResponse.json(
        { error: "No customer found" },
        { status: 400 }
      )
    }

    // Get owner
    const owner = slot.parkingLot?.ownerprofile?.user
    if (!owner) {
      return NextResponse.json(
        { error: "Parking lot owner not found" },
        { status: 400 }
      )
    }

    // Calculate amount
    const start = new Date(startTime)
    const end = new Date(endTime)
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
    const amount = (slot.price || 50) * hours

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        customerId: customer.id,
        ownerId: owner.id,
        parkingLotId: lotId,
        slotId: slotId,
        status: "UPCOMING",
        amount: amount,
        startTime: start,
        endTime: end,
        vehicleType: vehicleType,
      }
    })

    // Update slot status to RESERVED
    await prisma.slot.update({
      where: { id: slotId },
      data: { 
        status: "RESERVED",
        updatedBy: "CUSTOMER"
      }
    })

    // Create status log
    await prisma.slotStatusLog.create({
      data: {
        id: crypto.randomUUID(),
        slotId: slotId,
        oldStatus: "AVAILABLE",
        newStatus: "RESERVED",
        updatedBy: "CUSTOMER",
        aiConfidence: 100
      }
    })

    // Broadcast WebSocket update
    try {
      const WebSocket = (await import("ws")).default
      const ws = new WebSocket("ws://localhost:4000")
      
      ws.on("open", () => {
        ws.send(JSON.stringify({
          type: "SLOT_UPDATE",
          slotId: slotId,
          status: "RESERVED",
          source: "CUSTOMER",
          timestamp: new Date().toISOString()
        }))
        ws.close()
      })
    } catch (wsError) {
      console.error("WebSocket broadcast error:", wsError)
    }

    return NextResponse.json({
      success: true,
      booking: booking,
      message: "Booking created successfully"
    })

  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")
    const ownerId = searchParams.get("ownerId")

    const where: any = {}
    if (customerId) where.customerId = customerId
    if (ownerId) where.ownerId = ownerId

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        slot: true,
        parkinglot: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
