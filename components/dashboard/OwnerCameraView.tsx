"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useOwnerWS } from "@/components/ws/OwnerWebSocketProvider"
import { Camera, LayoutDashboard, ShieldCheck, Zap, Activity, Power, VideoOff } from "lucide-react"
import CameraAnalysis from "@/components/dashboard/CameraAnalysis"

interface OwnerCameraViewProps {
    parkingLotId: string;
}

export default function OwnerCameraView({ parkingLotId }: OwnerCameraViewProps) {
    const [cameraUrl, setCameraUrl] = useState<string | null>(null)
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [cameras, setCameras] = useState<any[]>([])
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null)
    const { isConnected: wsConnected, lastMessage } = useOwnerWS()

    const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:5000"

    useEffect(() => {
        if (!parkingLotId) return

        const startMonitor = async (camId?: string) => {
            try {
                const url = camId
                    ? `${AI_SERVICE_URL}/start/${parkingLotId}/${camId}`
                    : `${AI_SERVICE_URL}/start/${parkingLotId}`
                await fetch(url, { method: 'POST' })
            } catch (e) {
                console.error("Failed to start monitor:", e)
            }
        }

        const fetchData = async () => {
            try {
                // 1. Fetch config (Real + Virtual Cameras)
                const cameraRes = await fetch(`/api/parking/${parkingLotId}/camera`)
                const cameraData = await cameraRes.json()

                if (cameraData.cameras && cameraData.cameras.length > 0) {
                    setCameras(cameraData.cameras)

                    // Auto-select first camera
                    const firstCam = cameraData.cameras[0]
                    setActiveCameraId(firstCam.id)

                    // Determine Stream URL (Virtual cams use main lot URL, Real cams might have specific URL)
                    // For the Python service, we request the specific camera stream path
                    setCameraUrl(`${AI_SERVICE_URL}/camera/${parkingLotId}/${firstCam.id}`)

                    startMonitor(firstCam.id)
                } else if (cameraData.hasCamera) {
                    // Fallback for primitive setup
                    setCameraUrl(`${AI_SERVICE_URL}/camera/${parkingLotId}`)
                    startMonitor()
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

    const handleCameraSwitch = (camId: string) => {
        setActiveCameraId(camId)
        // Update stream URL to point to the specific camera (real or virtual)
        setCameraUrl(`${AI_SERVICE_URL}/camera/${parkingLotId}/${camId}`)

        // Trigger monitor for this specific camera
        fetch(`${AI_SERVICE_URL}/start/${parkingLotId}/${camId}`, { method: 'POST' })
            .catch(e => console.error("Failed to switch monitor:", e))
    }

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
        <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30 pb-20">
            {/* Cinematic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 pt-4 space-y-6">
                {/* Futuristic Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-0 pb-4 border-b border-white/5">
                    <div className="space-y-4">


                        <div className="space-y-1">
                            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500">
                                Live Camera Surveillance
                            </h1>
                            <div className="flex items-center gap-4 text-zinc-500">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    System Integrity: 100%
                                </p>
                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <Zap size={12} className="text-amber-400" />
                                    AI Latency: 12ms
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href={parkingLotId ? `/dashboard/owner/parking-lots/${parkingLotId}/slots` : "#"}
                            className={`group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-500 overflow-hidden ${!parkingLotId ? "opacity-30 pointer-events-none" : ""}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="relative flex items-center gap-4">
                                <LayoutDashboard size={18} className="text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                                <span className="text-xs font-black text-zinc-300 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                                    Matrix Controls
                                </span>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Main View */}
                <div className="space-y-6">
                    {/* Camera Switcher Tabs */}
                    {cameras.length > 1 && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            {cameras.map((cam, idx) => (
                                <button
                                    key={cam.id}
                                    onClick={() => handleCameraSwitch(cam.id)}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCameraId === cam.id
                                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                                        : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {`S${idx * 30 + 1} - S${slots.length ? Math.min((idx + 1) * 30, slots.length) : (idx + 1) * 30}`}
                                </button>
                            ))}
                        </div>
                    )}

                    <CameraAnalysis
                        cameraUrl={cameraUrl}
                        slots={slots.filter(s => activeCameraId ? s.cameraId === activeCameraId : true)}
                        wsConnected={wsConnected}
                    />

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
