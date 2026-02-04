import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  const owner = await prisma.ownerprofile.findUnique({
    where: { userId: user.id },
  })

  if (!owner) {
    return NextResponse.json({ error: "Owner profile not found" }, { status: 404 })
  }

  const invoices = await prisma.ownerinvoice.findMany({
    where: { ownerId: owner.id },
    orderBy: { generatedAt: "desc" },
  })

  return NextResponse.json(invoices)
}
