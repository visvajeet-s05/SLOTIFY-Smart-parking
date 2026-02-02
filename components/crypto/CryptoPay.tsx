"use client"

import { useAccount, useWriteContract } from "wagmi"
import { parseUnits } from "viem"
import ABI from "../abi/SlotifyPayments.json"

export default function CryptoPay({ ownerWallet }: { ownerWallet: string }) {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  const pay = async () => {
    writeContract({
      address: process.env.NEXT_PUBLIC_CONTRACT!,
      abi: ABI,
      functionName: "pay",
      args: [
        process.env.NEXT_PUBLIC_USDC!,
        ownerWallet,
        parseUnits("10", 6)
      ]
    })
  }

  return (
    <button
      onClick={pay}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 rounded-lg text-white"
    >
      Pay 10 USDC
    </button>
  )
}