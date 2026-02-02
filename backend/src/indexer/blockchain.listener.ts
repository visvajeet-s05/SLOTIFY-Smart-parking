import { ethers } from "ethers"
import prisma from "../prisma"

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  require("./abi.json"),
  provider
)

contract.on("PaymentProcessed", async (payer, owner, amount, token, event) => {
  try {
    await prisma.payment.create({
      data: {
        bookingId: event.transactionHash,
        userId: payer,
        ownerWallet: owner,
        amount: amount.toString(),
        currency: "USDC",
        txHash: event.transactionHash,
        chain: "polygon",
        status: "PAID"
      }
    })
  } catch (error) {
    console.error("Failed to save blockchain payment:", error)
  }
})
