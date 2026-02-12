import { NextRequest } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const sig = headersList.get("stripe-signature")!

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message)
      return Response.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object
      const subscriptionId = invoice.subscription

      // Find the subscription in our database
      const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId }
      })

      if (subscription) {
        // Activate the subscription
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "ACTIVE" }
        })
      }
    } else if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object

      // Update payment status
      try {
        await prisma.payment.update({
          where: { stripeId: intent.id },
          data: {
            status: "PAID",
            confirmedAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`Payment confirmed for intent: ${intent.id}`)
      } catch (err) {
        console.error(`Error updating payment ${intent.id}:`, err)
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object

      try {
        await prisma.payment.update({
          where: { stripeId: intent.id },
          data: {
            status: "FAILED",
            updatedAt: new Date()
          }
        })
        console.log(`Payment failed for intent: ${intent.id}`)
      } catch (err) {
        console.error(`Error updating payment failure ${intent.id}:`, err)
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
