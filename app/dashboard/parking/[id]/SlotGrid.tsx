"use client"

import React from "react"
import SlotCard from "./SlotCard"

interface Slot {
  id: string
  number: number
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED"
  price: number
}

interface SlotGridProps {
  slots: Slot[]
  selectedSlotId: string | null
  onSelect: (slot: Slot) => void
}

export default function SlotGrid({ slots, selectedSlotId, onSelect }: SlotGridProps) {
  return (
    <div className="grid grid-cols-8 gap-3">
      {slots.map((slot) => (
        <SlotCard
          key={slot.id}
          slot={slot}
          isSelected={selectedSlotId === slot.id}
          onClick={() => onSelect(slot)}
        />
      ))}
    </div>
  )
}
