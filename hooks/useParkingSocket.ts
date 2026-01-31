import { io } from "socket.io-client";
import { useEffect } from "react";

export function useParkingSocket(onUpdate: (data: any) => void) {
  useEffect(() => {
    const socket = io({ path: "/api/socket" });
    socket.on("parking:update", onUpdate);
    return () => {
      socket.disconnect();
    };
  }, [onUpdate]);
}
