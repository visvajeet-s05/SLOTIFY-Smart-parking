import { useEffect, useCallback } from "react"
import { io, Socket } from "socket.io-client"

interface SlotUpdate {
  slotId: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED"
  parkingAreaId: string
  timestamp: string
  source: "AI" | "OWNER" | "SYSTEM" | "BOOKING"
}

export function useSlotSocket(
  parkingAreaId: string,
  onUpdate: (update: SlotUpdate) => void
) {
  const handleUpdate = useCallback(
    (update: SlotUpdate) => {
      if (update.parkingAreaId === parkingAreaId) {
        onUpdate(update)
      }
    },
    [parkingAreaId, onUpdate]
  )

  useEffect(() => {
    const socket: Socket = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
    })

    // Join parking area room
    socket.emit("join:parking", parkingAreaId)

    // Listen for slot updates
    socket.on("slot:update", handleUpdate)
    socket.on("slot:locked", handleUpdate)
    socket.on("slot:unlocked", handleUpdate)

    // Cleanup
    return () => {
      socket.emit("leave:parking", parkingAreaId)
      socket.off("slot:update", handleUpdate)
      socket.off("slot:locked", handleUpdate)
      socket.off("slot:unlocked", handleUpdate)
      socket.disconnect()
    }
  }, [parkingAreaId, handleUpdate])
}

export default useSlotSocket
