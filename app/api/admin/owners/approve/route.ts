import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { ownerId } = await req.json()

  await prisma.ownerprofile.update({
    where: { userId: ownerId },
    data: { status: "APPROVED" },
  })

  return NextResponse.json({ success: true })
}
