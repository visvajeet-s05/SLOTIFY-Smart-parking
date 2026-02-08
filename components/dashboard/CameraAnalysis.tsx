"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Camera, Activity, CheckCircle, Gauge, Settings, Save, X, MousePointer2 } from "lucide-react"

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

export default function CameraAnalysis({ cameraUrl, slots: initialSlots, wsConnected }: CameraAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [scanPosition, setScanPosition] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    // Calibration State
    const [isCalibrationMode, setIsCalibrationMode] = useState(false)
    const [slots, setSlots] = useState<Slot[]>(initialSlots)
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [initialRect, setInitialRect] = useState({ x: 0, y: 0, w: 0, h: 0 })
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })

    // Sync props to state when not calibrating
    useEffect(() => {
        if (!isCalibrationMode) {
            setSlots(initialSlots)
        }
    }, [initialSlots, isCalibrationMode])

    useEffect(() => {
        setIsAnalyzing(wsConnected)
    }, [wsConnected])

    // Simulation of scanning line
    useEffect(() => {
        if (!isAnalyzing || isCalibrationMode) return
        const interval = setInterval(() => {
            setScanPosition((prev) => (prev >= 100 ? 0 : prev + 1))
        }, 50)
        return () => clearInterval(interval)
    }, [isAnalyzing, isCalibrationMode])

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget
        setImgDimensions({ width: naturalWidth, height: naturalHeight })
    }

    // --- Drag Logic ---
    const getScale = () => {
        if (!imgRef.current || imgDimensions.width === 0) return { x: 1, y: 1 }
        const rect = imgRef.current.getBoundingClientRect()
        return {
            x: imgDimensions.width / rect.width,
            y: imgDimensions.height / rect.height
        }
    }

    const startDrag = (e: React.MouseEvent, slotId: string) => {
        if (!isCalibrationMode) return
        e.stopPropagation()
        e.preventDefault()

        const slot = slots.find(s => s.id === slotId)
        if (!slot) return

        setSelectedSlotId(slotId)
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setInitialRect({
            x: slot.x || 0,
            y: slot.y || 0,
            w: slot.width || 100,
            h: slot.height || 100
        })
    }

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedSlotId || !isCalibrationMode) return

        const scale = getScale()
        const dx = (e.clientX - dragStart.x) * scale.x
        const dy = (e.clientY - dragStart.y) * scale.y

        setSlots(prev => prev.map(s => {
            if (s.id === selectedSlotId) {
                return {
                    ...s,
                    x: Math.round(initialRect.x + dx),
                    y: Math.round(initialRect.y + dy),
                    width: s.width || 100, // Preserve Width
                    height: s.height || 100 // Preserve Height
                }
            }
            return s
        }))
    }

    const endDrag = () => {
        setIsDragging(false)
    }

    const saveCalibration = async () => {
        try {
            const updates = slots.map(s => ({
                id: s.id,
                x: s.x || 0,
                y: s.y || 0,
                width: s.width || 100,
                height: s.height || 100
            }))

            const res = await fetch('/api/internal/slots/coordinates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            })

            if (res.ok) {
                setIsCalibrationMode(false)
                alert("Calibration saved! AI zones updated.")
            } else {
                alert("Failed to save calibration")
            }
        } catch (e) {
            console.error(e)
            alert("Error saving calibration")
        }
    }

    return (
        <div
            className="relative group overflow-hidden rounded-3xl border border-white/10 bg-black aspect-video shadow-2xl shadow-purple-500/10 select-none flex flex-col"
            ref={containerRef}
            onMouseMove={onMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
        >
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                            {isCalibrationMode ? "Calibration Mode" : (wsConnected ? "Live AI Feed" : "Signal Lost")}
                        </span>
                    </div>
                </div>

                <div className="pointer-events-auto flex gap-2">
                    {!isCalibrationMode ? (
                        <button
                            onClick={() => setIsCalibrationMode(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 transition-colors"
                        >
                            <Settings size={14} className="text-zinc-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Calibrate</span>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsCalibrationMode(false)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md rounded-full border border-red-500/20 transition-colors"
                            >
                                <X size={14} className="text-red-300" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-300">Cancel</span>
                            </button>
                            <button
                                onClick={saveCalibration}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 backdrop-blur-md rounded-full border border-green-500/20 transition-colors"
                            >
                                <Save size={14} className="text-green-300" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-300">Save</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Camera Image */}
            <div className={`relative flex-1 flex items-center justify-center bg-zinc-900 overflow-hidden ${isCalibrationMode ? "cursor-crosshair" : ""}`}>
                {cameraUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            ref={imgRef}
                            src={cameraUrl}
                            alt="Live Analysis Feed"
                            className="max-w-full max-h-full object-contain"
                            onLoad={handleImageLoad}
                            draggable={false}
                        />

                        <SlotsOverlay
                            imgRef={imgRef}
                            slots={slots} // Always pass current slots (which follow props in live mode)
                            imgDimensions={imgDimensions}
                            isCalibrationMode={isCalibrationMode}
                            selectedSlotId={selectedSlotId}
                            onMouseDown={startDrag}
                        />

                        {/* Scan Line */}
                        {isAnalyzing && !isCalibrationMode && (
                            <motion.div
                                style={{ top: `${scanPosition}%` }}
                                className="absolute left-0 right-0 h-px bg-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 pointer-events-none"
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Camera size={48} className="text-zinc-700 animate-pulse" />
                        <p className="text-zinc-500 font-mono text-sm tracking-widest">AWAITING CAMERA STREAM...</p>
                    </div>
                )}
            </div>

            {/* Metrics */}
            {!isCalibrationMode && (
                <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                    <div className="px-3 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-2">
                        <Gauge size={12} className="text-purple-400" />
                        <span className="text-xs font-mono font-bold text-purple-400">
                            {slots.filter(s => s.status === 'OCCUPIED').length} / {slots.length} Occupied
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

// Subcomponent to handle the precise overlay alignment
function SlotsOverlay({ imgRef, slots, imgDimensions, isCalibrationMode, selectedSlotId, onMouseDown }: any) {
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        const updateRect = () => {
            if (imgRef.current) {
                setRect(imgRef.current.getBoundingClientRect())
            }
        }

        updateRect()
        window.addEventListener('resize', updateRect)
        const interval = setInterval(updateRect, 500)

        return () => {
            window.removeEventListener('resize', updateRect)
            clearInterval(interval)
        }
    }, [imgRef, imgDimensions])

    if (!rect) return null

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                width: rect.width,
                height: rect.height,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)' // Center exactly over the image
            }}
        >
            {slots.map((slot: any) => {
                const left = (slot.x || 0) / imgDimensions.width * 100
                const top = (slot.y || 0) / imgDimensions.height * 100
                const width = (slot.width || 100) / imgDimensions.width * 100
                const height = (slot.height || 100) / imgDimensions.height * 100

                const isSelected = selectedSlotId === slot.id

                // Determine styling based on mode and status
                let borderClass = ""
                let bgClass = ""

                if (isCalibrationMode) {
                    if (isSelected) {
                        borderClass = "border-yellow-400 z-50 shadow-lg"
                        bgClass = "bg-yellow-400/20"
                    } else {
                        borderClass = "border-cyan-400/50 hover:border-cyan-400"
                        bgClass = "bg-cyan-400/10"
                    }
                } else {
                    // Live Mode - Status Colors
                    switch (slot.status) {
                        case 'OCCUPIED':
                            borderClass = "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            bgClass = "bg-red-500/10"
                            break
                        case 'AVAILABLE':
                            borderClass = "border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                            bgClass = "bg-emerald-400/5"
                            break
                        case 'RESERVED':
                            borderClass = "border-amber-400"
                            bgClass = "bg-amber-400/10"
                            break
                        case 'DISABLED':
                            borderClass = "border-zinc-500"
                            bgClass = "bg-zinc-500/20"
                            break
                        default:
                            borderClass = "border-zinc-700"
                            bgClass = "bg-black/20"
                    }
                }

                return (
                    <div
                        key={slot.id}
                        className={`absolute border-2 transition-all duration-300 group/slot
                            ${borderClass} ${bgClass}
                            ${isCalibrationMode ? "pointer-events-auto cursor-move" : ""}
                        `}
                        style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`
                        }}
                        onMouseDown={(e) => isCalibrationMode && onMouseDown(e, slot.id)}
                    >
                        {/* Slot Label - Always visible but styled differently in Live Mode */}
                        <div className={`
                            absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap backdrop-blur-sm border
                            ${isCalibrationMode
                                ? "bg-black/80 text-white border-white/20"
                                : slot.status === 'OCCUPIED' ? "bg-red-600/90 text-white border-red-500/50"
                                    : slot.status === 'AVAILABLE' ? "bg-emerald-600/90 text-white border-emerald-500/50"
                                        : "bg-zinc-800/90 text-zinc-300 border-white/10"
                            }
                        `}>
                            S{slot.slotNumber}
                        </div>

                        {/* Coords Debug (Calibration Only) */}
                        {isCalibrationMode && isSelected && (
                            <div className="absolute -bottom-6 left-0 bg-black/80 px-1 rounded text-[8px] text-zinc-400 whitespace-nowrap font-mono">
                                {Math.round(slot.x)},{Math.round(slot.y)}
                            </div>
                        )}

                        {/* Resize Corner Indicator (Calibration Only) */}
                        {isCalibrationMode && (
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/50 group-hover/slot:bg-yellow-400 rounded-tl-sm pointer-events-none" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
