import { prisma } from "../../../../lib/prisma"
import { getCurrentUser } from "../../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()

  const occupancy = await prisma.parkingOccupancy.findMany({
    where: {
      parkingLot: { owner: { userId: user.id } },
    },
  })

  return Response.json(occupancy)
}
