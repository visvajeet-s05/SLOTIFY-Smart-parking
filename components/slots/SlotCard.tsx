import { cn } from "@/lib/utils"

type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED"

interface SlotCardProps {
  id: string
  status: SlotStatus
  confidence?: number
  mode?: "customer" | "owner"
  onClick?: () => void
  onStatusChange?: (status: SlotStatus) => void
}

const statusStyles = {
  AVAILABLE: "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
  OCCUPIED: "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
  RESERVED: "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200",
  DISABLED: "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
}

const statusLabels = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  DISABLED: "Disabled"
}

export function SlotCard({
  id,
  status,
  confidence,
  mode = "customer",
  onClick,
  onStatusChange
}: SlotCardProps) {
  const handleClick = () => {
    if (mode === "customer") {
      onClick?.()
    } else if (mode === "owner") {
      // Cycle through statuses for owner
      const statuses: SlotStatus[] = ["AVAILABLE", "OCCUPIED", "RESERVED", "DISABLED"]
      const currentIndex = statuses.indexOf(status)
      const nextStatus = statuses[(currentIndex + 1) % statuses.length]
      onStatusChange?.(nextStatus)
    }
  }

  return (
    <div
      className={cn(
        "relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 min-h-[80px] flex flex-col justify-between",
        statusStyles[status],
        mode === "owner" && "hover:scale-105"
      )}
      onClick={handleClick}
    >
      <div className="text-sm font-medium">
        {id}
      </div>

      <div className="text-xs">
        {statusLabels[status]}
      </div>

      {mode === "owner" && confidence !== undefined && (
        <div className="text-xs opacity-75 mt-1">
          {Math.round(confidence * 100)}% confidence
        </div>
      )}
    </div>
  )
}
