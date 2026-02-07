"use client"

import { useEffect, useState, useRef } from "react"

import { Brain, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface SlotConfidence {
  slotNumber: number
  status: string
  confidence: number
  source: string
  lastUpdated: string
}

interface AiConfidenceProps {
  parkingLotId: string
}

export default function AiConfidence({ parkingLotId }: AiConfidenceProps) {
  const [slotData, setSlotData] = useState<SlotConfidence[]>([])
  const [wsConnected, setWsConnected] = useState(false)
  const [averageConfidence, setAverageConfidence] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)


  useEffect(() => {
    // Fetch initial slot data
    fetch(`/api/parking/${parkingLotId}/slots`)
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) {
          const formatted = data.slots.map((slot: any) => ({
            slotNumber: slot.slotNumber,
            status: slot.status,
            confidence: slot.confidence || 95,
            source: slot.source,
            lastUpdated: slot.updatedAt
          }))
          setSlotData(formatted)
          updateAverageConfidence(formatted)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch slot data:", err)
      })

    // ⛔ Prevent duplicate connections
    if (wsRef.current) return

    // Connect to WebSocket for real-time updates
    const ws = new WebSocket("ws://localhost:4000")
    wsRef.current = ws

    ws.onopen = () => {
      console.log("✅ AiConfidence connected to WebSocket")
      setWsConnected(true)
      
      // Subscribe to this parking lot
      ws.send(JSON.stringify({
        type: "SUBSCRIBE",
        lotId: parkingLotId,
        role: "OWNER"
      }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.lotSlug === parkingLotId || data.parkingLotId === parkingLotId || data.lotId === parkingLotId) {
          setSlotData((prev) => {
            const updated = prev.map((slot) =>
              slot.slotNumber === data.slotNumber
                ? {
                    ...slot,
                    status: data.status,
                    confidence: data.confidence || 95,
                    source: data.source,
                    lastUpdated: new Date().toISOString()
                  }
                : slot
            )
            updateAverageConfidence(updated)
            return updated
          })
        }
      } catch (err) {
        // Ignore non-JSON messages
      }
    }

    ws.onclose = () => {
      console.warn("🔌 AiConfidence disconnected from WebSocket")
      setWsConnected(false)
      wsRef.current = null
    }

    ws.onerror = (err) => {
      console.error("❌ AiConfidence WebSocket error:", err)
      setWsConnected(false)
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [parkingLotId]) // ✅ ONLY parkingLotId - prevents infinite loop


  const updateAverageConfidence = (slots: SlotConfidence[]) => {
    if (slots.length === 0) return
    const avg = slots.reduce((sum, slot) => sum + slot.confidence, 0) / slots.length
    setAverageConfidence(Math.round(avg))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-emerald-400"
    if (confidence >= 75) return "text-yellow-400"
    return "text-red-400"
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return "bg-emerald-500/20"
    if (confidence >= 75) return "bg-yellow-500/20"
    return "bg-red-500/20"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "OCCUPIED":
        return <div className="w-4 h-4 rounded-full bg-red-500" />
      case "RESERVED":
        return <div className="w-4 h-4 rounded-full bg-yellow-400" />
      case "DISABLED":
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  // Get top 5 slots by confidence (lowest first to highlight potential issues)
  const lowConfidenceSlots = [...slotData]
    .filter((s) => s.confidence < 85)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5)

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">AI Confidence</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs text-gray-400">{wsConnected ? "Live" : "Offline"}</span>
        </div>
      </div>

      {/* Average Confidence */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Average Confidence</span>
          <TrendingUp className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${getConfidenceColor(averageConfidence)}`}>
            {averageConfidence}%
          </span>
          <span className="text-gray-500 text-sm mb-1">across all slots</span>
        </div>
        <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              averageConfidence >= 90 ? "bg-emerald-500" : averageConfidence >= 75 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${averageConfidence}%` }}
          />
        </div>
      </div>

      {/* Low Confidence Alerts */}
      {lowConfidenceSlots.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Low Confidence Alerts
          </h4>
          <div className="space-y-2">
            {lowConfidenceSlots.map((slot) => (
              <div
                key={slot.slotNumber}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(slot.status)}
                  <span className="text-white text-sm">Slot {slot.slotNumber}</span>
                </div>
                <span className={`text-sm font-medium ${getConfidenceColor(slot.confidence)}`}>
                  {slot.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slot Summary */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Slot Summary</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400">
              {slotData.filter((s) => s.status === "AVAILABLE").length}
            </div>
            <div className="text-xs text-emerald-400/70">Available</div>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">
              {slotData.filter((s) => s.status === "OCCUPIED").length}
            </div>
            <div className="text-xs text-red-400/70">Occupied</div>
          </div>
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">
              {slotData.filter((s) => s.status === "RESERVED").length}
            </div>
            <div className="text-xs text-yellow-400/70">Reserved</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-500/10 border border-gray-500/20">
            <div className="text-2xl font-bold text-gray-400">
              {slotData.filter((s) => s.status === "DISABLED").length}
            </div>
            <div className="text-xs text-gray-400/70">Maintenance</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          AI detection confidence scores updated in real-time
        </p>
      </div>
    </div>
  )
}
