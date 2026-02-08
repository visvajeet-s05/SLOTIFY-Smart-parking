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
    const [activeDetections, setActiveDetections] = useState<number>(0)
    const [scanPosition, setScanPosition] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Simulation of analysis scanning
    useEffect(() => {
        const interval = setInterval(() => {
            setScanPosition((prev) => (prev >= 100 ? 0 : prev + 1))
        }, 50)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (wsConnected) {
            setIsAnalyzing(true)
            // Randomly change active detections count to simulate real activity
            const interval = setInterval(() => {
                setActiveDetections(slots.filter(s => s.status === "OCCUPIED").length + Math.floor(Math.random() * 2))
            }, 3000)
            return () => clearInterval(interval)
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
                    FPS: {wsConnected ? "60.4" : "0.0"}
                </div>
            </div>

            {/* Main Camera Image */}
            {cameraUrl ? (
                <div className="relative w-full h-full">
                    <img
                        src={cameraUrl}
                        alt="Live Analysis Feed"
                        className="w-full h-full object-cover opacity-80"
                    />

                    {/* AI Scan Line Overlay */}
                    {isAnalyzing && (
                        <motion.div
                            style={{ top: `${scanPosition}%` }}
                            className="absolute left-0 right-0 h-px bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
                        />
                    )}

                    {/* Detections / Bounding Boxes (Simulated Grid) */}
                    <div className="absolute inset-0 z-10 p-12 grid grid-cols-4 grid-rows-3 gap-8 pointer-events-none">
                        {slots.slice(0, 12).map((slot, i) => (
                            <motion.div
                                key={slot.id}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: slot.status === "OCCUPIED" ? 1 : 0.3,
                                    scale: slot.status === "OCCUPIED" ? 1.02 : 1
                                }}
                                className={`relative border-2 rounded-lg transition-colors duration-500 ${slot.status === "OCCUPIED"
                                    ? "border-red-500/60 bg-red-500/5"
                                    : slot.status === "RESERVED"
                                        ? "border-yellow-500/60 bg-yellow-500/5"
                                        : "border-green-500/30 bg-transparent"
                                    }`}
                            >
                                {/* Slot ID Label */}
                                <div className="absolute -top-3 left-2 px-1.5 py-0.5 bg-black/80 rounded border border-white/10 text-[8px] font-mono text-white flex items-center gap-1">
                                    <span>S{slot.slotNumber}</span>
                                    {slot.status === "OCCUPIED" && (
                                        <span className="text-red-400 animate-pulse">DET</span>
                                    )}
                                </div>

                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/40 -translate-x-1 -translate-y-1" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/40 translate-x-1 -translate-y-1" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/40 -translate-x-1 translate-y-1" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/40 translate-x-1 translate-y-1" />

                                {/* Status Indicator inside box */}
                                {slot.status === "OCCUPIED" && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4/5 h-1/2 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center">
                                            <Shield size={16} className="text-red-500/40" />
                                        </div>
                                    </div>
                                )}

                                {/* Confidence Bar */}
                                <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(slot.aiConfidence || 0.95) * 100}%` }}
                                        className={`h-full ${slot.status === "OCCUPIED" ? "bg-red-500" : "bg-green-500"}`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
                    <div className="text-lg font-mono font-bold text-white">98.4%</div>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-1">
                        <div className="w-[98%] h-full bg-green-500 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                <div className="px-3 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 min-w-[140px]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Processing</span>
                        <Gauge size={10} className="text-purple-400" />
                    </div>
                    <div className="text-lg font-mono font-bold text-purple-400">0.02ms</div>
                    <div className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">NEURAL ENGINE ACTIVE</div>
                </div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
    )
}
