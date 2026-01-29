import { prisma } from "../../../../lib/prisma"
import { getCurrentUser } from "../../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()

  const logs = await prisma.entryExitLog.findMany({
    where: {
      parkingLot: { owner: { userId: user.id } },
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(logs)
}
