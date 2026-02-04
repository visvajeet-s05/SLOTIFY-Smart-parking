import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST() {
  const user = await getCurrentUser()

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const owners = await prisma.ownerprofile.findMany({
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
    const netAmount = gross - platformFee - taxAmount

    await prisma.ownerinvoice.create({
      data: {
        id: crypto.randomUUID(),
        ownerId: owner.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        grossAmount: gross,
        platformFee,
        taxAmount,
        netAmount,
      },
    })
  }

  return NextResponse.json({ success: true })
}
