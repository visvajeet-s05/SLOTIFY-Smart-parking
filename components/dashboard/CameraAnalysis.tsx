"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Activity, CheckCircle, Gauge, Settings, Save, X, MousePointer2, Scan, Eye, EyeOff, Zap, ShieldAlert } from "lucide-react"

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
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    // View State
    const [viewMode, setViewMode] = useState<"OPTIC" | "MATRIX" | "SPLIT">("OPTIC")
    const [matrixBgMode, setMatrixBgMode] = useState<"VOID" | "OPTIC">("OPTIC")

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



    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget
        setImgDimensions({ width: naturalWidth, height: naturalHeight })
    }

    // --- Drag Logic ---
    const [dragType, setDragType] = useState<"MOVE" | "RESIZE" | null>(null)

    const getScale = () => {
        if (!imgRef.current) return { x: 1, y: 1 }
        const rect = imgRef.current.getBoundingClientRect()
        const REF_W = 1920;
        const REF_H = 1080;
        return {
            x: REF_W / rect.width,
            y: REF_H / rect.height
        }
    }

    const startDrag = (e: React.MouseEvent, slotId: string, type: "MOVE" | "RESIZE") => {
        if (!isCalibrationMode) return
        e.stopPropagation()
        e.preventDefault()

        const slot = slots.find(s => s.id === slotId)
        if (!slot) return

        setSelectedSlotId(slotId)
        setIsDragging(true)
        setDragType(type)
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
                if (dragType === "MOVE") {
                    return {
                        ...s,
                        x: Math.round(initialRect.x + dx),
                        y: Math.round(initialRect.y + dy)
                    }
                } else if (dragType === "RESIZE") {
                    return {
                        ...s,
                        width: Math.max(20, Math.round(initialRect.w + dx)),
                        height: Math.max(20, Math.round(initialRect.h + dy))
                    }
                }
            }
            return s
        }))
    }

    const endDrag = () => {
        setIsDragging(false)
        setDragType(null)
    }

    const saveCalibration = async () => {
        try {
            // Standard Reference System (1080p)
            const REF_W = 1920;
            const REF_H = 1080;

            const updates = slots.map(s => {
                // Calculate percentages based on what was seen in the browser
                const px = (s.x || 0) / imgDimensions.width;
                const py = (s.y || 0) / imgDimensions.height;
                const pw = (s.width || 0) / imgDimensions.width;
                const ph = (s.height || 0) / imgDimensions.height;

                // Project into 1080p DB Basis
                return {
                    id: s.id,
                    x: Math.round(px * REF_W),
                    y: Math.round(py * REF_H),
                    width: Math.round(pw * REF_W),
                    height: Math.round(ph * REF_H)
                };
            });

            const res = await fetch('/api/internal/slots/coordinates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            })

            if (res.ok) {
                setIsCalibrationMode(false)
                setSelectedSlotId(null)
            } else {
                alert("Failed to save calibration")
            }
        } catch (e) {
            console.error(e)
            alert("Error saving calibration")
        }
    }

    return (
        <div className="space-y-6">
            {/* View Mode Controller */}
            <div className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-1">
                    <ViewButton
                        active={viewMode === "OPTIC"}
                        onClick={() => setViewMode("OPTIC")}
                        icon={<Camera size={14} />}
                        label="Optic Link"
                    />
                    <ViewButton
                        active={viewMode === "MATRIX"}
                        onClick={() => setViewMode("MATRIX")}
                        icon={<Activity size={14} />}
                        label="Neural Matrix"
                    />
                    <ViewButton
                        active={viewMode === "SPLIT"}
                        onClick={() => setViewMode("SPLIT")}
                        icon={<Gauge size={14} />}
                        label="Split View"
                    />
                </div>

                <div className="flex items-center gap-4 px-4">
                    <AnimatePresence>
                        {viewMode === "MATRIX" && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 mr-4"
                            >
                                <button
                                    onClick={() => setMatrixBgMode("VOID")}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${matrixBgMode === "VOID" ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "text-zinc-500 hover:text-white"}`}
                                >
                                    <EyeOff size={12} />
                                    Void
                                </button>
                                <button
                                    onClick={() => setMatrixBgMode("OPTIC")}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${matrixBgMode === "OPTIC" ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "text-zinc-500 hover:text-white"}`}
                                >
                                    <Eye size={12} />
                                    Neural Vision
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse" : "bg-zinc-600"}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stream Status: {wsConnected ? "Realtime" : "Offline"}</span>
                    </div>
                </div>
            </div>

            <div className={`grid gap-6 ${viewMode === "SPLIT" ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
                {/* Visual Feed (OPTIC) */}
                {(viewMode === "OPTIC" || viewMode === "SPLIT") && (
                    <div
                        className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#080808] aspect-video shadow-[0_30px_100px_rgba(0,0,0,0.8)] select-none flex flex-col"
                        ref={containerRef}
                        onMouseMove={onMouseMove}
                        onMouseUp={endDrag}
                        onMouseLeave={endDrag}
                    >
                        {/* Neural Overlay Frame */}
                        <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none z-30" />

                        {/* Header HUD (Matching User Image) */}
                        <div className="absolute top-5 left-5 right-5 z-40 flex items-center justify-between pointer-events-none">
                            <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2.5">
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                />
                                <span className="text-[10px] font-black tracking-widest text-white/90 uppercase">Optic Link Active</span>
                            </div>

                            <button
                                onClick={isCalibrationMode ? saveCalibration : () => setIsCalibrationMode(true)}
                                className={`pointer-events-auto bg-black/80 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 flex items-center gap-2 transition-all hover:bg-white/10
                                    ${isCalibrationMode ? 'ring-2 ring-cyan-500/50' : ''}`}
                            >
                                <Settings className="w-3.5 h-3.5 text-white/70" />
                                <span className="text-[10px] font-black tracking-widest text-white/90 uppercase whitespace-nowrap">
                                    {isCalibrationMode ? 'Sync Nodes' : 'Tune Nodes'}
                                </span>
                            </button>
                        </div>

                        {/* Main Camera Image */}
                        <div className={`relative flex-1 flex items-center justify-center bg-black overflow-hidden ${isCalibrationMode ? "cursor-crosshair bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px]" : ""}`}>
                            {cameraUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        ref={imgRef}
                                        src={cameraUrl}
                                        alt="Live Analysis Feed"
                                        className={`max-w-full max-h-full object-contain transition-all duration-700 ${isCalibrationMode ? "opacity-40 grayscale" : "opacity-100"}`}
                                        onLoad={handleImageLoad}
                                        draggable={false}
                                    />
                                    <div className="absolute inset-0 pointer-events-none">
                                        <SlotsOverlay
                                            imgRef={imgRef}
                                            slots={slots}
                                            imgDimensions={imgDimensions}
                                            isCalibrationMode={isCalibrationMode}
                                            selectedSlotId={selectedSlotId}
                                            onMouseDown={startDrag}
                                            isAnalyzing={isAnalyzing}
                                        />
                                    </div>
                                    {/* Scan Line HUD (Matching User Image) */}
                                    {isAnalyzing && !isCalibrationMode && (
                                        <motion.div
                                            animate={{ top: ["0%", "100%"] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-0.5 z-20 pointer-events-none bg-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                        >
                                            <motion.div
                                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-cyan-400"
                                            />
                                        </motion.div>
                                    )}

                                    {/* Bottom-Level HUD (Matching User Image) */}
                                    <div className="absolute bottom-5 left-5 right-5 z-40 flex items-end justify-between pointer-events-none">
                                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl min-w-[150px]">
                                            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">AI Confidence</div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black text-cyan-400 font-mono">98.4</span>
                                                <span className="text-[10px] font-bold text-cyan-400/50 font-mono">%</span>
                                            </div>
                                        </div>

                                        <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10">
                                            <span className="text-[10px] font-black tracking-widest text-white/90 uppercase">Link Stable</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden">
                                    {/* Matrix Static Background */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
                                    <motion.div
                                        animate={{
                                            backgroundPosition: ["0% 0%", "100% 100%"],
                                            opacity: [0.03, 0.07, 0.03]
                                        }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px]"
                                    />
                                    <div className="relative flex flex-col items-center gap-4 z-10">
                                        <div className="p-4 bg-zinc-900/50 rounded-full border border-white/5 backdrop-blur-3xl">
                                            <Camera size={48} className="text-zinc-700 animate-pulse" />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <p className="text-zinc-500 font-black text-[10px] tracking-[0.5em] uppercase">Optic Link Offline</p>
                                            <p className="text-zinc-700 font-bold text-[8px] tracking-[0.2em] uppercase mt-1">Establishing Neural Connection...</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* Digital Twin (MATRIX) */}
                {(viewMode === "MATRIX" || viewMode === "SPLIT") && (
                    <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#080808] aspect-video shadow-[0_30px_100px_rgba(0,0,0,0.8)] select-none flex flex-col p-8">
                        {/* Camera Background (Neural Vision Mode) */}
                        {matrixBgMode === "OPTIC" && cameraUrl && (
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <img
                                    src={cameraUrl}
                                    className="w-full h-full object-cover opacity-20 contrast-150 grayscale brightness-[0.3] scale-110"
                                    alt="Matrix Backdrop"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808]" />
                                <div className="absolute inset-0 bg-cyan-900/10 mix-blend-color" />
                                <div className="absolute inset-0 bg-[#080808]/40 backdrop-blur-[4px]" />

                                {/* Scanning Ray for background */}
                                <motion.div
                                    animate={{ top: ["-20%", "120%"] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-px bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10"
                                />
                            </div>
                        )}

                        {/* Decorative HUD Elements */}
                        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none z-20">
                            <div className="text-right font-mono text-[8px] text-cyan-400 uppercase tracking-tighter leading-none">
                                NEURAL ARCHITECTURE v4.2<br />MAPPING ACTIVE<br />VECTOR COMPRESSION: ON
                            </div>
                        </div>

                        <div className="relative flex-1 flex flex-col z-20">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
                                        Neural Matrix
                                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-bold uppercase tracking-wider">Digital Twin</span>
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Vector Schematic of Live Occupancy</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-right">
                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Available</div>
                                        <div className="text-lg font-black text-emerald-500 font-mono leading-none">{slots.filter(s => s.status === 'AVAILABLE').length}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Occupied</div>
                                        <div className="text-lg font-black text-red-500 font-mono leading-none">{slots.filter(s => s.status === 'OCCUPIED').length}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Digital Twin Grid */}
                            <div className="flex-1 bg-white/[0.02] rounded-3xl border border-white/5 p-4 relative overflow-hidden flex flex-col backdrop-blur-md">
                                {/* Grid Background */}
                                <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:40px_40px] opacity-30" />

                                <div className="relative flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
                                    {Array.from(new Set(slots.map(s => s.row || 'Default'))).sort().map((rowLabel) => {
                                        const rowSlots = slots.filter(s => (s.row || 'Default') === rowLabel)
                                            .sort((a, b) => a.slotNumber - b.slotNumber);
                                        return (
                                            <div key={rowLabel} className="flex items-center gap-3 group/row">
                                                <div className="w-8 shrink-0 text-[10px] font-black text-zinc-600 group-hover/row:text-cyan-400 transition-colors uppercase flex items-center justify-center bg-white/5 h-8 rounded-lg border border-white/5">
                                                    {rowLabel}
                                                </div>
                                                <div
                                                    className="flex-1 grid gap-1.5"
                                                    style={{ gridTemplateColumns: `repeat(${rowSlots.length}, minmax(0, 1fr))` }}
                                                >
                                                    {rowSlots.map((slot) => (
                                                        <motion.div
                                                            key={slot.id}
                                                            layoutId={slot.id}
                                                            className={`h-8 rounded-md border flex items-center justify-center relative group/matrix-slot overflow-hidden transition-all duration-500
                                                            ${slot.status === 'AVAILABLE' ? 'bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/10 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]' :
                                                                    slot.status === 'OCCUPIED' ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' :
                                                                        'bg-amber-500/5 border-amber-500/30'}`}
                                                        >
                                                            {/* Status Pulse */}
                                                            {slot.status === 'OCCUPIED' && (
                                                                <motion.div
                                                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                    className="absolute inset-0 bg-red-500/10"
                                                                />
                                                            )}

                                                            {/* Scanning Bar */}
                                                            {isAnalyzing && (
                                                                <motion.div
                                                                    animate={{ left: ["-100%", "200%"] }}
                                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                                    className="absolute top-0 bottom-0 w-[15px] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"
                                                                />
                                                            )}

                                                            {/* Slot Number */}
                                                            <span className={`text-[8px] font-mono font-black tracking-tighter transition-all duration-500 ${slot.status === 'AVAILABLE' ? 'text-emerald-500/60 group-hover/matrix-slot:text-emerald-400' :
                                                                slot.status === 'OCCUPIED' ? 'text-red-500 group-hover/matrix-slot:text-red-400' :
                                                                    'text-amber-500/60 group-hover/matrix-slot:text-amber-400'
                                                                }`}>
                                                                {String(slot.slotNumber).padStart(2, '0').slice(-2)}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Matrix Footer */}
                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex gap-6 items-center">
                                    <MatrixStat label="Total Nodes" value={slots.length.toString()} />
                                    <div className="w-px h-6 bg-white/5 mx-2" />
                                    <MatrixStat label="Neural Load" value={`${Math.floor(Math.random() * 5 + 10)}%`} />
                                    <div className="w-px h-6 bg-white/5 mx-2" />
                                    <MatrixStat label="Uptime" value="128:42" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest font-mono">Sync Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ViewButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-2 rounded-xl transition-all duration-500 relative group overflow-hidden
                ${active ? 'bg-cyan-500 text-black font-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}
            `}
        >
            <div className={`transition-transform duration-500 ${active ? 'scale-110' : 'scale-100'}`}>
                {icon}
            </div>
            <span className="text-[11px] uppercase tracking-widest whitespace-nowrap">{label}</span>
            {active && (
                <motion.div layoutId="view-pill" className="absolute inset-0 bg-cyan-400 -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
        </button>
    )
}

function MatrixStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{label}</div>
            <div className="text-sm font-black text-white font-mono">{value}</div>
        </div>
    )
}

function SlotsOverlay({ imgRef, slots, imgDimensions, isCalibrationMode, selectedSlotId, onMouseDown, isAnalyzing }: any) {
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
            className="absolute"
            style={{
                width: rect.width,
                height: rect.height,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }}
        >
            {slots.map((slot: any) => {
                // Projection from 1080p Reference System to Perspective Space
                const REF_W = 1920;
                const REF_H = 1080;

                const left = (slot.x || 0) / REF_W * 100
                const top = (slot.y || 0) / REF_H * 100
                const width = (slot.width || 100) / REF_W * 100
                const height = (slot.height || 100) / REF_H * 100
                const isSelected = selectedSlotId === slot.id

                let borderStyle = "border-zinc-500/50"
                let bgColor = "bg-transparent"

                if (isCalibrationMode) {
                    borderStyle = isSelected ? "border-cyan-400 border-[3px] shadow-[0_0_20px_rgba(34,211,238,0.5)]" : "border-white/20 dashed"
                    bgColor = isSelected ? "bg-cyan-400/10" : "bg-white/5"
                } else {
                    switch (slot.status) {
                        case 'OCCUPIED':
                            borderStyle = "border-red-500 border-[2.5px] shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                            bgColor = "bg-red-500/5 backdrop-blur-[1px]"
                            break
                        case 'AVAILABLE':
                            borderStyle = "border-emerald-500 border-[1.5px] shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            bgColor = "bg-emerald-500/5"
                            break
                        case 'RESERVED':
                            borderStyle = "border-amber-400 border-[2px] shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                            bgColor = "bg-amber-400/5"
                            break
                        case 'DISABLED':
                            borderStyle = "border-stone-500 border-[1.5px] opacity-60"
                            bgColor = "bg-stone-500/10 backdrop-blur-sm"
                            break
                        case 'CLOSED':
                            borderStyle = "border-zinc-800 border-[1.5px] opacity-40"
                            bgColor = "bg-black/60"
                            break
                        default:
                            borderStyle = "border-zinc-700"
                            bgColor = "bg-black/20"
                    }
                }

                return (
                    <div
                        key={slot.id}
                        onMouseDown={(e) => isCalibrationMode && onMouseDown(e, slot.id, "MOVE")}
                        className={`absolute border transition-all duration-300 flex items-center justify-center
                            ${borderStyle} ${bgColor} ${isCalibrationMode ? "pointer-events-auto cursor-move z-40" : "pointer-events-none"}
                        `}
                        style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                            borderRadius: '2px',
                            borderWidth: '2px'
                        }}
                    >
                        {/* Spatial Corner Accents */}
                        {!isCalibrationMode && (
                            <>
                                <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${slot.status === 'OCCUPIED' ? 'border-red-500' : 'border-emerald-500'} opacity-100`} />
                                <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${slot.status === 'OCCUPIED' ? 'border-red-500' : 'border-emerald-500'} opacity-100`} />
                                <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${slot.status === 'OCCUPIED' ? 'border-red-500' : 'border-emerald-500'} opacity-100`} />
                                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${slot.status === 'OCCUPIED' ? 'border-red-500' : 'border-emerald-500'} opacity-100`} />
                            </>
                        )}

                        {/* Center Dot (Matching User Image - Enhanced) */}
                        {!isCalibrationMode && (
                            <motion.div
                                animate={slot.status === 'OCCUPIED' ? { scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] } : { scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`w-1.5 h-1.5 rounded-full ${slot.status === 'OCCUPIED' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-emerald-500 shadow-[0_0_8px_emerald]'}`}
                            />
                        )}

                        {/* Resizer Handle (Calibration) */}
                        {isCalibrationMode && (
                            <div
                                onMouseDown={(e) => {
                                    e.stopPropagation()
                                    onMouseDown(e, slot.id, "RESIZE")
                                }}
                                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center"
                            >
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-px" />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
