"use client"

import { useEffect, useState } from "react"

import SlotGrid from "../../../../../components/SlotGrid"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"


type Slot = {
  id: string
  slotNumber: number
  row: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"
  aiConfidence: number
  updatedBy: "AI" | "OWNER" | "CUSTOMER" | "SYSTEM"
  updatedAt: string
  price: number
  slotType?: string
}


export default function OwnerSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [cameraUrl, setCameraUrl] = useState<string>("")
  
  // Use the shared WebSocket from context (no duplicate connections!)
  const { isConnected: wsConnected, lastMessage } = useOwnerWS()

  // Fetch initial data
  useEffect(() => {
    // Fetch slots
    fetch("/api/parking/chennai-central/slots")
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots || [])
      })

    // Fetch camera feed URL
    fetch("/api/parking/chennai-central/camera")
      .then(res => res.json())
      .then(data => {
        setCameraUrl(data.streamUrl || "")
      })
  }, [])

  // Handle WebSocket messages for live updates
  useEffect(() => {
    if (!lastMessage) return

    if (lastMessage.type === "SLOT_UPDATE") {
      setSlots(prev => prev.map(slot => 
        slot.id === lastMessage.slotId 
          ? { 
              ...slot, 
              status: lastMessage.status as Slot["status"], 
              aiConfidence: lastMessage.confidence || 0, 
              updatedBy: lastMessage.updatedBy || "SYSTEM" 
            }
          : slot
      ))
    }
  }, [lastMessage])



  const handleManualOverride = async (slotId: string, newStatus: Slot["status"]) => {
    try {
      const response = await fetch("/api/owner/slots/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, status: newStatus })
      })

      if (response.ok) {
        setSlots(prev => prev.map(slot => 
          slot.id === slotId 
            ? { ...slot, status: newStatus, updatedBy: "OWNER" }
            : slot
        ))
      }
    } catch (error) {
      console.error("Failed to update slot:", error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Parking Lot Management</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${wsConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {wsConnected ? "🟢 Live" : "🔴 Disconnected"}
          </span>
          <span className="text-gray-400">Chennai Central • 120 Slots</span>
        </div>
      </div>

      {/* Camera Feed */}
      {cameraUrl && (
        <div className="mb-8 bg-gray-900 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">📹 Live Camera Feed</h2>
          </div>
          <div className="p-4">
            <img 
              src={cameraUrl} 
              alt="Parking Lot Camera" 
              className="w-full max-w-2xl rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Slot Grid */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">🅿️ Slot Status</h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-gray-300">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span className="text-gray-300">Disabled</span>
            </div>
          </div>
        </div>

        <SlotGrid 
          slots={slots} 
          selectable={false} 
        />

        {/* AI Confidence Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">🤖 AI Detection Status</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-gray-400">
              <span className="text-white font-medium">{slots.filter(s => s.updatedBy === "AI").length}</span> AI-detected
            </div>
            <div className="text-gray-400">
              <span className="text-white font-medium">{slots.filter(s => s.updatedBy === "OWNER").length}</span> Manual overrides
            </div>
            <div className="text-gray-400">
              <span className="text-white font-medium">
                {Math.round(slots.reduce((acc, s) => acc + (s.aiConfidence || 0), 0) / (slots.length || 1))}%
              </span> Avg. confidence
            </div>
            <div className="text-gray-400">
              <span className="text-white font-medium">{slots.filter(s => s.status === "OCCUPIED").length}</span> Occupied
            </div>
          </div>
        </div>
      </div>

      {/* Manual Override Section */}
      <div className="mt-6 bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">⚙️ Manual Override</h2>
        <p className="text-gray-400 mb-4">Select a slot and change its status manually (Owner priority over AI)</p>
        <div className="grid grid-cols-4 gap-4">
          {slots.slice(0, 8).map(slot => (
            <div key={slot.id} className="flex flex-col gap-2">
              <span className="text-sm text-gray-400">Slot S{slot.slotNumber}</span>
              <select 
                value={slot.status}
                onChange={(e) => handleManualOverride(slot.id, e.target.value as Slot["status"])}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="RESERVED">Reserved</option>
                <option value="DISABLED">Disabled</option>
              </select>
              {slot.aiConfidence && (
                <span className="text-xs text-gray-500">
                  AI: {Math.round(slot.aiConfidence * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
