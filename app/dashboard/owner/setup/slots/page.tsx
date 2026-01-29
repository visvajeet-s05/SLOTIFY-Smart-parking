"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SlotsStep() {
  const [totalSlots, setTotalSlots] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function save() {
    if (!totalSlots || parseInt(totalSlots) <= 0) {
      alert("Please enter a valid number of slots")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/owner/parking/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalSlots: parseInt(totalSlots) }),
      })

      if (res.ok) {
        router.push("/dashboard/owner/setup/pricing")
      } else {
        alert("Failed to save slots")
      }
    } catch (error) {
      alert("Error saving slots")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Slot Configuration</h2>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Total Slots"
          value={totalSlots}
          onChange={(e) => setTotalSlots(e.target.value)}
          className="w-full p-2 border rounded"
          min="1"
        />
        <button
          onClick={save}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  )
}
