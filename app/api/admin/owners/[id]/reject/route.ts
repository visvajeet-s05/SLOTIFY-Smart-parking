import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { reason } = await req.json()

  await prisma.ownerProfile.update({
    where: { id },
    data: { status: "KYC_REJECTED" },
  })

  await prisma.ownerVerification.update({
    where: { ownerId: id },
    data: { status: "REJECTED", rejectionReason: reason, reviewedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
