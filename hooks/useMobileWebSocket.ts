import { useEffect, useState, useRef, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseMobileWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  batteryAware?: boolean;
}

export function useMobileWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  reconnectAttempts = 10,
  reconnectInterval = 3000,
  batteryAware = true,
}: UseMobileWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batteryRef = useRef<any>(null);

  // Get battery status if available
  useEffect(() => {
    if (batteryAware && "getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryRef.current = battery;
        
        const updateBatteryInfo = () => {
          setBatteryLevel(battery.level * 100);
          setIsLowPowerMode(battery.level < 0.2 || battery.charging === false);
        };

        updateBatteryInfo();
        
        battery.addEventListener("levelchange", updateBatteryInfo);
        battery.addEventListener("chargingchange", updateBatteryInfo);

        return () => {
          battery.removeEventListener("levelchange", updateBatteryInfo);
          battery.removeEventListener("chargingchange", updateBatteryInfo);
        };
      });
    }
  }, [batteryAware]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("✅ Mobile WebSocket connected");
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // In low power mode, throttle updates
          if (isLowPowerMode && data.type === "parking:update") {
            // Only process every 3rd update in low power mode
            if (Math.random() > 0.33) {
              onMessage?.(data);
            }
          } else {
            onMessage?.(data);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("❌ Mobile WebSocket disconnected");
        setIsConnected(false);
        onDisconnect?.();

        // Attempt reconnection with exponential backoff
        if (reconnectCountRef.current < reconnectAttempts) {
          const delay = Math.min(
            reconnectInterval * Math.pow(2, reconnectCountRef.current),
            30000 // Max 30 seconds
          );
          
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current + 1}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("Mobile WebSocket error:", error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [url, onMessage, onConnect, onDisconnect, reconnectAttempts, reconnectInterval, isLowPowerMode]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Send message
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Visibility change handler (pause when backgrounded)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is backgrounded - reduce update frequency
        console.log("📱 App backgrounded - reducing WebSocket activity");
      } else {
        // App is foregrounded - resume normal operation
        console.log("📱 App foregrounded - resuming WebSocket activity");
        if (!isConnected) {
          connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connect, isConnected]);

  return {
    isConnected,
    batteryLevel,
    isLowPowerMode,
    connect,
    disconnect,
    sendMessage,
  };
}

// Hook specifically for parking updates
export function useParkingMobileSocket(onUpdate: (data: any) => void) {
  return useMobileWebSocket({
    url: "ws://localhost:4000",
    onMessage: onUpdate,
    batteryAware: true,
    reconnectAttempts: 15,
    reconnectInterval: 2000,
  });
}
