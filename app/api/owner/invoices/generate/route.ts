import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST() {
  const currentDate = new Date()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const owners = await prisma.ownerprofile.findMany({
    where: { status: "APPROVED" },
  })

  for (const owner of owners) {
    // Aggregate total earnings from completed bookings for the current month
    const bookings = await prisma.booking.findMany({
      where: {
        ownerId: owner.userId,
        status: "COMPLETED",
        startTime: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    })

    const total = bookings.reduce((sum, booking) => sum + booking.amount, 0)
    const fee = total * 0.1
    const tax = fee * 0.18

    await prisma.ownerinvoice.create({
      data: {
        id: crypto.randomUUID(),
        ownerId: owner.id,
        month,
        year,
        grossAmount: total,
        platformFee: fee,
        taxAmount: tax,
        netAmount: total - fee - tax,
      },
    })
  }

  return NextResponse.json({ success: true })
}
