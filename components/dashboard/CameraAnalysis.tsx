"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Activity, Gauge, Settings, Zap } from "lucide-react"

type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"

interface Slot {
    id: string
    slotNumber: number
    row: string
    status: SlotStatus
    slotType?: string
    x?: number
    y?: number
    width?: number
    height?: number
    aiConfidence?: number
}

interface CameraAnalysisProps {
    cameraUrl: string | null
    rawStreamUrl?: string | null
    slots: Slot[]
    wsConnected: boolean
    activeRoi?: { x: number, y: number, w: number, h: number }
}

const STATUS_COLORS = {
    AVAILABLE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]",
    OCCUPIED: "border-red-500/60 bg-red-500/20 text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.15)]",
    RESERVED: "border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]",
    DISABLED: "border-zinc-800 bg-zinc-900/60 text-zinc-600 opacity-60",
    CLOSED: "border-neutral-900 bg-neutral-950/80 text-neutral-700",
    EV: "border-yellow-400/50 bg-yellow-400/20 text-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
}

export default function CameraAnalysis({ cameraUrl, rawStreamUrl, slots: initialSlots, wsConnected, activeRoi }: CameraAnalysisProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    const [viewMode, setViewMode] = useState<"GRID" | "OPTIC" | "SPLIT">("GRID")

    const [slots, setSlots] = useState<Slot[]>(initialSlots)
    const [isCalibrationMode, setIsCalibrationMode] = useState(false)
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [initialRect, setInitialRect] = useState({ x: 0, y: 0, w: 0, h: 0 })
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })

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
                    return { ...s, x: Math.round(initialRect.x + dx), y: Math.round(initialRect.y + dy) }
                } else if (dragType === "RESIZE") {
                    return { ...s, width: Math.max(20, Math.round(initialRect.w + dx)), height: Math.max(20, Math.round(initialRect.h + dy)) }
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
            const REF_W = 1920, REF_H = 1080;
            const updates = slots.map(s => ({
                id: s.id,
                x: Math.round(((s.x || 0) / imgDimensions.width) * REF_W),
                y: Math.round(((s.y || 0) / imgDimensions.height) * REF_H),
                width: Math.round(((s.width || 0) / imgDimensions.width) * REF_W),
                height: Math.round(((s.height || 0) / imgDimensions.height) * REF_H)
            }));
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
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* View Mode Controller */}
            <div className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-2">
                    <ViewButton active={viewMode === "GRID"} onClick={() => setViewMode("GRID")} icon={<Activity size={16} />} label="Control Grid" />
                    <ViewButton active={viewMode === "OPTIC"} onClick={() => setViewMode("OPTIC")} icon={<Camera size={16} />} label="Optic Link" />
                    <ViewButton active={viewMode === "SPLIT"} onClick={() => setViewMode("SPLIT")} icon={<Gauge size={16} />} label="Neural Split" />
                </div>

                <div className="flex items-center gap-6 px-6">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${wsConnected ? "bg-cyan-500 shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-pulse" : "bg-zinc-700"}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{wsConnected ? "Live Link" : "Link Lost"}</span>
                    </div>
                    <button
                        onClick={isCalibrationMode ? saveCalibration : () => setIsCalibrationMode(true)}
                        className={`bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2.5 transition-all
                            ${isCalibrationMode ? 'ring-2 ring-cyan-500/50 bg-cyan-500/10' : ''}`}
                    >
                        <Settings className={`w-4 h-4 ${isCalibrationMode ? 'text-cyan-400' : 'text-zinc-400'}`} />
                        <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase">{isCalibrationMode ? 'Save Map' : 'Refine Nodes'}</span>
                    </button>
                </div>
            </div>

            <div className={`grid gap-8 ${viewMode === "SPLIT" ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
                
                {/* Visual View (OPTIC) */}
                {(viewMode === "OPTIC" || viewMode === "SPLIT") && (
                    <div
                        className="relative group overflow-hidden rounded-[3rem] border border-white/5 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.9)] select-none flex flex-col"
                        style={{ aspectRatio: activeRoi ? `${activeRoi.w}/${activeRoi.h}` : '16/9' }}
                        ref={containerRef}
                        onMouseMove={onMouseMove}
                        onMouseUp={endDrag}
                        onMouseLeave={endDrag}
                    >
                        <div className="absolute inset-0 border-[1.5px] border-white/5 rounded-[3rem] pointer-events-none z-30 m-4" />

                        {cameraUrl ? (
                            <div className="relative w-full h-full">
                                <img
                                    ref={imgRef}
                                    src={cameraUrl}
                                    alt=""
                                    className={`w-full h-full object-cover transition-all duration-1000 ${isCalibrationMode ? "opacity-30 grayscale" : "opacity-100"}`}
                                    onLoad={handleImageLoad}
                                    draggable={false}
                                />
                                
                                {isAnalyzing && !isCalibrationMode && (
                                    <motion.div
                                        animate={{ top: ["0%", "100%"] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                                    />
                                )}

                                <div className="absolute inset-0 pointer-events-none">
                                    <SlotsOverlay
                                        imgRef={imgRef}
                                        slots={slots}
                                        imgDimensions={imgDimensions}
                                        isCalibrationMode={isCalibrationMode}
                                        selectedSlotId={selectedSlotId}
                                        onMouseDown={startDrag}
                                        isAnalyzing={isAnalyzing}
                                        activeRoi={activeRoi}
                                    />
                                    
                                    {/* OSD ELEMENTS (FOR OPTIC LINK) */}
                                    <div className="absolute bottom-8 left-10 flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Node ID</span>
                                            <span className="text-sm font-bold text-white/80 font-mono tracking-tighter uppercase whitespace-nowrap">OPTIC-LNK-01</span>
                                        </div>
                                        <div className="w-px h-8 bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Link</span>
                                            <span className="text-sm font-bold text-white/80 font-mono tracking-tighter uppercase whitespace-nowrap">SECURE_BRIDGE_V5</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-8 right-10 flex items-center gap-5">
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">System Time</span>
                                            <span className="text-sm font-bold text-white/80 font-mono tracking-tight">
                                                {new Date().toISOString().replace('T', ' ').substring(0, 19)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                                            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Live</span>
                                        </div>
                                    </div>
                                    
                                    {/* SCANLINE OVERLAY */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none" />
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center bg-zinc-900/50 backdrop-blur-3xl animate-pulse">
                                        <Camera size={32} className="text-zinc-600" />
                                    </div>
                                    <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em]">Establishing Neural Bridge...</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CONTROL GRID — STRICT LAYERING: Camera(z-0) → Overlay(z-10) → Grid(z-20) */}
                {(viewMode === "GRID" || viewMode === "SPLIT") && (
                    <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.9)] select-none" style={{ minHeight: '700px' }}>
                        
                        {/* ═══ LAYER 1 (z-0): ONE FULL-BACKGROUND LIVE CAMERA ═══ */}
                        {/* Use direct IP stream for zero-latency presentation viewing */}
                        {(rawStreamUrl || cameraUrl) ? (
                            <img 
                                src={rawStreamUrl || cameraUrl || ''}
                                className="absolute inset-0 w-full h-full object-cover z-0"
                                alt=""
                                draggable={false}
                                onError={(e) => {
                                    // Fallback to AI proxy if direct stream drops
                                    const img = e.currentTarget;
                                    if (rawStreamUrl && img.src === rawStreamUrl && cameraUrl) {
                                        img.src = cameraUrl;
                                    } else if (cameraUrl && img.src === cameraUrl && rawStreamUrl) {
                                        img.src = rawStreamUrl;
                                    }
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
                        )}

                        {/* ═══ LAYER 2 (z-10): DARK OVERLAY FOR READABILITY ═══ */}
                        <div className="absolute inset-0 bg-black/50 z-10" />

                        {/* ═══ LAYER 3 (z-20): GRID OVERLAY ON TOP ═══ */}
                        <div className="relative z-20 flex flex-col h-full p-8 md:p-10">
                            
                            {/* HEADER */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 md:mb-10 gap-6">
                                <div className="space-y-1.5">
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                                        Parking Control Center
                                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                            S{slots[0]?.slotNumber || 1} - S{slots[slots.length-1]?.slotNumber || 30}
                                        </span>
                                    </h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">Structured Node Architecture • Live Optic Feed</p>
                                </div>

                                <div className="flex flex-wrap gap-8 px-8 py-5 bg-black/60 rounded-3xl border border-white/5 backdrop-blur-xl">
                                    <LegendItem label="Available" color="bg-emerald-500" />
                                    <LegendItem label="Occupied" color="bg-red-500" />
                                    <LegendItem label="Reserved" color="bg-blue-500" />
                                    <LegendItem label="EV Hub" color="bg-yellow-400" />
                                </div>
                            </div>

                            {/* 6×5 SLOT GRID */}
                            <div className="grid grid-cols-6 gap-4 md:gap-5 flex-1">
                                {slots.slice(0, 30).map((slot, idx) => {
                                    const isEV = slot.slotType === "EV";
                                    const statusKey = isEV ? "EV" : slot.status;
                                    const styleClass = STATUS_COLORS[statusKey as keyof typeof STATUS_COLORS] || STATUS_COLORS.AVAILABLE;

                                    return (
                                        <motion.div
                                            key={slot.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02, duration: 0.5, ease: "easeOut" }}
                                            className={`relative group h-24 md:h-28 rounded-xl border-[1.5px] overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-[1.03] cursor-pointer ${styleClass}`}
                                            style={{ background: slot.status === 'OCCUPIED' ? 'rgba(239,68,68,0.18)' : slot.status === 'RESERVED' ? 'rgba(59,130,246,0.12)' : isEV ? 'rgba(250,204,21,0.18)' : 'rgba(0,0,0,0.30)' }}
                                        >
                                            {/* SLOT NUMBER */}
                                            <span className="text-3xl md:text-4xl font-black tracking-tighter font-mono leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                                                {String(slot.slotNumber).padStart(2, '0')}
                                            </span>

                                            {/* OCCUPIED PULSE */}
                                            {slot.status === 'OCCUPIED' && (
                                                <div className="absolute top-3 left-3">
                                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                                                </div>
                                            )}

                                            {/* CORNER DECORATION */}
                                            <div className="absolute top-2.5 right-3 opacity-30">
                                                <div className="w-4 h-px bg-current" />
                                                <div className="w-px h-4 bg-current" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* FOOTER STATS */}
                            <div className="mt-10 flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-white/10">
                                <div className="flex gap-16">
                                    <GridStat label="Active Nodes" value="30" />
                                    <GridStat label="Available Bays" value={slots.slice(0, 30).filter(s => s.status === 'AVAILABLE').length.toString()} />
                                    <GridStat label="Neural Uptime" value="100%" />
                                </div>
                                
                                <div className="px-7 py-4 rounded-[1.5rem] bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-4 group">
                                    <div className="relative">
                                        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,1)]" />
                                        <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-40" />
                                    </div>
                                    <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] font-mono group-hover:text-cyan-400 transition-colors">Neural Control Sync Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ViewButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl transition-all duration-500 relative group overflow-hidden
                ${active ? 'text-black font-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}
            `}
        >
            <div className={`relative z-10 transition-transform duration-500 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{label}</span>
            {active && (
                <motion.div layoutId="view-bg" className="absolute inset-0 bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
        </button>
    )
}

function LegendItem({ label, color }: any) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_currentColor]`} />
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</span>
        </div>
    )
}

function GridStat({ label, value }: any) {
    return (
        <div className="space-y-1">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</div>
            <div className="text-3xl font-black text-white font-mono tracking-tighter leading-none">{value}</div>
        </div>
    )
}

function SlotsOverlay({ imgRef, slots, isCalibrationMode, selectedSlotId, onMouseDown, activeRoi }: any) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    useEffect(() => {
        const update = () => imgRef.current && setRect(imgRef.current.getBoundingClientRect())
        update(); window.addEventListener('resize', update); const i = setInterval(update, 500);
        return () => { window.removeEventListener('resize', update); clearInterval(i); }
    }, [imgRef])
    if (!rect) return null
    const roi = activeRoi || { x: 0, y: 0, w: 1920, h: 1080 };
    return (
        <div className="absolute" style={{ width: rect.width, height: rect.height, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            {slots.map((slot: any) => {
                const left = ((slot.x || 0) - roi.x) / roi.w * 100
                const top = ((slot.y || 0) - roi.y) / roi.h * 100
                const width = (slot.width || 100) / roi.w * 100
                const height = (slot.height || 100) / roi.h * 100
                const isSelected = selectedSlotId === slot.id
                let border = isCalibrationMode ? (isSelected ? "border-cyan-400 border-[3px] shadow-[0_0_25px_cyan]" : "border-white/20 border-dashed bg-white/5") : 
                             (slot.status === 'OCCUPIED' ? "border-red-500 border-[2.5px] shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-red-500/5" : 
                              slot.status === 'AVAILABLE' ? "border-emerald-500 border-[1.5px] bg-emerald-500/5" : "border-zinc-700");
                
                return (
                    <div
                        key={slot.id}
                        onMouseDown={(e) => isCalibrationMode && onMouseDown(e, slot.id, "MOVE")}
                        className={`absolute border transition-all duration-300 ${border} ${isCalibrationMode ? "pointer-events-auto cursor-move z-40" : "pointer-events-none"}`}
                        style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, borderRadius: '4px' }}
                    >
                        {isCalibrationMode && (
                            <div onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, slot.id, "RESIZE") }} className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-center justify-center">
                                <div className="w-2 h-2 bg-cyan-400 rounded-sm" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    )
}
