import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST() {
  const user = await getCurrentUser()

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const owners = await prisma.ownerProfile.findMany({
    where: { status: "APPROVED" },
  })

  for (const owner of owners) {
    const bookings = await prisma.booking.aggregate({
      where: {
        ownerId: owner.userId,
        status: "COMPLETED",
        startTime: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
      _sum: { amount: true },
    })

    const gross = bookings._sum.amount || 0
    const platformFee = gross * 0.1
    const taxAmount = platformFee * 0.18
    const netPayout = gross - platformFee - taxAmount

    await prisma.invoice.create({
      data: {
        ownerId: owner.userId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        grossAmount: gross,
        platformFee,
        taxAmount,
        netPayout,
      },
    })
  }

  return NextResponse.json({ success: true })
}
