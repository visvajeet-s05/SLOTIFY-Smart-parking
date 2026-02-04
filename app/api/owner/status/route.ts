import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ownerId = searchParams.get("ownerId")

  if (!ownerId) {
    return NextResponse.json({ error: "Owner ID required" }, { status: 400 })
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: {
      ownerprofile: {
        select: {
          status: true,
        },
      },
    },
  })

  if (!owner || !owner.ownerprofile) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 })
  }

  return NextResponse.json({ status: owner.ownerprofile.status })
}
