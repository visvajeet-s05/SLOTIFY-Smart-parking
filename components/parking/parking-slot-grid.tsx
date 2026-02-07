import { useState, useEffect, memo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePerformance } from "@/hooks/usePerformance"

interface ParkingSlotGridProps {
  rows: number
  cols: number
  selectedSlot?: string | null
  onSelectSlot: (slotId: string) => void
}

const ParkingSlotGrid = memo<ParkingSlotGridProps>(({ 
  rows, 
  cols, 
  selectedSlot, 
  onSelectSlot 
}) => {
  const { performance } = usePerformance()
  
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null)
  
  // Generate dummy slots based on rows and cols
  const slots = Array.from({ length: rows * cols }, (_, index) => {
    const status = index % 5 === 0 ? 'occupied' : index % 7 === 0 ? 'reserved' : 'available'
    const type = index % 10 === 0 ? 'disabled' : index % 3 === 0 ? 'bike' : 'car'
    return {
      id: `slot-${index}`,
      number: `P-${String(index + 1).padStart(3, '0')}`,
      status: status as 'available' | 'occupied' | 'reserved',
      type: type as 'car' | 'bike' | 'disabled',
      pricePerHour: type === 'bike' ? 15 : type === 'disabled' ? 20 : 25
    }
  })

  const getSlotColor = (status: string, type: string) => {
    if (status === 'occupied') return 'bg-red-500'
    if (status === 'reserved') return 'bg-yellow-500'
    if (type === 'disabled') return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getSlotLabel = (slot: any) => {
    if (slot.status === 'occupied') return 'Occupied'
    if (slot.status === 'reserved') return 'Reserved'
    return `₹${slot.pricePerHour}/hr`
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
        {slots.map((slot) => (
          <motion.button
            key={slot.id}
            className={cn(
              "p-3 rounded-lg border-2 transition-all duration-200",
              getSlotColor(slot.status, slot.type),
              slot.status === 'available' && "hover:scale-105 hover:shadow-lg",
              selectedSlot === slot.id && "ring-2 ring-primary ring-offset-2",
              hoveredSlotId === slot.id && "ring-2 ring-white ring-offset-1"
            )}
            onClick={() => slot.status === 'available' && onSelectSlot(slot.id)}
            onMouseEnter={() => setHoveredSlotId(slot.id)}
            onMouseLeave={() => setHoveredSlotId(null)}
            disabled={slot.status !== 'available'}
          >
            <div className="text-white text-xs font-medium">
              {slot.number}
            </div>
            <div className="text-white text-xs opacity-80 mt-1">
              {getSlotLabel(slot)}
            </div>
            {slot.type === 'disabled' && (
              <div className="text-white text-xs mt-1">♿</div>
            )}
          </motion.button>
        ))}
      </div>
      
      {performance && (
        <div className="text-xs text-gray-500 mt-2">
          Rendered {performance.renderCount} times
        </div>
      )}
    </div>
  )
})

ParkingSlotGrid.displayName = 'ParkingSlotGrid'

export default ParkingSlotGrid
