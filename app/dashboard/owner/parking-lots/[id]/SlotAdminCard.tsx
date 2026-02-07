"use client"

import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"

type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED"
type SlotSource = "AI" | "OWNER" | "BOOKING" | "SYSTEM"

interface Slot {
  id: string
  slotNumber: number
  status: SlotStatus
  source: SlotSource
  confidence?: number
}

interface SlotAdminCardProps {
  slot: Slot
  lotSlug: string
  onUpdate?: (slot: Slot) => void
}

export default function SlotAdminCard({ slot, lotSlug, onUpdate }: SlotAdminCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSlot, setCurrentSlot] = useState<Slot>(slot)

  const getStatusColor = (status: SlotStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-600 hover:bg-emerald-500"
      case "OCCUPIED":
        return "bg-red-600 hover:bg-red-500"
      case "RESERVED":
        return "bg-yellow-600 hover:bg-yellow-500"
      case "DISABLED":
        return "bg-gray-600 hover:bg-gray-500"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusBorder = (status: SlotStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "border-emerald-500"
      case "OCCUPIED":
        return "border-red-500"
      case "RESERVED":
        return "border-yellow-500"
      case "DISABLED":
        return "border-gray-500"
      default:
        return "border-gray-600"
    }
  }

  const getSourceBadge = (source: SlotSource) => {
    const colors = {
      AI: "text-cyan-400",
      OWNER: "text-purple-400",
      BOOKING: "text-blue-400",
      SYSTEM: "text-gray-400"
    }
    return <span className={`text-[10px] ${colors[source]}`}>{source}</span>
  }

  const handleStatusChange = async (newStatus: SlotStatus) => {
    if (newStatus === currentSlot.status) return

    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch("/api/owner/slots/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotSlug,
          slotNumber: currentSlot.slotNumber,
          status: newStatus,
          confidence: 100
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update slot")
      }

      const data = await response.json()
      
      // Update local state
      const updatedSlot = { ...currentSlot, status: newStatus, source: "OWNER" as SlotSource }
      setCurrentSlot(updatedSlot)
      
      // Notify parent
      onUpdate?.(updatedSlot)
      
    } catch (err: any) {
      setError(err.message)
      console.error("Error updating slot:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className={`relative h-20 rounded-xl border-2 ${getStatusBorder(currentSlot.status)} overflow-hidden transition-all hover:shadow-lg`}>
      {/* Background */}
      <div className={`absolute inset-0 ${getStatusColor(currentSlot.status)} opacity-90`} />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-2">
        {/* Slot Number */}
        <span className="text-white font-bold text-lg">
          S{String(currentSlot.slotNumber).padStart(2, "0")}
        </span>
        
        {/* Status Select */}
        <div className="mt-1 w-full">
          <select
            value={currentSlot.status}
            onChange={(e) => handleStatusChange(e.target.value as SlotStatus)}
            disabled={isUpdating}
            className="w-full bg-black/40 text-white text-xs rounded px-2 py-1 border border-white/20 focus:outline-none focus:border-white/50 disabled:opacity-50"
          >
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
            <option value="DISABLED">Maintenance</option>
          </select>
        </div>

        {/* Source Badge */}
        <div className="absolute top-1 right-1">
          {getSourceBadge(currentSlot.source)}
        </div>

        {/* Confidence Indicator */}
        {currentSlot.confidence && (
          <div className="absolute bottom-1 left-1">
            <span className="text-[10px] text-white/80">
              {currentSlot.confidence}%
            </span>
          </div>
        )}

        {/* Loading Overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}

        {/* Error Indicator */}
        {error && (
          <div className="absolute top-1 left-1" title={error}>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
        )}
      </div>
    </div>
  )
}
