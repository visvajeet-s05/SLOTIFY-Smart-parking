import { useEffect, useRef, useState } from 'react'

interface SlotUpdate {
  type: 'SLOT_UPDATE'
  lotId: string
  slotId: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DISABLED' | 'CLOSED'
  confidence?: number
  updatedBy?: 'AI' | 'OWNER' | 'CUSTOMER'
  timestamp: string
}

interface BulkUpdate {
  type: 'BULK_SLOT_UPDATE'
  lotId: string
  action: string
  status?: string
  updatedCount: number
  timestamp: string
}

interface HeartbeatMessage {
  type: 'HEARTBEAT'
  timestamp: string
}

interface PongMessage {
  type: 'PONG'
  timestamp: string
}

interface ConnectedMessage {
  type: 'CONNECTED'
  message: string
  timestamp: string
}

type WebSocketMessage = SlotUpdate | BulkUpdate | HeartbeatMessage | PongMessage | ConnectedMessage

interface UseParkingSocketOptions {
  lotId: string
  onSlotUpdate?: (update: SlotUpdate) => void
  onBulkUpdate?: (update: BulkUpdate) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useParkingSocket({
  lotId,
  onSlotUpdate,
  onBulkUpdate,
  onConnect,
  onDisconnect
}: UseParkingSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const onSlotUpdateRef = useRef(onSlotUpdate)
  const onBulkUpdateRef = useRef(onBulkUpdate)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)

  // Update refs when callbacks change
  useEffect(() => {
    onSlotUpdateRef.current = onSlotUpdate
    onBulkUpdateRef.current = onBulkUpdate
    onConnectRef.current = onConnect
    onDisconnectRef.current = onDisconnect
  }, [onSlotUpdate, onBulkUpdate, onConnect, onDisconnect])

  useEffect(() => {
    if (!lotId) return

    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const connect = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:4000'
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('✅ Customer portal connected to WebSocket')
          setIsConnected(true)
          onConnectRef.current?.()

          // Subscribe to this parking lot as CUSTOMER
          ws.send(JSON.stringify({
            type: 'SUBSCRIBE',
            lotId: lotId,
            role: 'CUSTOMER'
          }))

          // Start heartbeat monitoring
          heartbeatIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'PING' }))
            }
          }, 30000) // Ping every 30 seconds
        }

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data)

            if (data.type === 'SLOT_UPDATE') {
              // Only process updates for this parking lot
              if (data.lotId === lotId) {
                console.log(`📝 Customer received slot update: ${data.slotId} -> ${data.status}`)
                onSlotUpdateRef.current?.(data)
              }
            } else if (data.type === 'BULK_SLOT_UPDATE') {
              // Only process bulk updates for this parking lot
              if (data.lotId === lotId) {
                console.log(`📦 Customer received bulk update: ${data.action} (${data.updatedCount} slots)`)
                onBulkUpdateRef.current?.(data)
              }
            } else if (data.type === 'HEARTBEAT') {
              setLastHeartbeat(new Date())
            } else if (data.type === 'PONG') {
              setLastHeartbeat(new Date())
            } else if (data.type === 'CONNECTED') {
              console.log('🔗 WebSocket connection confirmed')
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('⚠️ Customer portal disconnected from WebSocket')
          setIsConnected(false)
          onDisconnectRef.current?.()

          // Clear heartbeat interval
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current)
            heartbeatIntervalRef.current = null
          }

          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...')
            connect()
          }, 5000)
        }

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
        }

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error)
      }
    }

    connect()

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      setIsConnected(false)
    }
  }, [lotId])

  return {
    isConnected,
    lastHeartbeat
  }
}
