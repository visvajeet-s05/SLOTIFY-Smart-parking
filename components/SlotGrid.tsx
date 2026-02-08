type Slot = {
  id: string
  slotNumber: number
  row: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"
  aiConfidence: number
  updatedBy: "AI" | "OWNER" | "CUSTOMER" | "SYSTEM"
  updatedAt: string
  price: number
  slotType?: string
}

export default function SlotGrid({
  slots,
  selectable,
  onSelect
}: {
  slots: Slot[]
  selectable: boolean
  onSelect?: (slot: Slot) => void
}) {
  const getSlotStyle = (status: string, slotType?: string) => {
    if (status === "AVAILABLE") {
      if (slotType === "EV") return "bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-blue-400/50"
      if (slotType === "DISABLED") return "bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_15px_rgba(20,184,166,0.5)] border-teal-400/50"
      return "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-400/50"
    }
    if (status === "OCCUPIED") return "bg-gradient-to-br from-red-500/20 to-red-900/20 border-red-500/20 text-red-400/50 backdrop-blur-sm"
    if (status === "RESERVED") return "bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-amber-500/30 text-amber-500"
    if (status === "DISABLED") return "bg-slate-800/50 border-white/5 text-slate-500"
    if (status === "CLOSED") return "bg-black/80 border-red-900/50 text-red-900 line-through"
    return "bg-slate-800 border-white/5"
  }

  const getSlotIcon = (slotType?: string) => {
    if (slotType === "EV") return "⚡"
    if (slotType === "DISABLED") return "♿"
    return ""
  }

  return (
    <div className="space-y-6">
      {/* Slot Grid - 8 slots per row */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {slots.map((slot) => (
          <button
            key={slot.id}
            disabled={!selectable || slot.status !== "AVAILABLE"}
            onClick={() => onSelect?.(slot)}
            className={`
              h-24 rounded-2xl relative flex flex-col items-center justify-center transition-all duration-300 border
              ${getSlotStyle(slot.status, slot.slotType)}
              ${selectable && slot.status === "AVAILABLE" ? "hover:scale-110 hover:-translate-y-1 hover:z-10 cursor-pointer hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]" :
                slot.status === "OCCUPIED" ? "cursor-not-allowed opacity-80 grayscale-[0.5]" : "cursor-not-allowed opacity-60"}
            `}
          >
            {/* Slot Type Icon */}
            {slot.slotType && slot.slotType !== "REGULAR" && (
              <span className="absolute top-2 left-2 text-xs opacity-75">
                {getSlotIcon(slot.slotType)}
              </span>
            )}

            {/* Slot Number */}
            <span className={`text-lg font-black tracking-tighter ${slot.status === "OCCUPIED" ? "opacity-30" : "text-white"}`}>
              S{slot.slotNumber}
            </span>

            {/* Price (only show if available) */}
            {slot.status === "AVAILABLE" && (
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full mt-1 font-medium backdrop-blur-sm">
                ₹{slot.price}/hr
              </span>
            )}

            {/* Status indicator for non-available */}
            {slot.status !== "AVAILABLE" && (
              <span className="text-[8px] uppercase tracking-widest absolute bottom-2 font-bold opacity-50">
                {slot.status}
              </span>
            )}

            {/* Car Icon for Occupied */}
            {slot.status === "OCCUPIED" && (
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M2 12h12" /></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Premium Legend */}
      <div className="flex flex-wrap gap-4 mt-8 text-xs font-medium justify-center items-center bg-white/5 border border-white/5 p-4 rounded-full backdrop-blur-md w-fit mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          <span className="text-emerald-200">Available</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
          <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
          <span className="text-blue-200">EV Charging</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
          <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.8)]"></div>
          <span className="text-teal-200">Disabled</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-red-300">Occupied</span>
        </div>
      </div>
    </div>
  )
}
