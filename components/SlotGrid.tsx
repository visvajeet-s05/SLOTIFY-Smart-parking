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
  const getSlotColor = (status: string, slotType?: string) => {
    if (status === "AVAILABLE") {
      if (slotType === "EV") return "bg-blue-500 hover:bg-blue-600"
      if (slotType === "DISABLED") return "bg-teal-500 hover:bg-teal-600"
      return "bg-green-500 hover:bg-green-600"
    }
    if (status === "OCCUPIED") return "bg-red-600"
    if (status === "RESERVED") return "bg-yellow-500"
    if (status === "DISABLED") return "bg-gray-600"
    if (status === "CLOSED") return "bg-black border-2 border-red-500"
    return "bg-gray-600"

  }

  const getSlotIcon = (slotType?: string) => {
    if (slotType === "EV") return "⚡"
    if (slotType === "DISABLED") return "♿"
    return ""
  }

  return (
    <div className="space-y-4">
      {/* Slot Grid - 8 slots per row (classic design) */}
      <div className="grid grid-cols-8 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.id}
            disabled={!selectable || slot.status !== "AVAILABLE"}
            onClick={() => onSelect?.(slot)}
            className={`
              h-24 rounded-xl font-bold text-sm relative flex flex-col items-center justify-center
              ${getSlotColor(slot.status, slot.slotType)}
              ${selectable && slot.status === "AVAILABLE" ? "cursor-pointer transform hover:scale-105 transition-all shadow-lg" : "cursor-not-allowed opacity-80"}
              text-white
            `}
          >
            {/* Slot Type Icon (top-left) */}
            {slot.slotType && slot.slotType !== "REGULAR" && (
              <span className="absolute top-1 left-1 text-xs">
                {getSlotIcon(slot.slotType)}
              </span>
            )}
            
            {/* Slot Number */}
            <span className="text-lg font-bold">S{slot.slotNumber}</span>



            
            {/* Price */}
            <span className="text-xs mt-1 font-semibold">₹{slot.price}</span>
            
            {/* Status indicator for non-available */}
            {slot.status !== "AVAILABLE" && (
              <span className="text-[10px] absolute bottom-1 opacity-80">
                {slot.status}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-6 text-sm justify-center bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-lg"></div>
          <span className="text-gray-300">Regular (₹35-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
          <span className="text-gray-300">EV ⚡ (1.3x)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-teal-500 rounded-lg"></div>
          <span className="text-gray-300">Disabled ♿ (0.8x)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded-lg"></div>
          <span className="text-gray-300">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded-lg"></div>
          <span className="text-gray-300">Reserved</span>
        </div>
      </div>
    </div>
  )
}
