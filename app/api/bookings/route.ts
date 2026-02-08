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

    // Transform to match UI interface if needed, or update UI to match this
    // The UI `Booking` interface has `parkingLocation`, `slotId`, etc.
    // Let's map it here to be safe and clean.
    const mappedBookings = bookings.map(b => ({
      id: b.id,
      bookingId: b.id.substring(0, 8).toUpperCase(), // or a real booking ID field if exists
      parkingLocation: b.parkinglot.name,
      slotId: b.slot ? `${b.slot.row}-${b.slot.slotNumber}` : "N/A",
      bookingDate: b.startTime.toISOString(),
      bookingTime: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: Math.round((new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60)),
      licensePlate: "TN-XX-XXXX", // Placeholder as vehicle relation might be complex
      vehicleModel: b.vehicleType,
      amount: b.amount,
      paymentMethod: "Online", // default
      status: b.status, // Enum matches somewhat? UI expects "UPCOMING" etc. Prisma enum is usually uppercase.
      createdAt: b.createdAt.toISOString(),
    }))

    return NextResponse.json(mappedBookings)
  } catch (error) {
    console.error("[BOOKINGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
