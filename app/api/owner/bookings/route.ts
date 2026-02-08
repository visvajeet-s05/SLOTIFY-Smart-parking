import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email || session.user.role !== "OWNER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Map owner email to lotId (matching your frontend logic)
        const OWNER_PARKING_MAPPING: Record<string, string> = {
            "owner@gmail.com": "CHENNAI_CENTRAL",
            "owner1@gmail.com": "ANNA_NAGAR",
            "owner2@gmail.com": "T_NAGAR",
            "owner3@gmail.com": "VELACHERY",
            "owner4@gmail.com": "OMR",
            "owner5@gmail.com": "ADYAR",
            "owner6@gmail.com": "GUINDY",
            "owner7@gmail.com": "PORUR"
        };

        const lotId = OWNER_PARKING_MAPPING[session.user.email];

        if (!lotId) {
            return new NextResponse("Parking Lot Not Found", { status: 404 });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                parkingLotId: lotId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user_booking_customerIdTouser: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                slot: {
                    select: {
                        slotNumber: true,
                        row: true
                    }
                }
            }
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("[OWNER_BOOKINGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
