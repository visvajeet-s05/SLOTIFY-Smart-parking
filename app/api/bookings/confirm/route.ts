import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const { bookingId, slotId, parkingLotId, paymentId } = await req.json()

        if (!bookingId || !slotId) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        console.log(`[CONFIRM_BOOKING] Finalizing booking ${bookingId} for slot ${slotId}`)

        // 1. Update Booking Status -> ACTIVE (or CONFIRMED)
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "ACTIVE" } // or UPCOMING/CONFIRMED
        })

        // 2. Update Payment Status -> PAID (if not already handled by webhook)
        // Ideally handled by webhook, but for direct flow:
        if (paymentId) {
            try {
                await prisma.payment.update({
                    where: { bookingId: bookingId }, // Assuming 1:1 relation or finding by stripeId
                    data: { status: "PAID", confirmedAt: new Date() }
                })
            } catch (e) {
                console.warn("Could not update payment status (might already be updated)", e)
            }
        }

        // 3. Mark Slot as RESERVED
        const slot = await prisma.slot.findUnique({ where: { id: slotId } })
        if (!slot) return new NextResponse("Slot not found", { status: 404 })

        const updatedSlot = await prisma.slot.update({
            where: { id: slotId },
            data: {
                status: "RESERVED",
                updatedAt: new Date(),
                // updatedBy: "CUSTOMER" // If your schema supports this
            }
        })

        // 4. Broadcast via WebSocket
        try {
            await fetch("http://localhost:4000/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "SLOT_UPDATE",
                    lotSlug: parkingLotId,
                    slotNumber: updatedSlot.slotNumber,
                    slotId: updatedSlot.id,
                    status: "RESERVED",
                    oldStatus: slot.status,
                    source: "CUSTOMER",
                    bookingId: bookingId
                })
            })
        } catch (wsError) {
            console.error("Failed to broadcast confirmation:", wsError)
        }

        return NextResponse.json({ success: true, slot: updatedSlot })

    } catch (error) {
        console.error("[CONFIRM_BOOKING_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
