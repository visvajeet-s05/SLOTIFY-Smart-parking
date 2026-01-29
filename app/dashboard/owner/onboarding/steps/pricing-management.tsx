"use client"

import { useState } from "react"

type PricingRule = {
  id: string
  label: string
  hourly: number
  dailyCap: number
}

export default function PricingManagementStep() {
  const [pricing, setPricing] = useState<PricingRule[]>([
    { id: "regular", label: "Regular Slot", hourly: 40, dailyCap: 300 },
    { id: "compact", label: "Compact Slot", hourly: 30, dailyCap: 250 },
    { id: "large", label: "Large Slot", hourly: 60, dailyCap: 450 },
    { id: "ev", label: "EV Charging Slot", hourly: 80, dailyCap: 600 },
    { id: "disabled", label: "Disabled Slot", hourly: 0, dailyCap: 0 },
  ])

  const updatePricing = (
    id: string,
    field: "hourly" | "dailyCap",
    value: number
  ) => {
    setPricing((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: Math.max(0, value) } : p
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Pricing Management</h2>
        <p className="text-sm text-gray-400">
          Define pricing rules for each parking slot type.
        </p>
      </div>

      {/* Pricing Table */}
      <div className="space-y-4">
        {pricing.map((p) => (
          <div
            key={p.id}
            className="bg-gray-800/40 border border-gray-700 rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <div className="text-sm font-medium">{p.label}</div>
              {p.id === "disabled" && (
                <div className="text-xs text-gray-400">
                  Must be free as per regulations
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-400">Hourly Rate (₹)</label>
              <input
                type="number"
                min={0}
                value={p.hourly}
                disabled={p.id === "disabled"}
                onChange={(e) =>
                  updatePricing(p.id, "hourly", Number(e.target.value))
                }
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Daily Cap (₹)</label>
              <input
                type="number"
                min={0}
                value={p.dailyCap}
                disabled={p.id === "disabled"}
                onChange={(e) =>
                  updatePricing(p.id, "dailyCap", Number(e.target.value))
                }
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
        Pricing defined here will be applied automatically during customer
        booking and revenue calculations.
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="text-sm text-gray-400 hover:underline">
          ← Back
        </button>

        <button className="px-6 py-2 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white">
          Continue →
        </button>
      </div>
    </div>
  )
}