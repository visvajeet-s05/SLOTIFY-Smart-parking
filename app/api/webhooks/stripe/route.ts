
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.PaymentIntent

    if (event.type === "payment_intent.succeeded") {
        const bookingId = session.metadata.bookingId
        const slotId = session.metadata.slotId
        const parkingLotId = session.metadata.parkingLotId

        console.log(`[WEBHOOK] Payment succeeded for booking ${bookingId}`)

        // 1. Update Booking Status -> ACTIVE
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "ACTIVE" },
        })

        // 2. Update Payment Status -> PAID
        await prisma.payment.updateMany({
            where: { bookingId: bookingId },
            data: { status: "PAID", confirmedAt: new Date() }
        })

        // 3. Mark Slot as RESERVED
        if (slotId) {
            const updatedSlot = await prisma.slot.update({
                where: { id: slotId },
                data: {
                    status: "RESERVED",
                    updatedAt: new Date()
                }
            })

            // 4. Broadcast via WebSocket (using the broadcast endpoint for convenience)
            // Ideally use a direct Redis/PubSub if available, but this works for MVP
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
                        oldStatus: "AVAILABLE", // Approximated
                        source: "CUSTOMER",
                        bookingId: bookingId
                    })
                })
            } catch (wsError) {
                console.error("Failed to broadcast webhook update:", wsError)
            }
        }
    }

    return new NextResponse(null, { status: 200 })
}
