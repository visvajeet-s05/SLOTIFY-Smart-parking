"use client"

import { useState } from "react"

type SlotType = {
  id: string
  label: string
  count: number
}

export default function SlotConfigurationStep() {
  const [slots, setSlots] = useState<SlotType[]>([
    { id: "regular", label: "Regular", count: 10 },
    { id: "compact", label: "Compact", count: 0 },
    { id: "large", label: "Large", count: 0 },
    { id: "ev", label: "EV Charging", count: 0 },
    { id: "disabled", label: "Disabled", count: 0 },
  ])

  const updateCount = (id: string, value: number) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, count: Math.max(0, value) } : s
      )
    )
  }

  const totalSlots = slots.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Slot Configuration</h2>
        <p className="text-sm text-gray-400">
          Define the number and types of parking slots available.
        </p>
      </div>

      {/* Slot Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="bg-gray-800/40 border border-gray-700 rounded p-4"
          >
            <label className="block text-sm font-medium mb-2">
              {slot.label}
            </label>

            <input
              type="number"
              min={0}
              value={slot.count}
              onChange={(e) =>
                updateCount(slot.id, Number(e.target.value))
              }
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Total Slots Configured
          </span>
          <span className="text-lg font-semibold">{totalSlots}</span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-800/30 border border-gray-700 rounded p-4 text-sm text-gray-400">
        Slots defined here will be used for pricing, availability,
        occupancy tracking, and QR verification.
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="text-sm text-gray-400 hover:underline">
          ← Back
        </button>

        <button
          disabled={totalSlots === 0}
          className={`px-6 py-2 rounded text-sm text-white ${
            totalSlots === 0
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}