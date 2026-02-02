import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET!)

export const createIntent = async (req, res) => {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "usd",
      metadata: { bookingId: req.body.bookingId }
    })

    res.json(intent)
  } catch (error) {
    res.status(500).json({ message: "Failed to create payment intent", error })
  }
}