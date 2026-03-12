import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string, onMessage: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const socket = new WebSocket(url);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          // Handle non-JSON messages
          onMessage(event.data);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
      
      socket.onerror = (error) => {
        // Enhanced error logging with detailed error information
        console.error('WebSocket error:', {
          type: error?.type,
          target: error?.target,
          currentTarget: error?.currentTarget,
          timestamp: new Date().toISOString()
        });
      };
      
      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to create WebSocket:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      setIsConnected(false);
      // Retry after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = (data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      socketRef.current.send(message);
    } else {
      console.warn('WebSocket not connected, cannot send message:', data);
    }
  };

  return {
    isConnected,
    sendMessage
  };
}

// Hook for parking updates specifically
export function useParkingWebSocket(onUpdate: (data: any) => void) {
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3000/api/ws";
  return useWebSocket(wsUrl, (data: any) => {
    if (data.type === 'parking:update') {
      onUpdate(data);
    }
  });
}
