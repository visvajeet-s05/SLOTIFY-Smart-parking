import { NextRequest } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = headers().get("stripe-signature")!

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

        // Log the activity
        await prisma.activityLog.create({
          data: {
            userId: subscription.userId,
            action: "Subscription activated",
            metadata: { subscriptionId, invoiceId: invoice.id }
          }
        })
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
