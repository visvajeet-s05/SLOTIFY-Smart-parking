"use client"

import { useEffect, useState, useRef } from "react"
import { Video, Wifi, WifiOff, RefreshCw, Settings } from "lucide-react"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"

interface CameraPanelProps {
  parkingLotId: string
  streamUrl?: string
}

export default function CameraPanel({ parkingLotId, streamUrl }: CameraPanelProps) {
  const { isConnected, lastMessage } = useOwnerWS()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Default stream URL from Flask server
  const defaultStreamUrl = `http://localhost:5000/camera/${parkingLotId}`
  const actualStreamUrl = streamUrl || defaultStreamUrl

  useEffect(() => {
    if (lastMessage) {
      setLastUpdate(new Date())
    }
  }, [lastMessage])

  useEffect(() => {
    // Simulate initial loading sequence for aesthetic
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [parkingLotId])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Video className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold tracking-tight">LIVE OPTIC FEED</h3>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Reference ID</span>
            <span className="text-xs text-gray-300 font-mono">{parkingLotId.slice(0, 8).toUpperCase()}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/5 rounded-full transition-all duration-300 border border-transparent hover:border-gray-700 active:scale-95"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Video Feed Container */}
      <div className="relative bg-black aspect-video overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500/30 animate-spin" />
              <div className="absolute inset-2 rounded-full border-r-2 border-purple-500/40 animate-[spin_1.5s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border-b-2 border-emerald-500/50 animate-[spin_2s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-cyan-400/50" />
              </div>
            </div>
            <p className="text-cyan-400/70 text-sm font-mono tracking-widest animate-pulse">ESTABLISHING LINK...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90">
            <div className="text-center max-w-xs px-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <WifiOff className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-white font-bold mb-2">LINK INTERRUPTED</h4>
              <p className="text-gray-500 text-xs mb-6Leading-relaxed">{error}</p>
              <button
                onClick={handleRefresh}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
              >
                REINITIALIZE
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MJPEG Stream with glitch-filter effect */}
            <img
              src={actualStreamUrl}
              alt="Camera Feed"
              className="w-full h-full object-cover brightness-[1.1] contrast-[1.1]"
              onError={() => setError("Camera source unreachable or stream terminated.")}
            />

            {/* --- FUTURISTIC OVERLAYS (MATCHING USER REFERENCE) --- */}

            {/* 1. TOP LEFT: OPTIC LINK ACTIVE */}
            <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 select-none">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-40" />
              </div>
              <span className="text-white text-[11px] font-bold tracking-[0.2em]">OPTIC LINK ACTIVE</span>
            </div>

            {/* 2. TOP RIGHT: TUNE NODES */}
            <button className="absolute top-6 right-6 flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all group/btn">
              <Settings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-500" />
              <span className="text-[11px] font-bold tracking-[0.1em]">TUNE NODES</span>
            </button>

            {/* 3. BOTTOM LEFT: AI CONFIDENCE */}
            <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 min-w-[160px]">
              <div className="text-[10px] text-white/40 font-bold tracking-widest mb-1 uppercase">AI Confidence</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">98.4%</span>
              </div>
              <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-[98.4%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>
            </div>

            {/* 4. BOTTOM RIGHT: LINK STABLE */}
            <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full border border-white/10">
              <span className="text-white text-[11px] font-bold tracking-[0.15em] uppercase">Link Stable</span>
            </div>

            {/* 5. BOTTOM BAR SCANLINE DECORATION */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            {/* Scanline Effect Overlay (CSS) */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
          </>
        )}
      </div>

      {/* Modern Footer Stats */}
      <div className="px-6 py-4 bg-gray-900 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Protocol</span>
            <span className="text-xs text-gray-300 font-mono">MJPEG STREAM/V4</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">WebSocket</span>
            <span className={`text-xs font-mono ${isConnected ? "text-emerald-400" : "text-red-400"}`}>
              {isConnected ? "ENCRYPTED_LINK" : "CONNECT_FAIL"}
            </span>
          </div>
        </div>

        {lastUpdate && (
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Last Sync</span>
            <span className="text-xs text-cyan-400 font-mono">{lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
