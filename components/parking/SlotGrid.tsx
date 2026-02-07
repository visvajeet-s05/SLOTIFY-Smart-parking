import { useState } from "react"

type Slot = {
  id: number
  label: string
  status: "available" | "occupied" | "disabled"
}

type Props = {
  slots: Slot[]
  mode: "customer" | "owner"
  onToggleStatus?: (id: number) => void
}

export default function SlotGrid({ slots, mode, onToggleStatus }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
      {slots.map(slot => (
        <div
          key={slot.id}
          onClick={() => {
            if (mode === "owner" && onToggleStatus) {
              onToggleStatus(slot.id)
            }
          }}
          className={`
            rounded-lg border text-center py-3 cursor-pointer transition
            ${
              slot.status === "available"
                ? "bg-emerald-500/10 border-emerald-500/40"
                : slot.status === "occupied"
                ? "bg-red-500/10 border-red-500/40"
                : "bg-gray-800 border-gray-700"
            }
            ${mode === "owner" ? "hover:ring-2 hover:ring-indigo-500" : ""}
          `}
        >
          <div className="text-sm font-semibold text-white">
            {slot.label}
          </div>

          {mode === "owner" && (
            <div className="text-xs text-gray-400 mt-1">
              Click to toggle
            </div>
          )}
        </div>
      ))}
    </div>
  )
}