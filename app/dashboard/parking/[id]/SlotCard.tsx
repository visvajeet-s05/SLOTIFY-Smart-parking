"use client"

import React from "react"
import { motion } from "framer-motion"

interface Slot {
  id: string
  number: number
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED"
  price: number
}

interface SlotCardProps {
  slot: Slot
  isSelected: boolean
  onClick: () => void
}

export default function SlotCard({ slot, isSelected, onClick }: SlotCardProps) {
  const getColor = () => {
    switch (slot.status) {
      case "AVAILABLE":
        return "bg-emerald-500"
      case "OCCUPIED":
        return "bg-red-500"
      case "RESERVED":
        return "bg-yellow-400"
      default:
        return "bg-gray-500"
    }
  }

  const isClickable = slot.status === "AVAILABLE"

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.05 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      onClick={isClickable ? onClick : undefined}
      className={`
        h-16 rounded-xl text-white flex items-center justify-center
        font-semibold cursor-pointer transition-all duration-200
        ${getColor()}
        ${!isClickable && "opacity-60 cursor-not-allowed"}
        ${isSelected ? "ring-4 ring-indigo-500 ring-offset-2 ring-offset-black scale-105" : ""}
        hover:shadow-lg hover:shadow-${getColor().replace("bg-", "")}/30
      `}
    >
      <span className="text-sm">S{slot.number}</span>
    </motion.div>
  )
}
