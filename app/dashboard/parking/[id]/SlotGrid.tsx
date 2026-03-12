"use client"

import React from "react"
import SlotCard, { SlotProps } from "./SlotCard"

interface SlotGridProps {
  slots: any[]
  selectedSlotId: string | null
  onSelect: (slot: any) => void
}

export default function SlotGrid({ slots, selectedSlotId, onSelect }: SlotGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {slots.map((slot) => {
        // Map backend slot to SlotCard props
        let cardStatus: SlotProps["status"] = "AVAILABLE"
        if (slot.status === "OCCUPIED") cardStatus = "OCCUPIED"
        if (slot.status === "RESERVED") cardStatus = "RESERVED"
        if (slot.status === "DISABLED") cardStatus = "DISABLED"

        let cardType: SlotProps["type"] = "STANDARD"
        if (slot.type === "EV") cardType = "EV"
        if (slot.type === "HANDICAP") cardType = "HANDICAP"

        return (
          <SlotCard
            key={slot.id}
            id={slot.id}
            slotNumber={slot.slotNumber}
            status={cardStatus}
            price={slot.price}
            type={cardType}
            isSelected={selectedSlotId === slot.id}
            onClick={() => onSelect(slot)}
          />
        )
      })}
    </div>
  )
}
