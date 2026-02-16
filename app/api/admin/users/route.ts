
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const role = searchParams.get("role")
        const search = searchParams.get("search")

        const where: any = {}
        if (role && role !== "ALL") {
            where.role = role
        }
        if (search) {
            where.OR = [
                { name: { contains: search } }, // Case insensitive in specific DBs, but Prisma manages it
                { email: { contains: search } },
            ]
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                lastLoginAt: true,
                walletBalance: true,
                // _count: { select: { booking_booking_customerIdTouser: true } } // booking count
                // Simplified for now to avoid errors if relations vary
            },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Error fetching admin users:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
