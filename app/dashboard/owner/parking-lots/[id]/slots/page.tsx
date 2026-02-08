"use client"

import { useEffect, useState, use, useRef } from "react"


import { useSession } from "next-auth/react"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"

import { useRouter } from "next/navigation"
import { Camera, Grid3X3, Power, Wrench, AlertCircle, CheckCircle, XCircle, Settings, Unlock, Lock, RefreshCw } from "lucide-react"


type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"

type Slot = {
  id: string
  slotNumber: number
  row: string
  status: SlotStatus
  aiConfidence?: number
  updatedBy?: "AI" | "OWNER" | "CUSTOMER"
  price?: number
  slotType?: string
}

import { OWNER_PARKING_MAPPING, PARKING_LOT_DETAILS } from "@/lib/owner-mapping"

export default function OwnerSlotsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { id: lotId } = use(params)


  const [slots, setSlots] = useState<Slot[]>([])
  const [cameraUrl, setCameraUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const [selectedRow, setSelectedRow] = useState<string | null>(null)

  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)

  // Fetch locks to prevent duplicate requests
  const isFetchingSlotsRef = useRef(false)
  const isFetchingCameraRef = useRef(false)
  const hasFetchedInitialDataRef = useRef(false)

  const [stats, setStats] = useState({

    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    disabled: 0,
    closed: 0
  })

  // Verify owner has access to this parking lot
  useEffect(() => {
    if (status === "loading") return

    // Explicitly check for unauthenticated
    if (status === "unauthenticated") {
      console.log("🚫 Unauthenticated - Redirecting to home")
      router.push("/")
      return
    }

    if (status === "authenticated") {
      const ownerEmail = (session?.user?.email || "").toLowerCase()
      const allowedLotId = session?.user?.parkingLotId || OWNER_PARKING_MAPPING[ownerEmail]

      // Compare case-insensitively just in case
      if (allowedLotId?.toLowerCase() !== lotId?.toLowerCase()) {
        console.log(`🚫 Access Denied: Allowed=${allowedLotId}, Requested=${lotId}`)
        // Redirect to owner's correct parking lot
        if (allowedLotId) {
          router.replace(`/dashboard/owner/parking-lots/${allowedLotId}/slots`)
        } else {
          router.push("/dashboard/owner")
        }
      }
    }
  }, [session, status, lotId, router])

  // Fetch initial data - with lock to prevent duplicates
  useEffect(() => {
    if (!lotId) return
    if (hasFetchedInitialDataRef.current) return
    if (isFetchingSlotsRef.current) return

    isFetchingSlotsRef.current = true
    hasFetchedInitialDataRef.current = true

    // Fetch slots
    fetch(`/api/parking/${lotId}/slots`)
      .then(res => res.json())
      .then(data => {
        if (data.slots) {
          setSlots(data.slots)
          updateStats(data.slots)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch slots:", err)
        setLoading(false)
      })
      .finally(() => {
        isFetchingSlotsRef.current = false
      })

    // Fetch camera feed URL
    if (!isFetchingCameraRef.current) {
      isFetchingCameraRef.current = true
      fetch(`/api/parking/${lotId}/camera`)
        .then(res => res.json())
        .then(data => {
          if (data.streamUrl) {
            setCameraUrl(data.streamUrl)
          }
        })
        .catch(err => {
          console.error("Failed to fetch camera URL:", err)
        })
        .finally(() => {
          isFetchingCameraRef.current = false
        })
    }
  }, [lotId])

  // Camera polling - every 10 seconds
  useEffect(() => {
    if (!lotId) return
    if (!cameraUrl) return

    const interval = setInterval(() => {
      if (isFetchingCameraRef.current) return

      isFetchingCameraRef.current = true
      fetch(`/api/parking/${lotId}/camera`)
        .then(res => res.json())
        .then(data => {
          if (data.streamUrl) {
            setCameraUrl(data.streamUrl)
          }
        })
        .catch(err => {
          console.error("Failed to fetch camera URL:", err)
        })
        .finally(() => {
          isFetchingCameraRef.current = false
        })
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [lotId, cameraUrl])


  // Get global WebSocket connection
  const { isConnected: globalWsConnected, lastMessage } = useOwnerWS();

  // Sync connection state
  useEffect(() => {
    setWsConnected(globalWsConnected);
  }, [globalWsConnected]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "SLOT_UPDATE" && lastMessage.lotId === lotId) {
      setSlots((prev) => {
        const newSlots = prev.map((slot) =>
          slot.id === lastMessage.slotId
            ? { ...slot, status: lastMessage.status as SlotStatus, aiConfidence: lastMessage.confidence, updatedBy: lastMessage.updatedBy }
            : slot
        );
        updateStats(newSlots);
        return newSlots;
      });
    } else if (lastMessage.type === "BULK_SLOT_UPDATE" && lastMessage.lotId === lotId) {
      // Update slots directly from WebSocket data - NO HTTP call
      const msgSlots = lastMessage.slots as Slot[] | undefined;
      const msgUpdatedSlots = lastMessage.updatedSlots as Slot[] | undefined;

      if (msgSlots && Array.isArray(msgSlots)) {
        setSlots(msgSlots);
        updateStats(msgSlots);
      } else if (msgUpdatedSlots && Array.isArray(msgUpdatedSlots)) {
        // Partial update - merge with existing slots
        setSlots((prev) => {
          const updatedMap = new Map(msgUpdatedSlots.map((s) => [s.id, s]));
          const newSlots = prev.map((slot) => updatedMap.get(slot.id) || slot);
          updateStats(newSlots);
          return newSlots;
        });
      }
      // If no slot data in message, state will be updated by individual SLOT_UPDATE messages
    }


  }, [lastMessage, lotId]);




  const updateStats = (slotData: Slot[]) => {
    setStats({
      total: slotData.length,
      available: slotData.filter(s => s.status === "AVAILABLE").length,
      occupied: slotData.filter(s => s.status === "OCCUPIED").length,
      reserved: slotData.filter(s => s.status === "RESERVED").length,
      disabled: slotData.filter(s => s.status === "DISABLED").length,
      closed: slotData.filter(s => s.status === "CLOSED").length
    })
  }

  const handleSlotStatusChange = async (slotId: string, newStatus: SlotStatus) => {
    try {
      const response = await fetch("/api/owner/slots/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId: lotId,
          slotId: slotId,
          status: newStatus,
          confidence: 100
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to update slot: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to update slot:", error)
      alert("Failed to update slot. Please try again.")
    }
  }

  const handleBulkAction = async (action: string, row?: string) => {
    const confirmMsg = row
      ? `${action} for Row ${row}?`
      : `${action} for ALL slots?`

    if (!confirm(confirmMsg)) return

    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/owner/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId: lotId,
          action: action,
          row: row
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to perform bulk action: ${error.error}`)
      } else {
        const result = await response.json()
        alert(`${result.message}\nUpdated ${result.updatedCount} slots`)
      }
    } catch (error) {
      console.error("Failed to perform bulk action:", error)
      alert("Failed to perform bulk action. Please try again.")
    } finally {
      setBulkActionLoading(false)
    }
  }

  const getStatusColor = (status: SlotStatus) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-500"
      case "OCCUPIED": return "bg-red-600"
      case "RESERVED": return "bg-yellow-500"
      case "DISABLED": return "bg-gray-600"
      case "CLOSED": return "bg-black border-2 border-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: SlotStatus) => {
    switch (status) {
      case "AVAILABLE": return <CheckCircle className="w-4 h-4" />
      case "OCCUPIED": return <XCircle className="w-4 h-4" />
      case "RESERVED": return <AlertCircle className="w-4 h-4" />
      case "DISABLED": return <Wrench className="w-4 h-4" />
      case "CLOSED": return <Power className="w-4 h-4" />
      default: return null
    }
  }

  // Group slots by row
  const slotsByRow = slots.reduce((acc, slot) => {
    if (!acc[slot.row]) acc[slot.row] = []
    acc[slot.row].push(slot)
    return acc
  }, {} as Record<string, Slot[]>)

  const rows = Object.keys(slotsByRow).sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const lotDetails = PARKING_LOT_DETAILS[lotId] || { name: "Parking Lot", totalSlots: 0 }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{lotDetails.name}</h1>
            <p className="text-gray-400 mt-1">
              Owner Portal • {stats.total} Slots • Real-time Management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-400">
                {wsConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <StatCard label="Total" value={stats.total} color="bg-blue-500/20 text-blue-400" />
          <StatCard label="Available" value={stats.available} color="bg-green-500/20 text-green-400" />
          <StatCard label="Occupied" value={stats.occupied} color="bg-red-500/20 text-red-400" />
          <StatCard label="Reserved" value={stats.reserved} color="bg-yellow-500/20 text-yellow-400" />
          <StatCard label="Maintenance" value={stats.disabled} color="bg-gray-500/20 text-gray-400" />
          <StatCard label="Closed" value={stats.closed} color="bg-black border border-red-500/50 text-red-400" />
        </div>

        {/* Camera Feed - OWNER ONLY */}
        {cameraUrl && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">📹 Live Camera Feed</h2>
              <span className="text-xs text-gray-500 ml-2">(Owner Only)</span>
            </div>
            <div className="p-4">
              <img
                src={cameraUrl}
                alt="Parking Lot Camera"
                className="w-full max-w-3xl rounded-lg border border-gray-700"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Slot Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bulk Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Power className="w-5 h-5" />
                Bulk Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBulkAction("OPEN_ALL")}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Open All Slots
                </button>
                <button
                  onClick={() => handleBulkAction("CLOSE_ALL")}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Close All Slots
                </button>

                {/* Row-wise actions */}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400 text-sm">Row:</span>
                  <select
                    value={selectedRow || ""}
                    onChange={(e) => setSelectedRow(e.target.value || null)}
                    className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700"
                  >
                    <option value="">Select Row</option>
                    {rows.map(row => (
                      <option key={row} value={row}>Row {row}</option>
                    ))}
                  </select>
                  {selectedRow && (
                    <>
                      <button
                        onClick={() => handleBulkAction("OPEN_ROW", selectedRow)}
                        disabled={bulkActionLoading}
                        className="px-3 py-2 bg-green-600/80 hover:bg-green-700 disabled:bg-gray-700 rounded-lg text-sm transition"
                      >
                        Open Row {selectedRow}
                      </button>
                      <button
                        onClick={() => handleBulkAction("CLOSE_ROW", selectedRow)}
                        disabled={bulkActionLoading}
                        className="px-3 py-2 bg-red-600/80 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-sm transition"
                      >
                        Close Row {selectedRow}
                      </button>
                      <button
                        onClick={() => handleBulkAction("MAINTENANCE_ROW", selectedRow)}
                        disabled={bulkActionLoading}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 rounded-lg text-sm transition"
                      >
                        Maintenance
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>


            {/* Slot Grid by Row */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Grid3X3 className="w-6 h-6" />
                Slot Management
              </h2>

              <div className="space-y-6">
                {rows.map(row => (
                  <div key={row} className="space-y-3">
                    <h3 className="text-lg font-medium text-cyan-400">Row {row}</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-12 gap-2">
                      {slotsByRow[row]
                        .sort((a, b) => a.slotNumber - b.slotNumber)
                        .map(slot => (
                          <div
                            key={slot.id}
                            className={`relative p-3 rounded-lg border border-gray-700 ${getStatusColor(slot.status)} bg-opacity-20 hover:bg-opacity-30 transition cursor-pointer group`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-bold text-white">{slot.slotNumber}</span>
                              <span className="text-[10px] text-gray-300 uppercase">{slot.status}</span>
                              {slot.updatedBy === "AI" && slot.aiConfidence && (
                                <span className="text-[8px] text-cyan-300">
                                  AI {Math.round(slot.aiConfidence * 100)}%
                                </span>
                              )}
                            </div>

                            {/* Status Change Dropdown */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gray-900/95 rounded-lg flex items-center justify-center">
                              <select
                                value={slot.status}
                                onChange={(e) => handleSlotStatusChange(slot.id, e.target.value as SlotStatus)}
                                className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-600"
                                disabled={slot.status === "RESERVED"}
                              >
                                <option value="AVAILABLE">Open</option>
                                <option value="OCCUPIED">Occupied</option>
                                <option value="RESERVED" disabled>Reserved</option>
                                <option value="DISABLED">Maintenance</option>
                                <option value="CLOSED">Close</option>
                              </select>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>Occupied (AI)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Reserved (Customer)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <span>Disabled (Maintenance)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black border-2 border-red-500 rounded"></div>
                <span>Closed (Owner)</span>
              </div>
            </div>
          </div>

          {/* Sidebar - Owner Controls */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-purple-400" />
                Owner Controls
              </h2>

              {/* Stats Cards */}
              <div className="space-y-3 mb-6">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Unlock size={20} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Available</div>
                      <div className="text-2xl font-bold text-green-400">{stats.available}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Lock size={20} className="text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Occupied</div>
                      <div className="text-2xl font-bold text-red-400">{stats.occupied}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={20} className="text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Reserved</div>
                      <div className="text-2xl font-bold text-yellow-400">{stats.reserved}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600/20 rounded-lg flex items-center justify-center">
                      <AlertCircle size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Disabled</div>
                      <div className="text-2xl font-bold text-gray-400">{stats.disabled}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>

                <button
                  onClick={() => handleBulkAction("OPEN_ALL")}
                  disabled={bulkActionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-green-500/25"
                >
                  {bulkActionLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Unlock size={18} />
                  )}
                  Open All Slots
                </button>

                <button
                  onClick={() => handleBulkAction("CLOSE_ALL")}
                  disabled={bulkActionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-red-500/25"
                >
                  {bulkActionLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Lock size={18} />
                  )}
                  Close All Slots
                </button>
              </div>

              {/* Info Panel */}
              <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Owner Instructions
                </h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Use bulk actions to control all slots</li>
                  <li>• Changes sync instantly to customers</li>
                  <li>• Camera AI updates apply automatically</li>
                  <li>• You can only manage your assigned parking lot</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  )
}
