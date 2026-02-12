import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { slotId, duration, amount, licensePlate, vehicleModel, parkingLotId, currency = "inr" } = body

        if (!slotId || !duration || !amount || !parkingLotId) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                vehicle: true
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Check if slot is available
        const slot = await prisma.slot.findUnique({
            where: { id: slotId }
        })

        if (!slot) {
            return new NextResponse("Slot not found", { status: 404 })
        }

        if (slot.status !== "AVAILABLE") {
            // Ideally verify if it's reserved for THIS user, but for now strict check
            return new NextResponse("Slot is no longer available", { status: 409 })
        }

        // Vehicle Logic (Reuse from bookings/route.ts)
        let vehicleId = null
        const existingVehicle = user.vehicle.find(v => v.licensePlate === licensePlate)

        if (existingVehicle) {
            vehicleId = existingVehicle.id
        } else if (licensePlate) {
            const specificVehicleModel = vehicleModel || "Unknown Model"
            const newVehicle = await prisma.vehicle.create({
                data: {
                    id: `VEH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                    userId: user.id,
                    licensePlate: licensePlate,
                    model: specificVehicleModel,
                    make: "Unknown",
                    color: "Unknown",
                    updatedAt: new Date()
                }
            })
            vehicleId = newVehicle.id
        }

        const startTime = new Date()
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000)

        // Fetch parking lot owner
        const parkingLot = await prisma.parkinglot.findUnique({
            where: { id: parkingLotId },
            include: {
                ownerprofile: {
                    select: { userId: true } // Owner's User ID
                }
            }
        })

        if (!parkingLot) {
            return new NextResponse("Parking lot not found", { status: 404 })
        }

        const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

        let clientSecret = ""
        let paymentIntentId = ""
        let isMock = false

        try {
            // Check for valid keys
            if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
                throw new Error("Stripe keys are missing or placeholders")
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true },
                metadata: {
                    bookingId: bookingId,
                    slotId: slotId,
                    userId: user.id,
                    parkingLotId: parkingLotId
                }
            })
            clientSecret = paymentIntent.client_secret!
            paymentIntentId = paymentIntent.id
        } catch (stripeError) {
            console.warn("Stripe initialization failed (running in Mock Mode):", stripeError)
            // Fallback: Generate a mock secret for the frontend to detect
            clientSecret = "mock_secret_live_demo"
            paymentIntentId = `pi_mock_${Date.now()}`
            isMock = true
        }

        // Create Booking (UPCOMING)
        const booking = await prisma.booking.create({
            data: {
                id: bookingId,
                customerId: user.id,
                ownerId: parkingLot.ownerprofile.userId,
                parkingLotId: parkingLotId,
                slotId: slotId,
                startTime: startTime,
                endTime: endTime,
                amount: parseFloat(amount),
                vehicleType: vehicleModel || "Car",
                status: "UPCOMING",
            }
        })

        // Create Payment Record (PENDING)
        await prisma.payment.create({
            data: {
                id: crypto.randomUUID(),
                bookingId: bookingId,
                stripeId: paymentIntentId,
                amount: parseFloat(amount),
                currency: currency.toLowerCase(),
                status: "PENDING",
                updatedAt: new Date()
            }
        })

        // Reserve the Slot (Prevent double booking)
        const updatedSlot = await prisma.slot.update({
            where: { id: slotId },
            data: {
                status: "RESERVED",
                updatedAt: new Date()
            }
        })

        // Broadcast update via WebSocket
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
                    bookingId: booking.id
                })
            })
        } catch (wsError) {
            console.error("Failed to broadcast booking update:", wsError)
        }

        return NextResponse.json({
            clientSecret: clientSecret,
            bookingId: bookingId,
            paymentIntentId: paymentIntentId,
            isMock: isMock
        })

    } catch (error) {
        console.error("[PAYMENTS_CREATE_INTENT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
