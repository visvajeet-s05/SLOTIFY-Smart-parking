"use client"

import React from "react"
import { motion } from "framer-motion"
import { Zap, Accessibility } from "lucide-react"

export interface SlotProps {
  id: string
  slotNumber: number
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"
  price: number
  type?: "STANDARD" | "EV" | "HANDICAP"
  isSelected?: boolean
  onClick?: () => void
}

export default function SlotCard({
  slotNumber,
  status,
  price,
  type = "STANDARD",
  isSelected,
  onClick
}: SlotProps) {

  // Determine background color based on status and type
  const getBackgroundColor = () => {
    if (status === "OCCUPIED") return "bg-red-600 hover:bg-red-700"
    if (status === "RESERVED") return "bg-yellow-600 hover:bg-yellow-700"
    if (status === "DISABLED") return "bg-gray-600 hover:bg-gray-700"

    // If available, check type
    if (type === "EV") return "bg-blue-500 hover:bg-blue-600"
    if (type === "HANDICAP") return "bg-teal-500 hover:bg-teal-600"

    // Default available standard
    return "bg-green-500 hover:bg-green-600"
  }

  const isClickable = status === "AVAILABLE"

  return (
    <motion.button
      whileHover={isClickable ? { scale: 1.05 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`
        relative w-full aspect-square rounded-xl p-2 flex flex-col items-center justify-center
        transition-all duration-200 shadow-md
        ${getBackgroundColor()}
        ${isSelected ? "ring-4 ring-white ring-offset-2 ring-offset-gray-900 z-10 scale-105" : ""}
        ${!isClickable ? "cursor-not-allowed opacity-90" : "cursor-pointer"}
      `}
    >
      {/* Icons for special types */}
      <div className="absolute top-2 left-2 text-white/80">
        {type === "EV" && <Zap size={14} fill="currentColor" />}
        {type === "HANDICAP" && <Accessibility size={14} />}
      </div>

      {/* Checkmark for selection */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-white rounded-full p-0.5">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-white mb-0.5">S{slotNumber}</span>
        <span className="text-sm font-medium text-white/90">₹{price}</span>

        {/* Status Text for non-available slots */}
        {status !== "AVAILABLE" && (
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider mt-1">
            {status}
          </span>
        )}
      </div>
    </motion.button>
  )
}
