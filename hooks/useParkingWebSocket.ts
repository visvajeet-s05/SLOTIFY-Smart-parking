"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type MessageHandler = (data: any) => void;

interface WebSocketMessage {
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
}

export function useParkingWebSocket(
  lotId: string,
  role: "OWNER" | "CUSTOMER",
  onMessage: MessageHandler
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
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
    console.log(`🟢 Creating WebSocket connection to ${wsUrl}...`);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 WS connected");
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;

        // Subscribe to this parking lot
        ws.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            lotId,
            role,
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
          setLastMessage(data);
          onMessage(data);
        } catch (err) {
          console.error("❌ Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WS error:", err);
        isConnectingRef.current = false;
      };

      ws.onclose = (event) => {
        console.log(`🔴 WS closed (code: ${event.code}, reason: ${event.reason})`);
        setConnected(false);
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
  }, [lotId, role, onMessage, clearTimers]);

  // Disconnect function
  const disconnect = useCallback(() => {
    clearTimers();
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
    
    if (wsRef.current) {
      // Use code 1000 for normal closure
      wsRef.current.close(1000, "Component unmounting");
      wsRef.current = null;
    }
    
    setConnected(false);
    isConnectingRef.current = false;
  }, [clearTimers]);

  // Effect to manage connection
  useEffect(() => {
    if (!lotId) return;

    connect();

    // Cleanup on unmount or lotId change
    return () => {
      disconnect();
    };
  }, [lotId, connect, disconnect]);

  return { 
    connected, 
    lastMessage,
    connect,
    disconnect
  };
}
