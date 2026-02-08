import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                vehicle: {
                    include: {
                        fastag: true // Include Fastag details
                    },
                    take: 1
                },
                fastags: true // Or directly if updated in user model
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Prioritize vehicle with fastag or just the first vehicle
        const vehicle = user.vehicle[0] || null
        const fastag = vehicle?.fastag?.tagId || user.fastags[0]?.tagId || null

        return NextResponse.json({
            vehicle: vehicle,
            fastagId: fastag,
            userId: user.id
        })
    } catch (error) {
        console.error("[USER_PROFILE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
