"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

type WebSocketMessage = {
  type: string;
  lotId?: string;
  slotId?: string;
  status?: string;
  confidence?: number;
  updatedBy?: "AI" | "OWNER" | "CUSTOMER";
  oldStatus?: string;
  action?: string;
  updatedCount?: number;
  timestamp?: string;
  [key: string]: any;
};

type OwnerWebSocketContextType = {
  ws: WebSocket | null;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
};

const OwnerWebSocketContext = createContext<OwnerWebSocketContextType>({
  ws: null,
  isConnected: false,
  lastMessage: null,
  connect: () => { },
  disconnect: () => { },
});

export function OwnerWebSocketProvider({
  lotId,
  children,
}: {
  lotId: string;
  children: React.ReactNode;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Reconnection state
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Connect function
  const connect = useCallback(() => {
    if (!lotId || isConnectingRef.current) return;

    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("🟡 WebSocket already connected, skipping");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log("🟡 WebSocket already connecting, skipping");
      return;
    }

    isConnectingRef.current = true;
    clearTimers();

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:4000";
    console.log(`🟢 Creating WebSocket connection for owner to ${wsUrl}...`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 OWNER WS CONNECTED");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;

        // Subscribe to this parking lot
        ws.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            lotId,
            role: "OWNER",
          })
        );

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "PING" }));
          }
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log("📨 Owner received message:", data.type);
          setLastMessage(data);
        } catch (error) {
          console.error("❌ Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (event) => {
        console.error("❌ WS error occurred", event);
        isConnectingRef.current = false;
      };

      ws.onclose = (event) => {
        console.log(`🔴 WS closed (code: ${event.code}, reason: ${event.reason})`);
        setIsConnected(false);
        wsRef.current = null;
        isConnectingRef.current = false;
        clearTimers();

        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && event.code !== 1001) {
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, RECONNECT_DELAY * reconnectAttemptsRef.current); // Exponential backoff
          } else {
            console.error("❌ Max reconnection attempts reached");
          }
        }
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket:", error);
      isConnectingRef.current = false;
    }
  }, [lotId, clearTimers]);

  // Disconnect function
  const disconnect = useCallback(() => {
    clearTimers();
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS; // Prevent reconnection

    if (wsRef.current) {
      // Use code 1000 for normal closure
      wsRef.current.close(1000, "Provider unmounting");
      wsRef.current = null;
    }

    setIsConnected(false);
    isConnectingRef.current = false;
  }, [clearTimers]);

  useEffect(() => {
    if (!lotId) return;

    connect();

    // Cleanup on unmount or lotId change
    return () => {
      disconnect();
    };
  }, [lotId, connect, disconnect]);

  return (
    <OwnerWebSocketContext.Provider value={{
      ws: wsRef.current,
      isConnected,
      lastMessage,
      connect,
      disconnect
    }}>
      {children}
    </OwnerWebSocketContext.Provider>
  );
}

export function useOwnerWS() {
  return useContext(OwnerWebSocketContext);
}
