"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

type Slot = {
  id: number
  label: string
  type: "REGULAR" | "EV" | "DISABLED"
  active: boolean
}

export default function SlotConfigurationPage() {
  const [slots, setSlots] = useState<Slot[]>([
    { id: 1, label: "A1", type: "REGULAR", active: true },
    { id: 2, label: "A2", type: "EV", active: true },
    { id: 3, label: "B1", type: "DISABLED", active: false },
  ])

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        id: Date.now(),
        label: `S${slots.length + 1}`,
        type: "REGULAR",
        active: true,
      },
    ])
  }

  const updateSlot = (id: number, key: keyof Slot, value: any) => {
    setSlots(slots.map(slot => slot.id === id ? { ...slot, [key]: value } : slot))
  }

  const removeSlot = (id: number) => {
    setSlots(slots.filter(slot => slot.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Slot Configuration</h1>
          <p className="text-sm text-gray-400">
            Define parking layout and slot types
          </p>
        </div>

        <button
          onClick={addSlot}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700
                     text-white px-4 py-2 rounded-md text-sm"
        >
          <Plus size={16} />
          Add Slot
        </button>
      </div>

      {/* Slot Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {slots.map(slot => (
              <tr key={slot.id} className="border-t border-gray-800">
                <td className="px-4 py-3">
                  <input
                    value={slot.label}
                    onChange={e => updateSlot(slot.id, "label", e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-20"
                  />
                </td>

                <td className="px-4 py-3">
                  <select
                    value={slot.type}
                    onChange={e => updateSlot(slot.id, "type", e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="EV">EV</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </td>

                <td className="px-4 py-3">
                  <select
                    value={slot.active ? "ACTIVE" : "INACTIVE"}
                    onChange={e => updateSlot(slot.id, "active", e.target.value === "ACTIVE")}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm">
          Save Configuration
        </button>
      </div>
    </div>
  )
}
