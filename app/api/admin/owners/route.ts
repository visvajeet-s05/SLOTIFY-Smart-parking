import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const owners = await prisma.ownerProfile.findMany({
      where: {
        status: {
          in: ["KYC_PENDING", "REJECTED"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        verification: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(owners)
  } catch (error) {
    console.error("Error fetching owners:", error)
    return NextResponse.json(
      { error: "Failed to fetch owners" },
      { status: 500 }
    )
  }
}
