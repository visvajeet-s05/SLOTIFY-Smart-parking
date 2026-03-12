import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const parkingLot = await prisma.parkinglot.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                address: true,
                lat: true,
                lng: true,
                status: true,
                totalSlots: true,
                cameraUrl: true,
                createdAt: true
            }
        })

        if (!parkingLot) {
            return new NextResponse("Parking lot not found", { status: 404 })
        }

        return NextResponse.json(parkingLot)
    } catch (error) {
        console.error("[PARKING_LOT_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
