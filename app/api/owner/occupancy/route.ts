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
    include: { slots: true },
  })

  const occupancy = lots.map((lot: any) => {
    const totalSlots = lot.slots.length
    const occupiedSlots = lot.slots.filter((slot: any) => slot.status === "OCCUPIED" || slot.status === "RESERVED").length
    return {
      parkingLotId: lot.id,
      totalSlots,
      activeSlots: totalSlots - occupiedSlots,
    }
  })

  return Response.json(occupancy)
}
