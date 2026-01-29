import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) return new Response("Unauthorized", { status: 401 })

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string; role: string; email: string; ownerStatus: string }

    if (decoded.role !== "OWNER") return new Response("Unauthorized", { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { ownerprofile: true }
    })

    if (!user || user.role !== "OWNER") return new Response("Unauthorized", { status: 401 })
    if (user.ownerprofile?.status !== "APPROVED") return new Response("Unauthorized", { status: 401 })

    // Total Customers - distinct booking customers
    const totalCustomers = await prisma.booking.findMany({
      where: { parkinglot: { ownerId: user.id } },
      distinct: ["customerId"],
      select: { customerId: true }
    })

    // Repeat Customers - customers with more than 1 booking
    const repeatCustomers = await prisma.booking.groupBy({
      by: ["customerId"],
      where: { parkinglot: { ownerId: user.id } },
      _count: { customerId: true },
      having: {
        customerId: { _count: { gt: 1 } }
      }
    })

    // Peak Hour - most bookings by hour
    const peakHours = await prisma.$queryRaw`
      SELECT HOUR(createdAt) as hour, COUNT(*) as count
      FROM Booking
      WHERE parkingLotId IN (
        SELECT id FROM ParkingLot WHERE ownerId = ${user.id}
      )
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    ` as { hour: number }[]

    // Peak Day - most bookings by weekday
    const peakDays = await prisma.$queryRaw`
      SELECT DAYNAME(createdAt) as day, COUNT(*) as count
      FROM Booking
      WHERE parkingLotId IN (
        SELECT id FROM ParkingLot WHERE ownerId = ${user.id}
      )
      GROUP BY day
      ORDER BY count DESC
      LIMIT 1
    ` as { day: string }[]

    // Vehicle Breakdown - count by vehicle type
    const vehicleStats = await prisma.vehicle.groupBy({
      by: ["make"],
      where: { userId: { in: (await prisma.booking.findMany({
        where: { parkinglot: { ownerId: user.id } },
        select: { customerId: true }
      })).map(b => b.customerId) } },
      _count: true
    })

    // Slot Utilization - calculate based on bookings
    const totalSlots = await prisma.parkingslot.count({
      where: { parkinglot: { ownerId: user.id } }
    })

    const activeBookings = await prisma.booking.count({
      where: {
        parkinglot: { ownerId: user.id },
        status: { in: ["UPCOMING", "ACTIVE"] }
      }
    })

    const slotUtilization = totalSlots > 0 ? (activeBookings / totalSlots) * 100 : 0

    return Response.json({
      totalCustomers: totalCustomers.length,
      repeatCustomers: repeatCustomers.length,
      peakHour: peakHours[0]?.hour ?? null,
      peakDay: peakDays[0]?.day ?? null,
      slotUtilization: Math.round(slotUtilization),
      vehicles: vehicleStats
    })
  } catch (error) {
    console.error("INSIGHTS ERROR:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
