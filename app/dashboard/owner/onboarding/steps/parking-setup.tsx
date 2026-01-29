"use client"

import { useState } from "react"

export default function ParkingSetupStep() {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [totalSlots, setTotalSlots] = useState("")
  const [type, setType] = useState("OPEN")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Parking Lot Setup</h2>
        <p className="text-sm text-gray-400">
          Register your first parking facility.
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parking Name */}
        <div>
          <label className="text-xs text-gray-400">Parking Lot Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Downtown Plaza Parking"
            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Parking Type */}
        <div>
          <label className="text-xs text-gray-400">Parking Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            <option value="OPEN">Open</option>
            <option value="COVERED">Covered</option>
            <option value="BASEMENT">Basement</option>
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, Area, City, Pincode"
            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {/* Total Slots */}
        <div>
          <label className="text-xs text-gray-400">Total Slots</label>
          <input
            type="number"
            value={totalSlots}
            onChange={(e) => setTotalSlots(e.target.value)}
            placeholder="50"
            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-800/40 border border-gray-700 rounded p-4 text-sm text-gray-400">
        You can add more parking lots later from the dashboard.
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="text-sm text-gray-400 hover:underline">
          ← Back
        </button>

        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}