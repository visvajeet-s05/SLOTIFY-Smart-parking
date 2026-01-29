import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  const owner = await prisma.ownerProfile.findUnique({
    where: { userId: user.id },
  })

  const settlements = await prisma.settlement.findMany({
    where: { ownerId: user.id },
    include: {
      invoice: true
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(settlements)
}
