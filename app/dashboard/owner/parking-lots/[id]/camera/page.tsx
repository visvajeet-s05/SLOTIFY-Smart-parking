"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"
import { motion } from "framer-motion"
import { Camera, LayoutDashboard, ShieldCheck, Activity, Power, VideoOff } from "lucide-react"
import CameraAnalysis from "@/components/dashboard/CameraAnalysis"
import { useRouter } from "next/navigation"

export default function OwnerCameraPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session } = useSession()
    const router = useRouter()
    const { id: lotId } = use(params)
    const [cameraUrl, setCameraUrl] = useState<string | null>(null)
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [hasCameraConfig, setHasCameraConfig] = useState(false)
    const [isMonitorRunning, setIsMonitorRunning] = useState(false)
    const [monitorError, setMonitorError] = useState<string | null>(null)

    const { isConnected: wsConnected, lastMessage } = useOwnerWS()

    // --- Configuration ---
    const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:5000"

    useEffect(() => {
        if (!lotId) return

        const fetchData = async () => {
            try {
                // 1. Check if lot has camera config
                const cameraRes = await fetch(`/api/parking/${lotId}/camera`)
                const cameraData = await cameraRes.json()

                if (cameraData.hasCamera) {
                    setHasCameraConfig(true)
                    // Default to AI stream URL
                    setCameraUrl(`${AI_SERVICE_URL}/camera/${lotId}`)

                    // Try to wake up the monitor
                    startMonitor()
                } else {
                    setHasCameraConfig(false)
                }

                // 2. Load slots
                const slotsRes = await fetch(`/api/parking/${lotId}/slots`)
                const slotsData = await slotsRes.json()
                if (slotsData.slots) {
                    setSlots(slotsData.slots)
                }
            } catch (err) {
                console.error("Failed to fetch camera data:", err)
                setMonitorError("Failed to load configuration")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [lotId])

    const startMonitor = async () => {
        try {
            const res = await fetch(`${AI_SERVICE_URL}/start/${lotId}`, { method: 'POST' })
            if (res.ok) {
                setIsMonitorRunning(true)
                setMonitorError(null)
            } else {
                // If it fails, maybe it's already running or errored
                const data = await res.json()
                if (data.status === 'already_running') {
                    setIsMonitorRunning(true)
                } else {
                    console.warn("Monitor start returned non-200", data)
                }
            }
        } catch (e) {
            console.error("Failed to start monitor:", e)
            // Don't set error immediately, maybe stream works anyway
        }
    }

    const stopMonitor = async () => {
        try {
            await fetch(`${AI_SERVICE_URL}/stop/${lotId}`, { method: 'POST' })
            setIsMonitorRunning(false)
        } catch (e) {
            console.error("Failed to stop monitor:", e)
        }
    }


    // Handle WS updates to keep slots in sync for overlays
    useEffect(() => {
        if (!lastMessage) return
        if (lastMessage.type === "SLOT_UPDATE" && lastMessage.lotId === lotId) {
            setSlots((prev) =>
                prev.map((slot) =>
                    slot.id === lastMessage.slotId
                        ? { ...slot, status: lastMessage.status, aiConfidence: lastMessage.confidence }
                        : slot
                )
            )
        }
    }, [lastMessage, lotId])

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
                            AI Analysis Active • <span className="text-white font-medium">Realtime Detection</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Monitor Control */}
                        {hasCameraConfig && (
                            <button
                                onClick={() => isMonitorRunning ? stopMonitor() : startMonitor()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${isMonitorRunning
                                        ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                        : "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                                    }`}
                            >
                                {isMonitorRunning ? <Power size={14} /> : <Camera size={14} />}
                                {isMonitorRunning ? "Stop AI" : "Start AI"}
                            </button>
                        )}


                        <Link
                            href={`/dashboard/owner/parking-lots/${lotId}/slots`}
                            className="group flex items-center gap-3 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all duration-300"
                        >
                            <LayoutDashboard size={20} className="text-purple-400" />
                            <span className="text-sm font-bold text-purple-400 uppercase tracking-widest group-hover:text-purple-300">
                                Slot Management
                            </span>
                        </Link>
                    </div>
                </header>

                {/* Main View */}
                <div className="space-y-6">
                    {!hasCameraConfig ? (
                        <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-4">
                            <VideoOff size={48} className="text-zinc-600" />
                            <div className="text-center">
                                <p className="text-zinc-400 font-medium">No Camera Configured</p>
                                <p className="text-zinc-600 text-sm mt-1">Please add an IP Camera URL in settings.</p>
                            </div>
                        </div>
                    ) : (
                        <CameraAnalysis
                            cameraUrl={isMonitorRunning ? cameraUrl : null}
                            slots={slots}
                            wsConnected={wsConnected}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Stream Info</h3>
                            <div className="space-y-4">
                                <PropertyRow label="Source" value={hasCameraConfig ? "IP Webcam" : "None"} />
                                <PropertyRow label="Status" value={isMonitorRunning ? "Active" : "Standby"} />
                                <PropertyRow label="Backend" value="Python OpenCV" />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Network Topology</h3>
                            <div className="space-y-4">
                                <PropertyRow label="WebSocket" value={wsConnected ? "Connected" : "Disconnected"} />
                                <PropertyRow label="Latency" value="< 200ms" />
                                <PropertyRow label="Protocol" value="MJPEG / REST" />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Neural Analysis</h3>
                            <div className="space-y-4">
                                <PropertyRow label="Total Slots" value={slots.length.toString()} />
                                <PropertyRow label="Occupied" value={slots.filter(s => s.status === 'OCCUPIED').length.toString()} />
                                <PropertyRow label="Engine" value="Edge Detection v1" />
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
