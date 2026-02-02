import { ethers } from "ethers"
import prisma from "./prisma"

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const contract = new ethers.Contract(
  process.env.CONTRACT!,
  require("./abi.json"),
  provider
)

contract.on("PaymentProcessed", async (payer, owner, amount, token) => {
  await prisma.blockchainPayment.create({
    data: {
      payer,
      owner,
      amount: amount.toString(),
      token
    }
  })
})