"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LocationStep() {
  const [address, setAddress] = useState("")
  const router = useRouter()

  const save = async () => {
    await fetch("/api/owner/setup/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })

    router.push("/dashboard/owner/setup/slots")
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Parking Location</h3>

      <input
        placeholder="Enter address"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
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
