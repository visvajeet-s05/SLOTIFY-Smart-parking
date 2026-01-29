"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ParkingSlotGridProps {
  rows: number
  cols: number
  selectedSlot: string | null
  onSelectSlot: (slotId: string) => void
}

type SlotStatus = "free" | "occupied" | "reserved" | "ev" | "disabled"

interface SlotInfo {
  id: string
  status: SlotStatus
  price: number
  size: "standard" | "compact" | "large"
}

export default function ParkingSlotGrid({ rows, cols, selectedSlot, onSelectSlot }: ParkingSlotGridProps) {
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

  // Generate random slots
  useEffect(() => {
    const generateSlots = () => {
      const newSlots: SlotInfo[] = []
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const id = `${letters[r]}${c + 1}`

          // Randomly determine slot status
          let status: SlotStatus = "free"
          const rand = Math.random()

          if (rand < 0.3) {
            status = "occupied"
          } else if (rand < 0.4) {
            status = "reserved"
          } else if (rand < 0.5) {
            status = "ev"
          } else if (rand < 0.55) {
            status = "disabled"
          }

          // Randomly determine price (between $4 and $8)
          const price = Math.floor(Math.random() * 4) + 4

          // Randomly determine size
          const sizeRand = Math.random()
          let size: "standard" | "compact" | "large" = "standard"

          if (sizeRand < 0.2) {
            size = "compact"
          } else if (sizeRand > 0.8) {
            size = "large"
          }

          newSlots.push({ id, status, price, size })
        }
      }

      return newSlots
    }

    setSlots(generateSlots())
  }, [rows, cols])

  const getSlotColor = (status: SlotStatus) => {
    switch (status) {
      case "free":
        return "bg-green-500 hover:bg-green-600"
      case "occupied":
        return "bg-red-500 cursor-not-allowed"
      case "reserved":
        return "bg-yellow-500 cursor-not-allowed"
      case "ev":
        return "bg-blue-500 hover:bg-blue-600"
      case "disabled":
        return "bg-gray-500 cursor-not-allowed"
    }
  }

  const handleSlotClick = (slot: SlotInfo) => {
    if (slot.status === "free" || slot.status === "ev") {
      onSelectSlot(slot.id)
    }
  }

  return (
    <div className="grid grid-cols-10 gap-2">
      {slots.map((slot) => (
        <motion.div
          key={slot.id}
          whileHover={{ scale: 1.05 }}
          className={cn(
            "relative h-12 rounded-md flex items-center justify-center text-white font-medium transition-colors",
            getSlotColor(slot.status),
            selectedSlot === slot.id && "ring-2 ring-white ring-offset-2 ring-offset-gray-900",
          )}
          onClick={() => handleSlotClick(slot)}
          onMouseEnter={() => setHoveredSlot(slot.id)}
          onMouseLeave={() => setHoveredSlot(null)}
        >
          {slot.id}

          {/* Tooltip */}
          {hoveredSlot === slot.id && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-24 z-10">
              <div className="font-semibold">{slot.id}</div>
              <div>${slot.price}/hr</div>
              <div className="capitalize">{slot.size}</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

