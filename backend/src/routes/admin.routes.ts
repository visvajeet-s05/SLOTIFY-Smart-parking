import { Router } from "express"
import { auth } from "../middleware/auth"
import { role } from "../middleware/role"
import prisma from "../prisma"

const router = Router()

// Get all payments (both Stripe and blockchain)
router.get("/payments", auth, role(["ADMIN"]), async (_, res) => {
  try {
    const data = await prisma.payment.findMany({
      include: {
        refunds: true
      }
    })
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments", error })
  }
})

// Refund endpoint
router.post("/refund", auth, role(["ADMIN"]), async (req, res) => {
  const { paymentId, amount, reason } = req.body

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) return res.status(404).json({ error: "Payment not found" })

    // Call smart contract refund function (ethers)
    // const txHash = await refundOnChain(payment, amount)
    const txHash = "mock-tx-hash-" + Date.now()

    await prisma.refund.create({
      data: {
        paymentId,
        amount,
        txHash,
        reason
      }
    })

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REFUNDED" }
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: "Failed to process refund", error })
  }
})

export default router
