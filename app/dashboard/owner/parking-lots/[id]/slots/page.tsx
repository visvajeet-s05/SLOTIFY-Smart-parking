"use client"

import { useEffect, useState, use, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera,
  Grid3X3,
  Power,
  Wrench,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Unlock,
  Lock,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  RotateCcw,
  MousePointer2,
  Activity
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { OWNER_PARKING_MAPPING } from "@/lib/owner-mapping"

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

interface LotInfo {
  id: string
  name: string
  totalSlots: number
  address?: string
}

export default function OwnerSlotsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { id: lotId } = use(params)

  const [slots, setSlots] = useState<Slot[]>([])
  const [lotInfo, setLotInfo] = useState<LotInfo | null>(null)
  const [cameraUrl, setCameraUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRow, setSelectedRow] = useState<string | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [priceInput, setPriceInput] = useState<string>("50")

  const handlePriceUpdate = async () => {
    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/owner/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId,
          action: "UPDATE_PRICE",
          price: priceInput,
          row: selectedRow // Optional row filter
        })
      })
      if (!response.ok) throw new Error("Price update failed")
    } catch (error) {
      console.error(error)
      alert("Failed to update price")
    } finally {
      setBulkActionLoading(false)
    }
  }
  const [wsConnected, setWsConnected] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Ensure owner is viewing their allowed parking lot
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") return // Handled by layout

    const ownerEmail = (session?.user?.email || "").toLowerCase()
    const allowedLotId = session?.user?.parkingLotId || OWNER_PARKING_MAPPING[ownerEmail]

    if (allowedLotId && lotId !== allowedLotId) {
      console.warn(`Owner attempted to access lot ${lotId} but is only allowed to access ${allowedLotId}`)
      router.replace(`/dashboard/owner/parking-lots/${allowedLotId}/slots`)
    }
  }, [session, status, lotId, router])

  // Fetch initial data
  useEffect(() => {
    if (!lotId || hasFetchedInitialDataRef.current) return
    hasFetchedInitialDataRef.current = true

    const fetchData = async () => {
      try {
        const slotsRes = await fetch(`/api/parking/${lotId}/slots`)
        const slotsData = await slotsRes.json()
        if (slotsData.slots) {
          setSlots(slotsData.slots)
          updateStats(slotsData.slots)
        }
        if (slotsData.lot) {
          setLotInfo(slotsData.lot)
        }

        const cameraRes = await fetch(`/api/parking/${lotId}/camera`)
        const cameraData = await cameraRes.json()
        if (cameraData.streamUrl) {
          setCameraUrl(cameraData.streamUrl)
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lotId])

  // WebSocket
  const { isConnected: globalWsConnected, lastMessage } = useOwnerWS()
  useEffect(() => {
    setWsConnected(globalWsConnected)
  }, [globalWsConnected])

  useEffect(() => {
    if (!lastMessage) return
    if (lastMessage.type === "SLOT_UPDATE" && lastMessage.lotId === lotId) {
      setSlots((prev) => {
        const newSlots = prev.map((slot) =>
          slot.id === lastMessage.slotId
            ? { ...slot, status: lastMessage.status as SlotStatus, aiConfidence: lastMessage.confidence, updatedBy: lastMessage.updatedBy }
            : slot
        )
        updateStats(newSlots)
        return newSlots
      })
    } else if (lastMessage.type === "BULK_SLOT_UPDATE" && lastMessage.lotId === lotId) {
      const msgSlots = lastMessage.slots as Slot[] | undefined
      if (msgSlots) {
        setSlots(msgSlots)
        updateStats(msgSlots)
      }
    }
  }, [lastMessage, lotId])

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
        body: JSON.stringify({ lotId, slotId, status: newStatus, confidence: 100 })
      })
      if (!response.ok) throw new Error("Update failed")
    } catch (error) {
      console.error(error)
      alert("Failed to update slot")
    }
  }

  const handleBulkAction = async (action: string, row?: string) => {
    setBulkActionLoading(true)
    try {
      const response = await fetch("/api/owner/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId, action, row })
      })
      if (!response.ok) throw new Error("Bulk action failed")
    } catch (error) {
      console.error(error)
      alert("Failed to perform bulk action")
    } finally {
      setBulkActionLoading(false)
    }
  }

  const getStatusColor = (status: SlotStatus) => {
    switch (status) {
      case "AVAILABLE": return "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20"
      case "OCCUPIED": return "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
      case "RESERVED": return "bg-yellow-500 hover:bg-yellow-400 text-white shadow-yellow-500/20"
      case "DISABLED": return "bg-slate-600 hover:bg-slate-500 text-white/50 shadow-slate-500/20"
      case "CLOSED": return "bg-zinc-800 hover:bg-zinc-700 text-zinc-500"
      default: return "bg-zinc-800 text-zinc-500"
    }
  }

  const slotsByRow = slots.reduce((acc, slot) => {
    if (!acc[slot.row]) acc[slot.row] = []
    acc[slot.row].push(slot)
    return acc
  }, {} as Record<string, Slot[]>)

  const rows = Object.keys(slotsByRow).sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyan-500/20 border-b-cyan-500 rounded-full animate-spin-slow" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 pb-20">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 pt-4 space-y-6">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 font-medium">
              <LayoutDashboard size={18} />
              <span className="text-sm tracking-wider uppercase">Owner Portal</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {lotInfo?.name || "Parking Lot"}
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500" />
              Real-time monitoring enabled • <span className="text-white font-medium">{stats.total}</span> total managed nodes
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">System Clock</p>
                <p className="text-lg font-mono font-bold tracking-tight">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${wsConnected ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                <Zap size={12} className={wsConnected ? "animate-pulse" : ""} />
                {wsConnected ? "Live Sync" : "Connection Lost"}
              </div>
            </div>
          </div>
        </header>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCardSmall label="Total Capacity" value={stats.total} icon={<Grid3X3 size={16} />} color="blue" />
          <StatCardSmall label="Available" value={stats.available} icon={<CheckCircle size={16} />} color="green" />
          <StatCardSmall label="Occupied" value={stats.occupied} icon={<XCircle size={16} />} color="red" />
          <StatCardSmall label="Reserved" value={stats.reserved} icon={<AlertCircle size={16} />} color="yellow" />
          <StatCardSmall label="Maintenance" value={stats.disabled} icon={<Wrench size={16} />} color="zinc" />
          <StatCardSmall label="Closed" value={stats.closed} icon={<Power size={16} />} color="black" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Main Workspac (Left/Center) */}
          <div className="xl:col-span-8 space-y-8">

            {/* Live Camera Feed Button */}
            <section className="flex justify-end">
              <Link
                href={`/dashboard/owner/parking-lots/${lotId}/camera`}
                className="group flex items-center gap-3 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all duration-300"
              >
                <div className="relative">
                  <Camera size={20} className="text-cyan-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest group-hover:text-cyan-300">
                  Live Camera Feed
                </span>
              </Link>
            </section>

            {/* Grid Management Workspace */}
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Slot Management</h3>
                  <p className="text-sm text-gray-500">Real-time slot status and manual overrides</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-xs font-mono font-bold tracking-tight text-gray-400">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500 shadow-lg shadow-emerald-500/50" /> AVAILABLE</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-600 shadow-lg shadow-red-600/50" /> OCCUPIED</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-500 shadow-lg shadow-yellow-500/50" /> RESERVED</div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {rows.map(row => (
                  <div key={row} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Row {row}</h4>
                      <div className="h-px flex-1 bg-white/5 mx-4" />
                      <span className="text-[10px] font-mono text-zinc-600">{slotsByRow[row].length} SLOTS</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                      {slotsByRow[row]
                        .sort((a, b) => a.slotNumber - b.slotNumber)
                        .map(slot => (
                          <SlotNode
                            key={slot.id}
                            slot={slot}
                            onStatusChange={(status) => handleSlotStatusChange(slot.id, status)}
                            statusColorClass={getStatusColor(slot.status)}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Configuration Sidebar (Right) */}
          <aside className="xl:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">

              {/* Quick Actions Panel */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" />
                  Override Protocols
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleBulkAction("OPEN_ALL")}
                      disabled={bulkActionLoading}
                      className="group flex flex-col items-center justify-center gap-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-2xl p-4 transition-all duration-300"
                    >
                      <Unlock className="text-green-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-wider text-green-300">Open All</span>
                    </button>
                    <button
                      onClick={() => handleBulkAction("CLOSE_ALL")}
                      disabled={bulkActionLoading}
                      className="group flex flex-col items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl p-4 transition-all duration-300"
                    >
                      <Lock className="text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-wider text-red-300">Close All</span>
                    </button>
                  </div>

                  <div className="p-5 bg-black/40 border border-white/5 rounded-2x; space-y-4">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Zone-Specific Command</p>
                    <div className="flex gap-2">
                      <select
                        value={selectedRow || ""}
                        onChange={(e) => setSelectedRow(e.target.value || null)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="">Target Row</option>
                        {rows.map(r => <option key={r} value={r}>Row {r}</option>)}
                      </select>
                      <button
                        onClick={() => setSelectedRow(null)}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                      >
                        <RotateCcw size={18} className="text-zinc-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={!selectedRow || bulkActionLoading}
                        onClick={() => handleBulkAction("OPEN_ROW", selectedRow!)}
                        className="py-2.5 bg-green-600/80 hover:bg-green-600 text-[10px] font-bold uppercase rounded-lg disabled:opacity-30 transition-all"
                      >
                        Mass Open
                      </button>
                      <button
                        disabled={!selectedRow || bulkActionLoading}
                        onClick={() => handleBulkAction("CLOSE_ROW", selectedRow!)}
                        className="py-2.5 bg-red-600/80 hover:bg-red-600 text-[10px] font-bold uppercase rounded-lg disabled:opacity-30 transition-all"
                      >
                        Mass Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Controls Panel */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" x2="12" y1="2" y2="22" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  Pricing Strategy
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Base Hourly Rate</span>
                      <span className="text-[10px] font-mono text-zinc-600">INR/HR</span>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-serif italic">₹</span>
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-bold font-mono outline-none focus:border-green-500/50 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={handlePriceUpdate}
                        disabled={bulkActionLoading}
                        className="px-4 bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 text-xs"
                      >
                        Update
                      </button>
                    </div>

                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg border transition-colors ${selectedRow ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : "bg-white/5 border-white/5 text-zinc-600"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedRow ? "bg-yellow-500" : "bg-zinc-600"}`} />
                      Applying to: {selectedRow ? `Row ${selectedRow}` : "Entire Lot"}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Status Panel */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">System Status</h3>
                  <div className="p-2 bg-white/10 rounded-lg"><Activity size={18} className="text-purple-300" /></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Detection engine</span>
                    <span className="text-xs font-mono text-green-400 uppercase tracking-widest">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Update latency</span>
                    <span className="text-xs font-mono text-zinc-300">~120ms</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-1">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Confidence Level</p>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "94%" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
                      <span>0.0</span>
                      <span>OPTIMIZED (0.94)</span>
                      <span>1.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance & Logs */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Master Instructions</h3>
                <ul className="space-y-3 text-[11px] text-zinc-500 leading-relaxed font-medium">
                  <li className="flex gap-2">
                    <div className="mt-1 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                    <span>Real-time AI detection overrides manual status if high confidence is detected.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="mt-1 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                    <span>Closing entire zones will prevent any new reservations through the user portal.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="mt-1 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                    <span>Maintenance mode (Disabled) flags slots for sanitation or technical repair.</span>
                  </li>
                </ul>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function StatCardSmall({ label, value, icon, color }: { label: string; value: number; icon: any; color: string }) {
  const themes: any = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    green: "border-green-500/20 bg-green-500/5 text-green-400",
    red: "border-red-500/20 bg-red-500/5 text-red-400",
    yellow: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
    zinc: "border-zinc-500/20 bg-zinc-500/5 text-zinc-400",
    black: "border-white/5 bg-zinc-900/50 text-zinc-500",
  }

  return (
    <div className={`rounded-2xl border p-4 backdrop-blur-sm flex items-center justify-between group transition-all duration-300 ${themes[color]}`}>
      <div>
        <div className="text-2xl font-bold font-mono tracking-tighter">{value}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">{label}</div>
      </div>
      <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  )
}

function SlotNode({ slot, onStatusChange, statusColorClass }: { slot: Slot; onStatusChange: (s: SlotStatus) => void; statusColorClass: string }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-lg ${statusColorClass}`}
      >
        <span className="text-xl font-bold text-white tracking-tight leading-none">S{slot.slotNumber}</span>

        {/* Status Indicator (Text for Owner) */}
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">{slot.status}</span>

        {slot.status === "OCCUPIED" && slot.updatedBy === "AI" && (
          <div className="absolute top-1 right-1">
            <Zap size={10} className="text-white" fill="currentColor" />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 pb-4 z-50 w-32"
            >
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 backdrop-blur-xl">
                <p className="text-[8px] font-bold uppercase text-zinc-500 text-center py-1 tracking-widest">Change Status</p>
                <MenuButton label="Open" color="text-green-400" active={slot.status === "AVAILABLE"} onClick={() => { onStatusChange("AVAILABLE"); setShowMenu(false); }} />
                <MenuButton label="Occupied" color="text-red-400" active={slot.status === "OCCUPIED"} onClick={() => { onStatusChange("OCCUPIED"); setShowMenu(false); }} />
                <MenuButton label="Repair" color="text-zinc-400" active={slot.status === "DISABLED"} onClick={() => { onStatusChange("DISABLED"); setShowMenu(false); }} />
                <MenuButton label="Close" color="text-zinc-600" active={slot.status === "CLOSED"} onClick={() => { onStatusChange("CLOSED"); setShowMenu(false); }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuButton({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-between ${active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span className={active ? color : ""}>{label}</span>
      {active && <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')}`} />}
    </button>
  )
}
