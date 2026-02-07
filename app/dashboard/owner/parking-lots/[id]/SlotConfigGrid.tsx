"use client"

import { useEffect, useState, useCallback } from "react"
import SlotAdminCard from "./SlotAdminCard"
import { Loader2, Grid3X3 } from "lucide-react"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"


type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED"
type SlotSource = "AI" | "OWNER" | "BOOKING" | "SYSTEM"

interface Slot {
  id: string
  slotNumber: number
  status: SlotStatus
  source: SlotSource
  confidence?: number
}

interface SlotConfigGridProps {
  parkingLotId: string
  lotSlug: string
}

export default function SlotConfigGrid({ parkingLotId, lotSlug }: SlotConfigGridProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  // Use shared WebSocket from context
  const { isConnected: wsConnected, lastMessage } = useOwnerWS()

  // Fetch initial slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch(`/api/parking/${parkingLotId}/slots`)
        if (!response.ok) throw new Error("Failed to fetch slots")
        
        const data = await response.json()
        if (data.slots) {
          setSlots(data.slots)
        }
      } catch (err) {
        console.error("Error fetching slots:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [parkingLotId])

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (!lastMessage) return

    if (lastMessage.type === "SLOT_UPDATE") {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === lastMessage.slotId
            ? {
                ...slot,
                status: lastMessage.status as SlotStatus,
                confidence: lastMessage.confidence,
                source: lastMessage.updatedBy as SlotSource
              }
            : slot
        )
      )
      setLastUpdate(new Date())
    }
  }, [lastMessage])


  const handleSlotUpdate = useCallback((updatedSlot: Slot) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.slotNumber === updatedSlot.slotNumber ? updatedSlot : slot
      )
    )
  }, [])

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-gray-400">Loading slot configuration...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Slot Configuration</h3>
          <span className="text-gray-400 text-sm">({slots.length} slots)</span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-xs text-gray-400">{wsConnected ? "Live" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-600" />
            <span className="text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-600" />
            <span className="text-gray-400">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-600" />
            <span className="text-gray-400">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-600" />
            <span className="text-gray-400">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Slot Grid - 8 per row */}
      <div className="p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {slots.map((slot) => (
            <SlotAdminCard
              key={slot.id}
              slot={slot}
              lotSlug={lotSlug}
              onUpdate={handleSlotUpdate}
            />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Click dropdown to change slot status</span>
          <span>AI updates are overridden by owner actions</span>
        </div>
      </div>
    </div>
  )
}
