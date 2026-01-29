"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PricingStep() {
  const [price, setPrice] = useState(50)
  const router = useRouter()

  const save = async () => {
    await fetch("/api/owner/setup/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    })

    router.push("/dashboard/owner/setup/amenities")
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Pricing</h3>

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />

      <button
        onClick={save}
        className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm"
      >
        Next
      </button>
    </div>
  )
}
