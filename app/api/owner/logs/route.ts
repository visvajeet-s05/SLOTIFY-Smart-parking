import { prisma } from "../../../../lib/prisma"
import { getCurrentUser } from "../../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()

  const owner = await prisma.ownerprofile.findUnique({
    where: { userId: user.id },
  })

  if (!owner) {
    return Response.json({ error: "Owner profile not found" }, { status: 404 })
  }

  const lots = await prisma.parkinglot.findMany({
    where: {
      ownerId: owner.id,
    },
    select: { id: true },
  })

  const lotIds = lots.map((lot) => lot.id)
  const logs = await prisma.booking.findMany({
    where: {
      parkingLotId: { in: lotIds },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return Response.json(logs)
}
