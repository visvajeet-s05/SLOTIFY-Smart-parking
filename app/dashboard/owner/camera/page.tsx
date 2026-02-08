"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"
import { motion } from "framer-motion"
import { Camera, LayoutDashboard, ShieldCheck, Zap, Activity } from "lucide-react"
import CameraAnalysis from "@/components/dashboard/CameraAnalysis"

export default function OwnerCameraPage() {
  const { data: session } = useSession()
  const [cameraUrl, setCameraUrl] = useState<string | null>(null)
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { isConnected: wsConnected, lastMessage } = useOwnerWS()

  const parkingLotId = session?.user?.parkingLotId

  useEffect(() => {
    if (!parkingLotId) return

    const fetchData = async () => {
      try {
        const cameraRes = await fetch(`/api/parking/${parkingLotId}/camera`)
        const cameraData = await cameraRes.json()
        if (cameraData.streamUrl) {
          setCameraUrl(cameraData.streamUrl)
        }

        const slotsRes = await fetch(`/api/parking/${parkingLotId}/slots`)
        const slotsData = await slotsRes.json()
        if (slotsData.slots) {
          setSlots(slotsData.slots)
        }
      } catch (err) {
        console.error("Failed to fetch camera data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [parkingLotId])

  // Handle WS updates to keep slots in sync for overlays
  useEffect(() => {
    if (!lastMessage) return
    if (lastMessage.type === "SLOT_UPDATE" && lastMessage.lotId === parkingLotId) {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === lastMessage.slotId
            ? { ...slot, status: lastMessage.status, aiConfidence: lastMessage.confidence }
            : slot
        )
      )
    }
  }, [lastMessage, parkingLotId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
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

      <div className="relative max-w-7xl mx-auto px-6 pt-4 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-medium">
              <Activity size={18} />
              <span className="text-sm tracking-wider uppercase">Camera Feed</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Live Camera Stream</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500" />
              AI Analysis Active • <span className="text-white font-medium">4K HDR</span> Stream via AI Relay
            </p>
          </div>

          <Link
            href={parkingLotId ? `/dashboard/owner/parking-lots/${parkingLotId}/slots` : "#"}
            className={`group flex items-center gap-3 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all duration-300 ${!parkingLotId ? "opacity-50 pointer-events-none" : ""}`}
          >
            <LayoutDashboard size={20} className="text-purple-400" />
            <span className="text-sm font-bold text-purple-400 uppercase tracking-widest group-hover:text-purple-300">
              Slot Management
            </span>
          </Link>
        </header>

        {/* Main View */}
        <div className="space-y-6">
          <CameraAnalysis cameraUrl={cameraUrl} slots={slots} wsConnected={wsConnected} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Stream Properties</h3>
              <div className="space-y-4">
                <PropertyRow label="Resolution" value="3840 x 2160 (4K)" />
                <PropertyRow label="Encoding" value="H.265 / HEVC" />
                <PropertyRow label="Compression" value="Neural-Optimized" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Network Topology</h3>
              <div className="space-y-4">
                <PropertyRow label="Gateway" value="WS Relay Subnet 4" />
                <PropertyRow label="Latency" value="12ms" />
                <PropertyRow label="Packets" value="Encrypted (AES-256)" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Neural Analysis</h3>
              <div className="space-y-4">
                <PropertyRow label="Total Slots" value={slots.length.toString()} />
                <PropertyRow label="Detection" value="Vehicle Recognition" />
                <PropertyRow label="AI Version" value="Slotify Core v4.2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-xs font-mono font-bold text-white">{value}</span>
    </div>
  )
}
