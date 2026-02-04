import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { Role } from "@/lib/auth/roles"

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const owners = await prisma.ownerprofile.findMany({
      where: {
        status: {
          in: ["KYC_PENDING", "KYC_REJECTED"],
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
