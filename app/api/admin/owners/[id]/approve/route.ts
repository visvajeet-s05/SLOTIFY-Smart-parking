import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.ownerProfile.update({
      where: { userId: id },
      data: {
        status: "APPROVED",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving owner:", error)
    return NextResponse.json(
      { error: "Failed to approve owner" },
      { status: 500 }
    )
  }
}
