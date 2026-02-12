import Stripe from "stripe"

const apiKey = process.env.STRIPE_SECRET_KEY

// This allows the app to build/run even without keys, but WILL error when Stripe is used.
if (!apiKey) {
  console.warn("STRIPE_SECRET_KEY is missing from environment variables. Stripe functionality will fail.")
}

export const stripe = new Stripe(apiKey || "dummy_key_for_build", {
  apiVersion: "2026-01-28.clover",
  typescript: true,
})
