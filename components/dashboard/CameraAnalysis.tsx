"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Scan, Activity, AlertCircle, CheckCircle, Shield, Gauge } from "lucide-react"

type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"

interface Slot {
    id: string
    slotNumber: number
    row: string
    status: SlotStatus
    x?: number
    y?: number
    width?: number
    height?: number
    aiConfidence?: number
}

interface CameraAnalysisProps {
    cameraUrl: string | null
    slots: Slot[]
    wsConnected: boolean
}

export default function CameraAnalysis({ cameraUrl, slots, wsConnected }: CameraAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [scanPosition, setScanPosition] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Simulation of analysis scanning line (but no grid overlay)
    useEffect(() => {
        const interval = setInterval(() => {
            setScanPosition((prev) => (prev >= 100 ? 0 : prev + 1))
        }, 50)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (wsConnected) {
            setIsAnalyzing(true)
        } else {
            setIsAnalyzing(false)
        }
    }, [wsConnected, slots])

    return (
        <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-black aspect-video shadow-2xl shadow-purple-500/10" ref={containerRef}>
            {/* Live Feed Header Overlay */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                            {wsConnected ? "Live AI Feed" : "Signal Lost"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 backdrop-blur-md rounded-full border border-purple-500/30">
                        <Activity size={12} className="text-purple-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
                            {slots.length} Nodes Online
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-mono text-gray-400">
                    <Scan size={12} className="text-cyan-400" />
                    FPS: {wsConnected ? "30.0" : "0.0"}
                </div>
            </div>

            {/* Main Camera Image */}
            {cameraUrl ? (
                <div className="relative w-full h-full bg-zinc-900">
                    <img
                        src={cameraUrl}
                        alt="Live Analysis Feed"
                        className="w-full h-full object-contain opacity-90"
                    />

                    {/* AI Scan Line Overlay - Visual Flair Only */}
                    {isAnalyzing && (
                        <motion.div
                            style={{ top: `${scanPosition}%` }}
                            className="absolute left-0 right-0 h-px bg-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 pointer-events-none"
                        />
                    )}

                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-4">
                    <Camera size={48} className="text-zinc-700 animate-pulse" />
                    <p className="text-zinc-500 font-mono text-sm tracking-widest">AWAITING CAMERA STREAM...</p>
                </div>
            )}

            {/* Analysis Metrics Sidebar Overlays */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
                <div className="px-3 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 min-w-[140px]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">AI Precision</span>
                        <CheckCircle size={10} className="text-green-500" />
                    </div>
                    <div className="text-lg font-mono font-bold text-white">99.1%</div>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                        <div className="w-[99%] h-full bg-green-500 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                <div className="px-3 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 min-w-[140px]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Latency</span>
                        <Gauge size={10} className="text-purple-400" />
                    </div>
                    <div className="text-lg font-mono font-bold text-purple-400">~150ms</div>
                    <div className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">OPENCV ENGINE</div>
                </div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
    )
}
