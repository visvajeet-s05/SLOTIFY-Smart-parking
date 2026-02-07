"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import SlotCard from "./SlotCard";

type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED";
type SlotSource = "AI" | "OWNER" | "SYSTEM" | "BOOKING";

type Slot = {
  id: string;
  slotNumber: number;
  status: SlotStatus;
  confidence?: number;
  source?: SlotSource;
};

export default function SlotGrid() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    fetch("/api/parking/chennai-central/slots")
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch slots:", err);
        setIsLoading(false);
      });

    // Use Socket.io for better connection handling
    const socket = io({ path: "/api/socket" });

    socket.on("connect", () => {
      console.log("✅ Owner SlotGrid connected to WebSocket");
      setWsConnected(true);
    });

    socket.on("slot:update", (update) => {
      setSlots((prev) =>
        prev.map((s) =>
          s.slotNumber === update.slotNumber ? { ...s, ...update } : s
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Owner SlotGrid disconnected from WebSocket");
      setWsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.log("⚠️ WebSocket connection failed (non-critical):", err.message);
      setWsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-8 gap-4">
      {slots.map((slot) => (
        <SlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
