import { useEffect, useState, useCallback } from "react"

type Slot = {
  id: string
  slotNumber: number
  row: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED"
  aiConfidence: number
  updatedBy: "AI" | "OWNER" | "CUSTOMER"
  updatedAt: string
  price: number
  slotType?: string
}

export function useSlots(lotId: string) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)

  // Fetch initial slots
  useEffect(() => {
    fetch(`/api/parking/${lotId}/slots`)
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch slots:", err)
        setIsLoading(false)
      })
  }, [lotId])

  // WebSocket for real-time updates
  useEffect(() => {
    let ws: WebSocket
    let reconnectTimeout: NodeJS.Timeout

    const connectWebSocket = () => {
      ws = new WebSocket("ws://localhost:4000")

      ws.onopen = () => {
        console.log("✅ Connected to WebSocket")
        setWsConnected(true)
        
        // Subscribe to lot updates as a customer (Server requires this!)
        ws.send(JSON.stringify({ type: "SUBSCRIBE", lotId, role: "CUSTOMER" }))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        // STEP 5: Update UI in Real-Time
        if (data.type === "SLOT_UPDATE") {
          console.log("Live Update:", data)
          setSlots(prev => prev.map(slot => {
            // STEP 3: Handle Data format properly by matching either DB slotId OR AI slotNumber
            const isMatch = (data.slotId && slot.id === data.slotId) || 
                            (data.slotNumber !== undefined && slot.slotNumber === data.slotNumber);
            
            if (isMatch) {
              return { ...slot, status: data.status }
            }
            return slot
          }))
        }
      }

      ws.onclose = () => {
        console.log("⚠️ Disconnected from WebSocket")
        setWsConnected(false)
        
        // STEP 6: Add Auto Reconnect (VERY IMPORTANT)
        console.log("Reconnecting...")
        reconnectTimeout = setTimeout(connectWebSocket, 2000)
      }
    }

    connectWebSocket()

    return () => {
      clearTimeout(reconnectTimeout)
      if (ws) ws.close()
    }
  }, [lotId])

  // Book a slot (customer)
  const bookSlot = useCallback(async (slot: Slot) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          lotId: lotId,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        })
      })

      if (response.ok) {
        // Optimistic update
        setSlots(prev => prev.map(s => 
          s.id === slot.id ? { ...s, status: "RESERVED" } : s
        ))
        return true
      }
      return false
    } catch (error) {
      console.error("Booking error:", error)
      return false
    }
  }, [lotId])

  // Update slot status (owner)
  const updateSlot = useCallback(async (target: string | number, status: string) => {
    try {
      const response = await fetch("/api/owner/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lotId, 
          target, 
          status,
          source: "OWNER"
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update all affected slots
        if (result.updatedSlots) {
          setSlots(prev => prev.map(slot => {
            const wasUpdated = result.updatedSlots.some((s: any) => s.id === slot.id)
            if (wasUpdated) {
              return { ...slot, status: status as any, updatedBy: "OWNER" }
            }
            return slot
          }))
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Update error:", error)
      return false
    }
  }, [lotId])

  // Update single slot
  const updateSingleSlot = useCallback(async (slotId: string, status: string) => {
    try {
      const response = await fetch("/api/owner/slots/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lotSlug: lotId,
          slotNumber: parseInt(slotId.split('-').pop() || '0'),
          status,
          source: "OWNER"
        })
      })

      if (response.ok) {
        setSlots(prev => prev.map(slot => 
          slot.id === slotId ? { ...slot, status: status as any, updatedBy: "OWNER" } : slot
        ))
        return true
      }
      return false
    } catch (error) {
      console.error("Single slot update error:", error)
      return false
    }
  }, [lotId])

  return { 
    slots, 
    isLoading, 
    wsConnected, 
    bookSlot, 
    updateSlot,
    updateSingleSlot,
    setSlots 
  }
}
