import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  const owner = await prisma.ownerProfile.findUnique({
    where: { userId: user.id },
  })

  const invoices = await prisma.invoice.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(invoices)
}
