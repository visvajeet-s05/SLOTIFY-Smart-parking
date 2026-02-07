"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SlotCardProps {
  slotId: string
  price: number
  status: "available" | "reserved" | "occupied"
  isSelected?: boolean
  onSelect?: (slotId: string) => void
}

export default function SlotCard({ slotId, price, status, isSelected = false, onSelect }: SlotCardProps) {
  const handleSelect = () => {
    if (status === "available" && onSelect) {
      onSelect(slotId)
    }
  }

  return (
    <motion.div
      className={cn(
        "relative rounded-lg px-3 py-4 border text-center transition-all duration-200",
        "flex flex-col justify-center cursor-pointer",
        "hover:transform hover:-translate-y-1",

        status === "available" &&
          "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20",

        status === "reserved" &&
          "bg-amber-500/10 border-amber-500/30 cursor-not-allowed",

        status === "occupied" &&
          "bg-red-500/5 border-red-500/25 cursor-not-allowed opacity-70",

        isSelected &&
          "bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500/40 scale-[1.04]"
      )}
      onClick={handleSelect}
    >
      <span className="text-sm font-semibold text-white">
        {slotId}
      </span>
      <span className="text-xs text-gray-400 mt-1">
        ₹{price} / hr
      </span>

      {isSelected && (
        <span className="absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
          Selected
        </span>
      )}
    </motion.div>
  )
}
